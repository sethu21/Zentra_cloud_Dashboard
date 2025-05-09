// processReadings.js

/**export function cleanTimestamps(data) {
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  const unique = [];
  for (const e of data) {
    const iso = new Date(e.timestamp).toISOString();
    if (!seen.has(iso)) {
      seen.add(iso);
      unique.push(e);
    }
  }
  return unique.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function compressByInterval(entries, intervalLabel, rangeStart, rangeEnd) {
  if (!entries?.length) return [];

  const minutes = { "5min":5, "1hour":60, "8hours":480, "12hours":720, "24hours":1440 };
  const bucketSizeMs = (minutes[intervalLabel]||5) * 60_000;
  const startMs = new Date(`${rangeStart}T00:00:00Z`).getTime();
  const endMs   = new Date(`${rangeEnd}T23:59:59Z`).getTime();

  // filter + sort
  const filtered = entries
    .filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= startMs && t <= endMs;
    })
    .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (!filtered.length) return [];

  const base = new Date(filtered[0].timestamp).getTime();
  const buckets = {};
  for (const e of filtered) {
    const t = new Date(e.timestamp).getTime();
    const key = new Date(
      Math.floor((t - base)/bucketSizeMs)*bucketSizeMs + base
    ).toISOString();
    (buckets[key] ||= []).push(e);
  }

  // helper to grab last entry’s port value
  const last = arr => arr[arr.length-1];

  return Object.entries(buckets)
    .map(([ts, grp]) => ({
      timestamp: ts,
      p1_wc: last(grp).port1_wc,
      p2_wc: last(grp).port2_wc,
      p3_wc: last(grp).port3_wc,
      p4_wc: last(grp).port4_wc,
      p5_wc: last(grp).port5_wc,
      p6_wc: last(grp).port6_wc,
    }))
    .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function estimateETByPort(entries, fieldName, sensorDepth) {
  if (!Array.isArray(entries) || entries.length===0) return [];
  const tol = 0.001;
  const et = [0];
  for (let i=1; i<entries.length; i++) {
    const p = entries[i-1][fieldName]||0;
    const c = entries[i][fieldName]  ||0;
    const d = p - c;
    et.push(d>tol ? d*sensorDepth : 0);
  }
  return et;
}

export function estimateTotalET(entries, mesocosm='Mesocosm1') {
  if (!Array.isArray(entries) || entries.length===0) return [];
  const cfg = mesocosm==='Mesocosm1'
    ? [ ['p1_wc',200], ['p2_wc',150], ['p3_wc',150] ]
    : [ ['p4_wc',200], ['p5_wc',150], ['p6_wc',150] ];
  const portETs = cfg.map(([f,d])=> estimateETByPort(entries,f,d));
  return entries.map((_,i)=>
    portETs.reduce((sum,arr)=> sum + (arr[i]||0), 0)
  );
}**/

/**
 * Deduplicate and sort sensor readings by timestamp.
 * @param {Array} data - Raw sensor readings with a 'timestamp' field.
 * @returns {Array} Sorted, de-duplicated readings.
 */
export function cleanTimestamps(data) {
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  const unique = [];
  for (const e of data) {
    const iso = new Date(e.timestamp).toISOString();
    if (!seen.has(iso)) {
      seen.add(iso);
      unique.push(e);
    }
  }
  return unique.sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );
}

/**
 * Bucket raw readings into time intervals.
 * @param {Array} entries - Cleaned readings.
 * @param {string} intervalLabel - "5min" | "1hour" | "8hours" | "12hours" | "24hours".
 * @param {string} rangeStart - "YYYY-MM-DD"
 * @param {string} rangeEnd   - "YYYY-MM-DD"
 * @returns {Array<{ timestamp: string; readings: Array }>} One bucket per interval.
 */
