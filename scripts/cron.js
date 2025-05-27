require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const Twilio = require("twilio");

const db = new PrismaClient();

// basic SMTP mail sender setup (seems to work fine)
const emailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// SMS via Twilio (credits may run out quick so check balance)
const sms = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// main job to scan DB and send any reminders due now-ish
async function checkAndSend() {
    const nowTime = new Date();

    const tasks = await db.irrigationSchedule.findMany({
        where: {
            reminderAt: {
                lte: nowTime
            },
            notified: false,
        },
        include: {
            user: true
        }
    });

    for (const task of tasks) {
        const { user, scheduleAt, id } = task;

        // send email
        try {
            await emailer.sendMail({
                from: process.env.SMTP_FROM,
                to: user.email,
                subject: "⏰ Irrigation Reminder",
                text: `Hey ${user.name}, don't forget to irrigate around ${new Date(scheduleAt).toLocaleString()}. This is your 30-min heads-up from DSS.`,
            });
        } catch (mailErr) {
            console.error("email issue:", mailErr.message);
        }

        // if phone is available, also SMS them
        if (user.phone) {
            try {
                await sms.messages.create({
                    from: process.env.TWILIO_FROM,
                    to: user.phone,
                    body: `Irrigation time soon: ${new Date(scheduleAt).toLocaleTimeString()}`,
                });
            } catch (smsErr) {
                console.error("sms issue:", smsErr.message);
            }
        }

        // flag this reminder as done so we don't spam
        await db.irrigationSchedule.update({
            where: { id },
            data: { notified: true },
        });
    }
}


// run right away once, then every minute
checkAndSend().catch(err => {
    console.error("initial run failed:", err.message);
});
setInterval(checkAndSend, 60 * 1000);
