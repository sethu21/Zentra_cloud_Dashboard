import { NextResponse } from "next/server";
import { getIrrigationDecision, PLANT_DATABASE } from "@/lib/irrigationDecision";
import { fetchLiveForecast } from "@/lib/weatherForecast";
import { estimateTotalET } from "@/lib/utils/processReadings";

export async function POST(req) {
  const { messages } = await req.json();

  const soilType = "Sandy Loam";
  const plantType = "Salix Integra";
  const rootDepth = PLANT_DATABASE[plantType]?.rootDepth || 300;
  const mad = PLANT_DATABASE[plantType]?.mad || 0.5;

  const today = new Date().toISOString().split("T")[0];
  const start = `${today} 00:00`;
  const end = `${today} 23:59`;

  const sensorUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/zentra/fetch-makwana?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}`;

  let readings = [];
  let latest = null;
  let weather = null;
  let etSeries = [];
  let rainSeries = [];
  let irrigation = null;

  try {
    const res = await fetch(sensorUrl);
    const sensorData = await res.json();
    readings = sensorData?.data || [];
    latest = readings.at(-1);

    weather = await fetchLiveForecast(56.9301676, 24.1613327);

    if (readings.length && weather) {
      etSeries = estimateTotalET(readings, weather, "5min");
      rainSeries = weather.hourly.rain?.slice(0, etSeries.length) || Array(etSeries.length).fill(0);
    }

    irrigation = getIrrigationDecision({
      soilType,
      rootDepth,
      mad,
      etData: etSeries,
      rainData: rainSeries,
    });

  } catch (err) {
    console.error("Chatbot data error:", err.message);
  }

  let summary = "";

  if (latest) {
    summary += `Sensor Readings (as of ${latest.timestamp}):\n`;
    for (let port = 1; port <= 6; port++) {
      summary += `Port ${port}:\n`;
      summary += `- Moisture: ${latest[`port${port}_wc`] ?? "N/A"}%\n`;
      summary += `- Temp: ${latest[`port${port}_temp`] ?? "N/A"}°C\n`;
      summary += `- EC: ${latest[`port${port}_se_ec`] ?? "N/A"} dS/m\n\n`;
    }
  }

  if (weather) {
    summary += `Weather:\n`;
    summary += `- Temperature: ${weather.hourly?.temperature_2m?.[0]}°C\n`;
    summary += `- Rain: ${weather.hourly?.rain?.[0]} mm\n`;
  }

  if (irrigation) {
    summary += `\nIrrigation Decision:\n`;
    summary += `- Decision: ${irrigation.decision}\n`;
    summary += `- Depletion: ${irrigation.currentDepletion} mm / Threshold: ${irrigation.threshold} mm\n`;
  }

  summary += `\nPlant Type: ${plantType}\nRoot Depth: ${rootDepth} mm\nMAD: ${mad * 100}%\nSoil Type: ${soilType}`;

  const systemPrompt = `
You are a helpful assistant for farmers monitoring environmental and soil sensor data. Use this context to answer naturally:

${summary}
`;

  try {
    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini-beta",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const json = await xaiResponse.json();

    const reply = json?.choices?.[0]?.message?.content || "The assistant couldn't reply at this moment.";
    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Grok error:", err.message);
    return NextResponse.json({ reply: "Chatbot error with Grok. Please try again later." }, { status: 500 });
  }
}
