import { NextResponse } from "next/server";
import { authOptions }    from "../../auth/[...nextauth]/route";
import { prisma }  from "@/lib/prisma";

export async function POST(request) {

  const session = await unstable_getServerSession(authOptions);
   if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
   }

  const { scheduleAt } = await request.json();
  const scheduleDate  = new Date(scheduleAt);
  const reminderDate  = new Date(scheduleDate.getTime() - 30 * 60 * 1000);

  const user = await prisma.user.findUnique({
     where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.irrigationSchedule.create({
    data: {
      userId:     user.id,
      scheduleAt: scheduleDate,
      reminderAt: reminderDate,
    },
  });

  return NextResponse.json({ ok: true });
}
