require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const nodemailer       = require("nodemailer");
const Twilio           = require("twilio");

const prisma = new PrismaClient();
const mailer = nodemailer.createTransport({
  host:    process.env.SMTP_HOST,
  port:    +process.env.SMTP_PORT,
  secure:  false, 
  auth:    {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function checkAndSend() {
  const now = new Date();
  const due = await prisma.irrigationSchedule.findMany({
    where: { reminderAt: { lte: now }, notified: false },
    include: { user: true },
  });

  for (const rec of due) {
    const { user, scheduleAt, id } = rec;

    await mailer.sendMail({
      from:    process.env.SMTP_FROM,
      to:      user.email,
      subject: "⏰ Irrigation Reminder",
      text: `
      Hello ${user.name},This is your 30-minute reminder to irrigate at ${new Date(scheduleAt).toLocaleString()}.– Your Decision Support System`,
    });

    if (user.phone) {
      await twilio.messages.create({
        from: process.env.TWILIO_FROM,
        to:   user.phone,
        body: `Reminder: irrigate at ${new Date(scheduleAt).toLocaleTimeString()}.`,
      });
    }

    
    await prisma.irrigationSchedule.update({
      where: { id },
      data:  { notified: true },
    });
  }
}


checkAndSend().catch(console.error);
setInterval(checkAndSend, 60 * 1000);