export function compressByInterval(entries, intervalLabel, rangeStart, rangeEnd) {
  if (!entries?.length) return [];

  const minutesMap = {
    "5min": 5,
    "1hour": 60,
    "8hours": 480,
    "12hours": 720,
    "24hours": 1440,
  };
  const bucketSizeMs = (minutesMap[intervalLabel] || 5) * 60_000;
  const startMs = new Date(`${rangeStart}T00:00:00Z`).getTime();
  const endMs   = new Date(`${rangeEnd}T23:59:59Z`).getTime();

  const filtered = entries
    .filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= startMs && t <= endMs;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (!filtered.length) return [];

  const base = new Date(filtered[0].timestamp).getTime();
  const buckets = {};
  for (const e of filtered) {
    const t = new Date(e.timestamp).getTime();
    const idx = Math.floor((t - base) / bucketSizeMs);
    const key = new Date(base + idx * bucketSizeMs).toISOString();
    (buckets[key] ||= []).push(e);
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([bucketTs, grp]) => ({ timestamp: bucketTs, readings: grp }));
}

/**
 * Calculate per-interval ET summing every drop within each bucket
 * plus the drop from the last reading of the previous bucket.
 * @param {Array<{ timestamp: string; readings: Array }>} buckets
 * @param {"Mesocosm1"|"Mesocosm2"} mesocosm
 * @returns {Array<{ timestamp: string; et: number }>}
 */
export function estimateTotalETByInterval(
  buckets,
  intervalLabel,
  rangeStart,
  rangeEnd,
  mesocosm = "Mesocosm1"
) {
  if (!Array.isArray(buckets) || buckets.length === 0) return [];

  // Determine port depths
  const layers = mesocosm === "Mesocosm1"
    ? { p1: 200, p2: 150, p3: 150 }
    : { p4: 200, p5: 150, p6: 150 };
  const tol = 0.001;

  let prevLastReadings = null;

  return buckets.map(({ timestamp, readings }) => {
    let etSum = 0;
    // Include the drop from the end of previous bucket to the start of this one
    if (prevLastReadings) {
      for (const [port, thick] of Object.entries(layers)) {
        const key = `${port}_wc`;
        const prevVal = prevLastReadings[key] || 0;
        const firstVal = readings[0][key] || 0;
        const d = prevVal - firstVal;
        if (d > tol) etSum += d * thick;
      }
    }
    // Sum all intra-bucket drops
    for (const [port, thick] of Object.entries(layers)) {
      const key = `${port}_wc`;
      for (let i = 1; i < readings.length; i++) {
        const prev = readings[i - 1][key] || 0;
        const curr = readings[i][key]   || 0;
        const d = prev - curr;
        if (d > tol) etSum += d * thick;
      }
    }
    // Store last for next iteration
    prevLastReadings = readings[readings.length - 1];
    return { timestamp, et: etSum };
  });
}

/**
 * Compute ET per-port using bucket-end comparisons.
 * @param {Array<{ timestamp: string; pX_wc: number }>} entries
 * @param {string} fieldName - e.g. "p1_wc"
 * @param {number} sensorDepth - layer thickness in mm
 * @returns {number[]}
 */
export function estimateETByPort(entries, fieldName, sensorDepth) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const tol = 0.001;
  const et = [0];
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1][fieldName] || 0;
    const curr = entries[i][fieldName]     || 0;
    const d = prev - curr;
    et.push(d > tol ? d * sensorDepth : 0);
  }
  return et;
}

export function estimateTotalET(entries, mesocosm = "Mesocosm1") {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const cfg = mesocosm === "Mesocosm1"
    ? [ ["p1_wc",200], ["p2_wc",150], ["p3_wc",150] ]
    : [ ["p4_wc",200], ["p5_wc",150], ["p6_wc",150] ];
  const portETs = cfg.map(([f,d]) => estimateETByPort(entries, f, d));
  return entries.map((_,i) =>
    portETs.reduce((sum, arr) => sum + (arr[i] || 0), 0)
  );
}

