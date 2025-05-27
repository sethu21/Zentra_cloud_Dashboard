import { retryZentraFetch } from "@/utils/retryZentraFetch";
import { groupSensorReadings } from "@/lib/groupSensorReadings";
import { getExistingSensorData, getStoredTimestamps } from "@/lib/checkExistingReadings";
import { insertNewSensorData } from "@/lib/insertNewReadings";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const todayStr = new Date().toISOString().split("T")[0];

        // pull dates from query string or default to today
        const fromRaw = searchParams.get("start_date") || `${todayStr} 00:00`;
        const toRaw = searchParams.get("end_date") || `${todayStr} 23:59`;
        const from = new Date(fromRaw.replace(" ", "T"));
        const to = new Date(toRaw.replace(" ", "T"));

        const forceCall = searchParams.get("force_api") === "true";

        // if we already have data saved, no need to hit the API unless force=true
        const cached = await getExistingSensorData(from, to);
        if (!forceCall && cached.length > 0) {
            return NextResponse.json({ data: cached });
        }

        const serial = "z6-21087";
        const token = process.env.ZENTRA_API_TOKEN;

        const apiUrl = `https://zentracloud.com/api/v4/get_readings/?device_sn=${serial}&start_date=${encodeURIComponent(fromRaw)}&end_date=${encodeURIComponent(toRaw)}&output_format=json&sort_by=descending&page_num=1&per_page=1000&device_depth=true`;

        const res = await retryZentraFetch(apiUrl, token);

        const rawStuff = res.data?.data;
        if (!rawStuff || Object.keys(rawStuff).length === 0) {
            return NextResponse.json({ data: [] });
        }

        const cleaned = groupSensorReadings(rawStuff);
        const knownTimes = await getStoredTimestamps(from, to);

        // only keep readings that aren't already stored
        const freshOnes = cleaned.filter(
            (x) => !knownTimes.includes(x.timestamp.toISOString())
        );

        if (freshOnes.length > 0) {
            await insertNewSensorData(freshOnes);
        }

        return NextResponse.json({ data: [...cached, ...freshOnes] });

    } catch (err) {
        console.error("something broke while pulling sensor data:", err.message);
        return NextResponse.json({ error: err.message || "server-side issue" }, { status: 500 });
    }
}
