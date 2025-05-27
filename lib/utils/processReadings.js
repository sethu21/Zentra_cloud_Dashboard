// trying to just remove any repeats from the logs before we chart them or whatever
export function cleanTimestamps(rawSensorStuff) {
    if (!Array.isArray(rawSensorStuff)) return [];
    const foundTimestamps = new Set();
    const thingsToKeep = [];

    for (let i = 0; i < rawSensorStuff.length; i++) {
        const entry = rawSensorStuff[i];
        const standardTime = new Date(entry.timestamp).toISOString();
        if (!foundTimestamps.has(standardTime)) {
            foundTimestamps.add(standardTime);
            thingsToKeep.push(entry);
        }
    }

    // make sure everything's in time order (just in case)
    return thingsToKeep.sort((one, another) => new Date(one.timestamp) - new Date(another.timestamp));
}


// chops up the raw logs into blocks of like 5 mins or whatever
export function compressByInterval(logEntries, sizeLabel, firstDay, lastDay) {
    if (!logEntries || logEntries.length === 0) return [];

    const sizeMap = {
        "5min": 5,
        "1hour": 60,
        "8hours": 480,
        "12hours": 720,
        "24hours": 1440,
    };

    const chunkLength = (sizeMap[sizeLabel] || 5) * 60 * 1000;
    const startT = new Date(firstDay + "T00:00:00Z").getTime();
    const endT = new Date(lastDay + "T23:59:59Z").getTime();

    const cleaned = logEntries
        .filter(x => {
            const t = new Date(x.timestamp).getTime();
            return t >= startT && t <= endT;
        })
        .sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp));

    if (cleaned.length === 0) return [];

    const anchor = new Date(cleaned[0].timestamp).getTime();
    const boxMap = {};

    for (const piece of cleaned) {
        const ms = new Date(piece.timestamp).getTime();
        const bucketNum = Math.floor((ms - anchor) / chunkLength);
        const bucketKey = new Date(anchor + bucketNum * chunkLength).toISOString();
        if (!boxMap[bucketKey]) boxMap[bucketKey] = [];
        boxMap[bucketKey].push(piece);
    }

    return Object.entries(boxMap)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([when, group]) => ({ timestamp: when, readings: group }));
}


// estimates how much water evaporated in each block, includes logic for diff between buckets
export function estimateTotalETByInterval(bucketsWithData, label, fromDay, toDay, setup = "Mesocosm1") {
    if (!Array.isArray(bucketsWithData) || bucketsWithData.length === 0) return [];

    const depths = setup === "Mesocosm1"
        ? { p1: 200, p2: 150, p3: 150 }
        : { p4: 200, p5: 150, p6: 150 };

    const wiggleRoom = 0.001;
    let previousEnd = null;

    return bucketsWithData.map(({ timestamp, readings }) => {
        let sumET = 0;

        if (previousEnd) {
            for (let portKey in depths) {
                const depthVal = depths[portKey];
                const before = previousEnd[`${portKey}_wc`] || 0;
                const after = readings[0][`${portKey}_wc`] || 0;
                const loss = before - after;
                if (loss > wiggleRoom) sumET += loss * depthVal;
            }
        }

        for (let portKey in depths) {
            const dep = depths[portKey];
            for (let i = 1; i < readings.length; i++) {
                const oldVal = readings[i - 1][`${portKey}_wc`] || 0;
                const newVal = readings[i][`${portKey}_wc`] || 0;
                const drop = oldVal - newVal;
                if (drop > wiggleRoom) sumET += drop * dep;
            }
        }

        previousEnd = readings[readings.length - 1];
        return { timestamp, et: sumET };
    });
}


// calculates port-level ET change between readings in a sequence
export function estimateETByPort(listOfRecords, keyName, depthMm) {
    if (!Array.isArray(listOfRecords) || listOfRecords.length === 0) return [];

    const drops = [0];
    const minDiff = 0.001;

    for (let i = 1; i < listOfRecords.length; i++) {
        const earlier = listOfRecords[i - 1][keyName] || 0;
        const now = listOfRecords[i][keyName] || 0;
        const change = earlier - now;
        drops.push(change > minDiff ? change * depthMm : 0);
    }

    return drops;
}


// just adds up all the port ETs into one combined ET reading
export function estimateTotalET(allReadings, who = "Mesocosm1") {
    if (!Array.isArray(allReadings) || allReadings.length === 0) return [];

    const list = who === "Mesocosm1"
        ? [["p1_wc", 200], ["p2_wc", 150], ["p3_wc", 150]]
        : [["p4_wc", 200], ["p5_wc", 150], ["p6_wc", 150]];

    const portValues = list.map(([col, depth]) => estimateETByPort(allReadings, col, depth));

    return allReadings.map((_, i) =>
        portValues.reduce((total, arr) => total + (arr[i] || 0), 0)
    );
}
