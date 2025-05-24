import { retryZentraFetch } from "@/utils/retryZentraFetch";
import { groupSensorReadings } from "@/lib/groupSensorReadings";
import { getExistingSensorData, getStoredTimestamps } from "@/lib/checkExistingReadings";
import { insertNewSensorData } from "@/lib/insertNewReadings";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().split("T")[0];

    const startRaw = searchParams.get("start_date") || `${today} 00:00`;
    const endRaw = searchParams.get("end_date") || `${today} 23:59`;
    const start = new Date(startRaw.replace(" ", "T"));
    const end = new Date(endRaw.replace(" ", "T"));

    const forceAPI = searchParams.get("force_api") === "true";
    const existingData = await getExistingSensorData(start, end);

    if (!forceAPI && existingData.length) {
      return NextResponse.json({ data: existingData });
    }

    const deviceSN = "z6-21087"; // adjust as needed
    const token = process.env.ZENTRA_API_TOKEN;

    const apiUrl = `https://zentracloud.com/api/v4/get_readings/?device_sn=${deviceSN}&start_date=${encodeURIComponent(
      startRaw
    )}&end_date=${encodeURIComponent(endRaw)}&output_format=json&sort_by=descending&page_num=1&per_page=1000&device_depth=true`;

    const response = await retryZentraFetch(apiUrl, token);

    const raw = response.data?.data;
    if (!raw || Object.keys(raw).length === 0) {
      return NextResponse.json({ data: [] });
    }

    const grouped = groupSensorReadings(raw);
    const existingTimestamps = await getStoredTimestamps(start, end);

    const newOnly = grouped.filter(
      (entry) => !existingTimestamps.includes(entry.timestamp.toISOString())
    );

    if (newOnly.length) {
      await insertNewSensorData(newOnly);
    }

    return NextResponse.json({ data: [...existingData, ...newOnly] });
  } catch (err) {
    console.error("Error fetching Zentra data:", err.message);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}