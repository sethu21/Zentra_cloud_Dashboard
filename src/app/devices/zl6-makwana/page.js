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

// Standard SWR fetcher
const fetcher = (url) => fetch(url).then((res) => res.json());

// Helper function to calculate cumulative ET for a single port based on water content readings.
// (Uses the change between consecutive readings multiplied by a multiplier.)
function calculateCumulativeET(readings, field, multiplier) {
  let cumulative = 0;
  return readings.map((r, i) => {
    if (i === 0) return 0; // Start at zero.
    const delta = (readings[i - 1][field] || 0) - (r[field] || 0);
    cumulative += delta * multiplier;
    return cumulative;
  });
}

// New helper function to calculate the combined ET using the new formula.
// For each interval, it computes the absolute change in water content for each port and multiplies:
//   |Δ(port1_wc)| × 200 + |Δ(port2_wc)| × 150 + |Δ(port3_wc)| × 150,
// then accumulates these values.
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
  const [date, setDate] = useState("");

  // Set default date to today.
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Build API URL with the date query parameter.
  const apiUrl = `/api/zentra/fetch-makwana?date=${date}`;
  console.log("🟢 API Request Sent From Client:", apiUrl);

  const { data, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes.
    errorRetryCount: 0,
  });

  if (!date) return <div>Loading date picker...</div>;
  if (error)
    return <div style={{ color: "red" }}>Error loading data: {error.message}</div>;
  if (!data) return <div>Loading data...</div>;

  // Assume our API returns an object with sensor types and readings.
  // Group readings by timestamp and extract water content for each port.
  const groupedData = {};

  function processSensorData(sensorType, parameterField) {
    if (!data.data[sensorType]) return;
    data.data[sensorType].forEach((sensor) => {
      const port = sensor.metadata?.port_number;
      if (!port || !Array.isArray(sensor.readings)) return;
      sensor.readings.forEach((reading) => {
        const ts = reading.datetime;
        if (!ts) return;
        if (!groupedData[ts]) {
          groupedData[ts] = {
            timestamp: ts,
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
        if (parameterField === "wc") {
          if (port === 1) groupedData[ts].port1_wc = reading.value;
          else if (port === 2) groupedData[ts].port2_wc = reading.value;
          else if (port === 3) groupedData[ts].port3_wc = reading.value;
        } else if (parameterField === "se_ec") {
          if (port === 1) groupedData[ts].port1_se_ec = reading.value;
          else if (port === 2) groupedData[ts].port2_se_ec = reading.value;
          else if (port === 3) groupedData[ts].port3_se_ec = reading.value;
        } else if (parameterField === "temp") {
          if (port === 1) groupedData[ts].port1_temp = reading.value;
          else if (port === 2) groupedData[ts].port2_temp = reading.value;
          else if (port === 3) groupedData[ts].port3_temp = reading.value;
        }
      });
    });
  }

  // Process the sensor types.
  processSensorData("Water Content", "wc");
  processSensorData("Saturation Extract EC", "se_ec");
  processSensorData("Soil Temperature", "temp");

  // Convert grouped data into an array.
  const readings = Object.values(groupedData);
  if (readings.length === 0)
    return <div>No data found for the selected date.</div>;

  console.log("Fetched Readings:", readings);

  // Compute individual cumulative ET values (if needed for separate display)
  const port1CumET = calculateCumulativeET(readings, "port1_wc", 150);
  const port2CumET = calculateCumulativeET(readings, "port2_wc", 300);
  const port3CumET = calculateCumulativeET(readings, "port3_wc", 450);

  // Compute combined ET using the new formula:
  // ET = |Δ(port1_wc)|×200 + |Δ(port2_wc)|×150 + |Δ(port3_wc)|×150.
  const combinedCumET = calculateCombinedET(readings);

  console.log("Port 1 ET:", port1CumET);
  console.log("Port 2 ET:", port2CumET);
  console.log("Port 3 ET:", port3CumET);
  console.log("Combined ET:", combinedCumET);

  // Original charts for Water Content, EC, and Temperature.
  const wcChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 WC",
        data: readings.map((r) => r.port1_wc),
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 WC",
        data: readings.map((r) => r.port2_wc),
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 WC",
        data: readings.map((r) => r.port3_wc),
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const ecChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 EC",
        data: readings.map((r) => r.port1_se_ec),
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 EC",
        data: readings.map((r) => r.port2_se_ec),
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 EC",
        data: readings.map((r) => r.port3_se_ec),
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const tempChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 Temp",
        data: readings.map((r) => r.port1_temp),
        borderColor: "#1BCFC9",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 Temp",
        data: readings.map((r) => r.port2_temp),
        borderColor: "#9DD800",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 Temp",
        data: readings.map((r) => r.port3_temp),
        borderColor: "#FFD700",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  // Prepare a chart for cumulative ET values (all ET lines on one chart)
  const etChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      {
        label: "Port 1 ET (15 cm)",
        data: port1CumET,
        borderColor: "#2B7AEB",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 2 ET (30 cm)",
        data: port2CumET,
        borderColor: "#2BC90E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Port 3 ET (45 cm)",
        data: port3CumET,
        borderColor: "#FF9900",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Combined ET",
        data: combinedCumET,
        borderColor: "#800080",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  // Chart options with a time-based x-axis and detailed y-axis (3 decimal places)
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

  return (
    <MainScreen>
      <div style={{ backgroundColor: "#fff", padding: "20px", color: "#000" }}>
        <h1>ZL6 Makwana</h1>
        <p>Measurement Interval: 5 minutes | Power Save Filter: 60 min</p>

        {/* Single Date Picker */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "4px" }}
          />
        </div>

        {/* Chart: Water Content */}
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Water Content (m³/m³)</h2>
          <Line data={wcChartData} options={commonOptions} />
        </div>

        {/* Chart: Saturation Extract EC */}
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Saturation Extract EC (dS/m)</h2>
          <Line data={ecChartData} options={commonOptions} />
        </div>

        {/* Chart: Soil Temperature */}
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Soil Temperature (°C)</h2>
          <Line data={tempChartData} options={commonOptions} />
        </div>

        {/* Chart: Evapotranspiration (ET) */}
        <div style={{ height: 250, border: "1px solid #ccc", padding: 10 }}>
          <h2 style={{ fontSize: "0.8rem" }}>Evapotranspiration (ET)</h2>
          <Line data={etChartData} options={commonOptions} />
        </div>
      </div>
    </MainScreen>
  );
}
