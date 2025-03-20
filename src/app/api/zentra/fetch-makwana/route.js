import axios from "axios";
import { NextResponse } from "next/server";

// Retry logic for API request in case of 429 (Too Many Requests)
const fetchDataWithRetry = async (url, retries = 5, delay = 5000, token) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });
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
        throw error;
      }
    }
  }
  throw new Error("API rate limit exceeded after multiple attempts.");
};

// In-memory cache (for production, consider using a persistent cache like Redis)
let cache = {};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Get start_date and end_date from query parameters.
    // Default to today's date if not provided.
    const start_dateParam = searchParams.get("start_date") || new Date().toISOString().split("T")[0];
    const end_dateParam = searchParams.get("end_date") || new Date().toISOString().split("T")[0];

    // Build full date-time strings
    const start_date = `${start_dateParam} 00:00`;
    const end_date = `${end_dateParam} 23:59`;

    // Create a cache key that distinguishes between different date ranges.
    const cacheKey = `zentra_${start_date}_${end_date}`;
    const cacheExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Serve from cache if available and not expired.
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < cacheExpiration) {
      return new Response(JSON.stringify({ data: cache[cacheKey].data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const device_sn = "z6-21087"; // Replace with your actual device serial number

    // Build API URL using both start_date and end_date with time.
    const finalUrl = `https://zentracloud.com/api/v4/get_readings/?device_sn=${device_sn}&start_date=${encodeURIComponent(
      start_date
    )}&end_date=${encodeURIComponent(end_date)}&output_format=json&sort_by=descending&page_num=1&per_page=1000&device_depth=true`;

    const token = process.env.ZENTRA_API_TOKEN;
    const response = await fetchDataWithRetry(finalUrl, 5, 5000, token);

    if (
      !response.data ||
      !response.data.data ||
      Object.keys(response.data.data).length === 0
    ) {
      return new Response(
        JSON.stringify({ error: `No data found for the selected date range.` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cache the response.
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: response.data.data,
    };

    return new Response(JSON.stringify({ data: response.data.data }), {
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
