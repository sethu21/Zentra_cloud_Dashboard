import prisma from "../lib/prisma";

export const insertNewSensorData = async (readings) => {
  if (!readings.length) return;
  await prisma.etReading.createMany({ data: readings });
};