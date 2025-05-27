import prisma from "../lib/prisma";

// gets sensor readings between two dates (used in dashboard mostly)
export const getExistingSensorData = async (fromDate, toDate) => {
    try {
        const found = await prisma.etReading.findMany({
            where: {
                timestamp: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
        });

        // console.log("Fetched sensor data:", found.length);
        return found;
    } catch (err) {
        console.error("DB error when pulling sensor data", err);
        throw err;
    }
};


// grabs just timestamps (to avoid storing duplicates later on)
export const getStoredTimestamps = async (fromDate, toDate) => {
    try {
        const justTimes = await prisma.etReading.findMany({
            where: {
                timestamp: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            select: {
                timestamp: true,
            },
        });

        // change Date objects into ISO strings so we can compare them easier
        return justTimes.map(item => item.timestamp.toISOString());
    } catch (err) {
        console.error("Failed to fetch timestamps only", err);
        return [];
    }
};
