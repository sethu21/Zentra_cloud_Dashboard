import axios from "axios";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma"; // using your prisma.js configuration

// Helper: Retry API request in case of rate limiting
const fetchDataWithRetry = async (url, retries = 5, delay = 5000, token) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      console.log(`API Call Attempt ${attempt + 1} for URL: ${url}`);
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log("External API response received.");
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        attempt++;
        console.warn(
          `Attempt ${attempt}: Too many requests, retrying in ${delay / 1000} seconds...`
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error("Error during external API call:", error);
        throw error;
      }
    }
  }
  throw new Error("API rate limit exceeded after multiple attempts.");
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Retrieve start_date and end_date from query parameters.
    let startParam = searchParams.get("start_date");
    let endParam = searchParams.get("end_date");

    if (!startParam) {
      const today = new Date().toISOString().split("T")[0];
      startParam = today + " 00:00";
    }
    if (!endParam) {
      const today = new Date().toISOString().split("T")[0];
      endParam = today + " 23:59";
    }

    // Replace the space with 'T' to produce an ISO string
    const startIso = startParam.replace(" ", "T");
    const endIso = endParam.replace(" ", "T");

    // Parse into Date objects.
    const startDateObj = new Date(startIso);
    const endDateObj = new Date(endIso);

    console.log("Parsed Start Date:", startDateObj);
    console.log("Parsed End Date:", endDateObj);

    // Optional: Force external API call if force_api=true in query.
    const forceApi = searchParams.get("force_api") === "true";
    console.log("Force API flag is:", forceApi);

    // Check for existing sensor data in the date range.
    const existingData = await prisma.etReading.findMany({
      where: {
        timestamp: {
          gte: startDateObj,
          lte: endDateObj,
        },
      },
    });
    console.log("Existing data from DB:", existingData);
    if (!forceApi && existingData.length > 0) {
      console.log("Returning data from database.");
      return new Response(JSON.stringify({ data: existingData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.log("Force API flag true; or no existing data. Proceeding to fetch from external API.");
    }

    const device_sn = "z6-21087"; // Replace with your actual device serial number

    // Build external API URL.
    const finalUrl = `https://zentracloud.com/api/v4/get_readings/?device_sn=${device_sn}&start_date=${encodeURIComponent(
      startParam
    )}&end_date=${encodeURIComponent(
      endParam
    )}&output_format=json&sort_by=descending&page_num=1&per_page=1000&device_depth=true`;

    console.log("Calling external API with URL:", finalUrl);

    const token = process.env.ZENTRA_API_TOKEN;
    const response = await fetchDataWithRetry(finalUrl, 5, 5000, token);

    console.log("External API response data:", response.data);

    if (
      !response.data ||
      !response.data.data ||
      Object.keys(response.data.data).length === 0
    ) {
      console.warn("External API returned no data.");
      return new Response(
        JSON.stringify({ data: {} }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Group sensor readings by timestamp.
    const groupedData = {};
    const apiData = response.data.data;
    for (const [sensorType, sensorArray] of Object.entries(apiData)) {
      console.log(`Processing sensor type: ${sensorType}, count: ${sensorArray.length}`);
      sensorArray.forEach((sensor) => {
        const port = sensor.metadata?.port_number;
        if (!port || !Array.isArray(sensor.readings)) return;
        sensor.readings.forEach((reading) => {
          const ts = reading.datetime; // e.g. "2025-03-18 11:55:00+02:00"
          if (!ts) return;
          if (!groupedData[ts]) {
            groupedData[ts] = {
              timestamp: new Date(ts),
              port1_wc: null,
              port2_wc: null,
              port3_wc: null,
              port1_se_ec: null,
              port2_se_ec: null,
              port3_se_ec: null,
              port1_temp: null,
              port2_temp: null,
              port3_temp: null,
            };
          }
          if (sensorType === "Water Content") {
            if (port === 1) groupedData[ts].port1_wc = reading.value;
            else if (port === 2) groupedData[ts].port2_wc = reading.value;
            else if (port === 3) groupedData[ts].port3_wc = reading.value;
          } else if (sensorType === "Saturation Extract EC") {
            if (port === 1) groupedData[ts].port1_se_ec = reading.value;
            else if (port === 2) groupedData[ts].port2_se_ec = reading.value;
            else if (port === 3) groupedData[ts].port3_se_ec = reading.value;
          } else if (sensorType === "Soil Temperature") {
            if (port === 1) groupedData[ts].port1_temp = reading.value;
            else if (port === 2) groupedData[ts].port2_temp = reading.value;
            else if (port === 3) groupedData[ts].port3_temp = reading.value;
          }
        });
      });
    }

    // Convert grouped data into an array.
    const sensorReadings = Object.values(groupedData);
    console.log("Sensor readings from API:", sensorReadings);

    // Retrieve existing timestamps for the date range from the DB
    const existingTimestampsResult = await prisma.etReading.findMany({
      where: {
        timestamp: {
          gte: startDateObj,
          lte: endDateObj,
        },
      },
      select: { timestamp: true },
    });
    const existingTimestamps = existingTimestampsResult.map(r => r.timestamp.toISOString());

    // Filter out readings that have timestamps already stored in DB.
    const newReadings = sensorReadings.filter(
      (reading) => !existingTimestamps.includes(reading.timestamp.toISOString())
    );
    console.log("New sensor readings to insert:", newReadings);

    if (newReadings.length > 0) {
      await prisma.etReading.createMany({
        data: newReadings,
      });
      console.log("New sensor readings inserted into database.");
    } else {
      console.warn("No new sensor readings to insert; all data already exists.");
    }

    // Return combined data: existing plus new readings.
    const combinedData = [...existingData, ...newReadings];
    return new Response(JSON.stringify({ data: combinedData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Fetch Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
