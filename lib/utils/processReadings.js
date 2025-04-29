export function cleanTimestamps(data) {
  if (!Array.isArray(data)) return [];

  const seenTimestamps = new Set();
  const uniqueEntries = [];

  for (const entry of data) {
    const timestampISO = new Date(entry.timestamp).toISOString();
    if (!seenTimestamps.has(timestampISO)) {
      seenTimestamps.add(timestampISO);
      uniqueEntries.push(entry);
    }
  }

  return uniqueEntries.sort(
    (entryA, entryB) => new Date(entryA.timestamp) - new Date(entryB.timestamp)
  );
}

export function compressByInterval(entries, intervalLabel, rangeStart, rangeEnd) {
  if (!entries?.length) return [];

  const intervalMinutes = {
    "5min": 5,
    "1hour": 60,
    "8hours": 480,
    "12hours": 720,
    "24hours": 1440,
  }[intervalLabel] || 5;

  const bucketSizeMs = intervalMinutes * 60 * 1000;
  const startTime = new Date(`${rangeStart}T00:00:00Z`).getTime();
  const endTime = new Date(`${rangeEnd}T23:59:59Z`).getTime();

  const filteredEntries = entries
    .filter((entry) => {
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime >= startTime && entryTime <= endTime;
    })
    .sort((entryA, entryB) => new Date(entryA.timestamp) - new Date(entryB.timestamp));

  const baseTime = new Date(filteredEntries[0]?.timestamp || 0).getTime();
  const buckets = {};

  for (const entry of filteredEntries) {
    const entryTime = new Date(entry.timestamp).getTime();
    const bucketKey = new Date(
      Math.floor((entryTime - baseTime) / bucketSizeMs) * bucketSizeMs + baseTime
    ).toISOString();

    if (!buckets[bucketKey]) buckets[bucketKey] = [];
    buckets[bucketKey].push(entry);
  }

  const result = [];
  for (const [bucketTime, group] of Object.entries(buckets)) {
    result.push({
      timestamp: bucketTime,
      p1_wc: average(group.map((entry) => entry.port1_wc)),
      p2_wc: average(group.map((entry) => entry.port2_wc)),
      p3_wc: average(group.map((entry) => entry.port3_wc)),
      p4_wc: average(group.map((entry) => entry.port4_wc)),
      p5_wc: average(group.map((entry) => entry.port5_wc)),
      p6_wc: average(group.map((entry) => entry.port6_wc)),
    });
  }

  return result.sort((entryA, entryB) => new Date(entryA.timestamp) - new Date(entryB.timestamp));
}

export function estimateETByPort(entries, fieldName, sensorDepth) {
  if (!Array.isArray(entries) || entries.length === 0) return [];

  const tol = 0.001;
  const result = [0];

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1][fieldName] || 0;
    const curr = entries[i    ][fieldName] || 0;
    const delta = prev - curr;
    result.push(delta > tol ? delta * sensorDepth : 0);
  }

  return result;
}


export function estimateTotalET(entries, mesocosm = 'Mesocosm1') {
  if (!Array.isArray(entries) || entries.length === 0) return [];

  // pick ports & depths
  const config = mesocosm === 'Mesocosm1'
    ? [ ["p1_wc", 200], ["p2_wc", 150], ["p3_wc", 150] ]
    : [ ["p4_wc", 200], ["p5_wc", 150], ["p6_wc", 150] ];

  // compute each port’s per-interval ET
  const portETs = config.map(
    ([field, depth]) => estimateETByPort(entries, field, depth)
  );

  // zip & sum them
  const total = entries.map((_, i) =>
    portETs.reduce((sum, arr) => sum + (arr[i] || 0), 0)
  );

  return total;
}



function average(values) {
  const validValues = values.filter((value) => typeof value === "number");
  if (!validValues.length) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}
