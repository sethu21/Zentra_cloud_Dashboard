import prisma from "../lib/prisma";

export const getExistingSensorData = async (start, end) => {
  return await prisma.etReading.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
  });
};

export const getStoredTimestamps = async (start, end) => {
  const timestamps = await prisma.etReading.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
    select: { timestamp: true },
  });

  return timestamps.map((r) => r.timestamp.toISOString());
};