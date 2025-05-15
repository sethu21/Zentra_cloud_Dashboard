import { NextResponse } from "next/server";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions }                from "../../auth/[...nextauth]/route";
import { prisma }                     from "@/lib/prisma";

export async function POST(request) {
  // 1) get  NextAuth session
  const session = await unstable_getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) parse the scheduleAt posted
  const { scheduleAt } = await request.json();
  const scheduleDate  = new Date(scheduleAt);
  const reminderDate  = new Date(scheduleDate.getTime() - 30 * 60 * 1000);

  // 3) find User record
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 4) create the reminder
  await prisma.irrigationSchedule.create({
    data: {
      userId:     user.id,
      scheduleAt: scheduleDate,
      reminderAt: reminderDate,
    },
  });

  return NextResponse.json({ ok: true });
}
