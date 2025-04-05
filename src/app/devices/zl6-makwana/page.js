"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MainScreen from "@/components/MainScreen";
import { fetchLiveForecast, fetchHistoricalForecast } from "../../../../lib/weatherForecast"; // Import both functions

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Standard SWR fetcher for sensor data
const fetcher = (url) => fetch(url).then((res) => res.json());

function calculateCumulativeET(readings, field, multiplier) {
  let cumulative = 0;
  return readings.map((r, i) => {
    if (i === 0) return 0;
    const delta = (readings[i - 1][field] || 0) - (r[field] || 0);
    cumulative += delta * multiplier;
    return cumulative;
  });
}

function calculateCombinedET(readings) {
  let cumulative = 0;
  return readings.map((r, i) => {
    if (i === 0) return 0;
    const delta1 = Math.abs((readings[i - 1].port1_wc || 0) - (r.port1_wc || 0));
    const delta2 = Math.abs((readings[i - 1].port2_wc || 0) - (r.port2_wc || 0));
    const delta3 = Math.abs((readings[i - 1].port3_wc || 0) - (r.port3_wc || 0));
    cumulative += delta1 * 200 + delta2 * 150 + delta3 * 150;
    return cumulative;
  });
}

export default function ZL6MakwanaPage() {
  // Use today's date as default (format: YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Coordinates for weather forecast (Berlin example)
  const latitude = 56.9496;
  const longitude = 24.1052;

  // State for weather forecast data
  const [weatherData, setWeatherData] = useState(null);

  // Fetch weather forecast when component mounts or when date range changes.
  useEffect(() => {
    async function getWeather() {
      const todayDate = new Date().toISOString().split("T")[0];
      let data;
      // Use historical forecast if startDate is before today; otherwise, use live forecast.
      if (startDate < todayDate) {
        data = await fetchHistoricalForecast(latitude, longitude, startDate, endDate);
      } else {
        data = await fetchLiveForecast(latitude, longitude);
      }
      setWeatherData(data);
    }
    getWeather();
  }, [startDate, endDate, latitude, longitude]);

  // Build API URL for sensor data.
  const apiUrl = `/api/zentra/fetch-makwana?start_date=${encodeURIComponent(
    `${startDate} 00:00`
  )}&end_date=${encodeURIComponent(`${endDate} 23:59`)}`;
  console.log("🟢 Sensor API Request:", apiUrl);

  const { data, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    errorRetryCount: 0,
  });

  if (!startDate || !endDate) return <div>Loading date pickers...</div>;
  if (error)
    return <div style={{ color: "red" }}>Error loading sensor data: {error.message}</div>;
  if (!data) return <div>Loading sensor data...</div>;
  console.log("API sensor response data:", data);

  const readings = Array.isArray(data.data) ? data.data : [];
  const noData = readings.length === 0;
  console.log("Fetched Readings:", readings);

  const port1CumET = noData ? [] : calculateCumulativeET(readings, "port1_wc", 150);
  const port2CumET = noData ? [] : calculateCumulativeET(readings, "port2_wc", 300);
  const port3CumET = noData ? [] : calculateCumulativeET(readings, "port3_wc", 450);
  const combinedCumET = noData ? [] : calculateCombinedET(readings);

  console.log("Port 1 ET:", port1CumET);
  console.log("Port 2 ET:", port2CumET);
  console.log("Port 3 ET:", port3CumET);
  console.log("Combined ET:", combinedCumET);

  const wcChartData = {
    labels: noData ? [] : readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 WC",
        data: noData ? [] : readings.map((r) => r.port1_wc),
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 WC",
        data: noData ? [] : readings.map((r) => r.port2_wc),
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 WC",
        data: noData ? [] : readings.map((r) => r.port3_wc),
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const ecChartData = {
    labels: noData ? [] : readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 EC",
        data: noData ? [] : readings.map((r) => r.port1_se_ec),
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 EC",
        data: noData ? [] : readings.map((r) => r.port2_se_ec),
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 EC",
        data: noData ? [] : readings.map((r) => r.port3_se_ec),
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const tempChartData = {
    labels: noData ? [] : readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 Temp",
        data: noData ? [] : readings.map((r) => r.port1_temp),
        borderColor: "#1BCFC9",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 Temp",
        data: noData ? [] : readings.map((r) => r.port2_temp),
        borderColor: "#9DD800",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 Temp",
        data: noData ? [] : readings.map((r) => r.port3_temp),
        borderColor: "#FFD700",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const etChartData = {
    labels: noData ? [] : readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 ET (15 cm)",
        data: noData ? [] : port1CumET,
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 ET (30 cm)",
        data: noData ? [] : port2CumET,
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 ET (45 cm)",
        data: noData ? [] : port3CumET,
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Combined ET",
        data: noData ? [] : combinedCumET,
        borderColor: "#800080",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          displayFormats: {
            minute: "MMM dd HH:mm",
            hour: "MMM dd HH:mm",
            day: "MMM dd",
          },
        },
        grid: { color: "#ccc" },
        ticks: { color: "#000", autoSkip: true, maxRotation: 45 },
      },
      y: {
        grid: { color: "#ccc" },
        ticks: { color: "#000", callback: (value) => value.toFixed(3) },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#000", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
      },
    },
  };

  // Process weather data for the selected date safely
  let filteredWeather = [];
  if (weatherData && weatherData.hourly && weatherData.hourly.time) {
    const times = weatherData.hourly.time || [];
    const temperatures = weatherData.hourly.temperature_2m || [];
    const relativeHumidity = weatherData.hourly.relativehumidity_2m || [];
    const windSpeed = weatherData.hourly.wind_speed_10m || [];
    const solarRadiation = weatherData.hourly.solar_radiation || [];
    const rainArr = weatherData.hourly.rain || [];
    
    const selectedDate = startDate; // expecting "YYYY-MM-DD"
    filteredWeather = times
      .map((time, idx) => {
        if (time.startsWith(selectedDate)) {
          return {
            time,
            temperature: temperatures[idx] ?? 0,
            relativehumidity: relativeHumidity[idx] ?? 0,
            wind_speed: windSpeed[idx] ?? 0,
            solar_radiation: solarRadiation[idx] ?? 0,
            rain: rainArr[idx] ?? 0,
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  }
  
  const weatherTimes = filteredWeather.map((item) => item.time);
  
  const weatherChartData = {
    labels: weatherTimes,
    datasets: [
      {
        label: "Temp (°C)",
        data: filteredWeather.map((item) => item.temperature),
        borderColor: "#FF0000",
        backgroundColor: "transparent",
        yAxisID: "tempAxis",
        tension: 0.2,
      },
      {
        label: "Humidity (%)",
        data: filteredWeather.map((item) => item.relativehumidity),
        borderColor: "#00CC00",
        backgroundColor: "transparent",
        yAxisID: "humidityAxis",
        tension: 0.2,
      },
      {
        label: "Wind Speed (m/s)",
        data: filteredWeather.map((item) => item.wind_speed),
        borderColor: "#0000FF",
        backgroundColor: "transparent",
        yAxisID: "windAxis",
        tension: 0.2,
      },
      {
        label: "Solar Rad.",
        data: filteredWeather.map((item) => item.solar_radiation),
        borderColor: "#FFA500",
        backgroundColor: "transparent",
        yAxisID: "solarAxis",
        tension: 0.2,
      },
      {
        label: "Rain (mm)",
        data: filteredWeather.map((item) => item.rain),
        borderColor: "#00AAFF",
        backgroundColor: "rgba(0,170,255,0.3)",
        yAxisID: "rainAxis",
        fill: true,
        tension: 0.2,
      },
    ],
  };
  
  const weatherChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          displayFormats: {
            minute: "MMM dd HH:mm",
            hour: "MMM dd HH:mm",
            day: "MMM dd",
          },
        },
        ticks: { color: "#000", autoSkip: true, maxRotation: 45 },
      },
      tempAxis: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Temp (°C)" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#000" },
      },
      humidityAxis: {
        type: "linear",
        position: "right",
        offset: true,
        title: { display: true, text: "Humidity (%)" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#000" },
      },
      windAxis: {
        type: "linear",
        position: "right",
        offset: true,
        title: { display: true, text: "Wind Speed (m/s)" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#000" },
      },
      solarAxis: {
        type: "linear",
        position: "right",
        offset: true,
        title: { display: true, text: "Solar Radiation" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#000" },
      },
      rainAxis: {
        type: "linear",
        position: "right",
        offset: true,
        title: { display: true, text: "Rain (mm)" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#000" },
      },
    },
    plugins: {
      legend: { position: "top", labels: { color: "#000", font: { size: 12 } } },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
      },
    },
  };

  return (
    <MainScreen>
      <div style={{ backgroundColor: "#fff", padding: "20px", color: "#000" }}>
        <h1>ZL6 Makwana</h1>
        <p>Measurement Interval: 5 minutes | Power Save Filter: 60 min</p>
        {/* Date Range Pickers */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ marginRight: 8 }}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: "4px" }}
            />
          </div>
          <div>
            <label style={{ marginRight: 8 }}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: "4px" }}
            />
          </div>
        </div>

        {/* Weather Forecast Section */}
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
            Weather Forecast for {startDate}
          </h2>
          {(!weatherData || !weatherData.hourly) && <p>Loading weather forecast...</p>}
          {weatherData && weatherData.hourly && filteredWeather.length > 0 && (
            <div style={{ height: 400 }}>
              <Line data={weatherChartData} options={weatherChartOptions} />
            </div>
          )}
          {weatherData && weatherData.hourly && filteredWeather.length === 0 && (
            <p>No weather data available for this date.</p>
          )}
        </div>

        {noData && (
          <p style={{ color: "orange" }}>
            No sensor data found for the selected date range.
          </p>
        )}

        {/* Sensor Data Charts */}
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Water Content (m³/m³)</h2>
          <Line data={wcChartData} options={commonOptions} />
        </div>
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Saturation Extract EC (dS/m)</h2>
          <Line data={ecChartData} options={commonOptions} />
        </div>
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Soil Temperature (°C)</h2>
          <Line data={tempChartData} options={commonOptions} />
        </div>
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Evapotranspiration (ET)</h2>
          <Line data={etChartData} options={commonOptions} />
        </div>
      </div>
    </MainScreen>
  );
}
