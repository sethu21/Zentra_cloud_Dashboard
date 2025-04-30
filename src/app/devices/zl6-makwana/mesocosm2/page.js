"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useSensorData } from "@/lib/hooks/useSensorData";
import {
  cleanTimestamps,
  compressByInterval,
  estimateETByPort,
} from "@/lib/utils/processReadings";
import ETChart from "@/components/charts/ETChart";
import WCChart from "@/components/charts/WCChart";
import ECChart from "@/components/charts/ECChart";
import TempChart from "@/components/charts/TempChart";
import WeatherChart from "@/components/charts/WeatherChart";
import Card from "@/components/ui/Card";
import { fetchLiveForecast, fetchHistoricalForecast } from "@/lib/weatherForecast";

export default function Mesocosm2Page() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);
  const [interval,  setInterval]  = useState("5min");
  const [weatherData, setWeatherData] = useState(null);

  const latitude  = 56.9496;
  const longitude = 24.1052;

  // 1) Fetch & clean sensor data
  const { data: rawData, isLoading, isError } = useSensorData(startDate, endDate);
  const readings = cleanTimestamps(rawData || []);
  const noData   = readings.length === 0;

  // 2) Fetch weather data
  useEffect(() => {
    async function getWeather() {
      const todayDate = new Date().toISOString().split("T")[0];
      let data;
      if (startDate < todayDate) {
        data = await fetchHistoricalForecast(latitude, longitude, startDate, endDate);
      } else {
        data = await fetchLiveForecast(latitude, longitude);
      }
      setWeatherData(data);
    }
    getWeather();
  }, [startDate, endDate, latitude, longitude]);

  // 3) Bucket raw readings into chosen interval
  const buckets = noData
    ? []
    : compressByInterval(readings, interval, startDate, endDate);

  // 4) Build end‐of‐bucket array for per‐port ET (ports 4–6)
  const aggregated = buckets.map(({ timestamp, readings }) => {
    const last = readings[readings.length - 1];
    return {
      timestamp,
      p4_wc: last.port4_wc,
      p5_wc: last.port5_wc,
      p6_wc: last.port6_wc,
    };
  });

  const port4ET = estimateETByPort(aggregated, "p4_wc", 200);
  const port5ET = estimateETByPort(aggregated, "p5_wc", 150);
  const port6ET = estimateETByPort(aggregated, "p6_wc", 150);

  // 6) Compute combined ET = sum of the three port ETs
  const combinedET = aggregated.map((_, i) =>
    (port4ET[i] || 0) + (port5ET[i] || 0) + (port6ET[i] || 0)
  );

  // 7) Prepare ET chart data
  const etChartData = {
    labels: aggregated.map(r => r.timestamp),
    datasets: [
      { label: "ET (Port 4)", data: port4ET, borderColor: "#FF00FF", pointRadius: 0 },
      { label: "ET (Port 5)", data: port5ET, borderColor: "#00FFFF", pointRadius: 0 },
      { label: "ET (Port 6)", data: port6ET, borderColor: "#FFFF00", pointRadius: 0 },
      {
        label: "Combined ET",
        data: combinedET,
        borderColor: "#008000",
        borderWidth: 2,
        pointRadius: 4,
        spanGaps: true,
        fill: false,
      },
    ],
  };

  const wcChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 4 WC", data: readings.map((r) => r.port4_wc), borderColor: "#FF00FF", pointRadius: 0 },
      { label: "Port 5 WC", data: readings.map((r) => r.port5_wc), borderColor: "#00FFFF", pointRadius: 0 },
      { label: "Port 6 WC", data: readings.map((r) => r.port6_wc), borderColor: "#FFFF00", pointRadius: 0 },
    ],
  };

  const ecChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 4 EC", data: readings.map((r) => r.port4_se_ec), borderColor: "#FF00FF", pointRadius: 0 },
    ],
  };

  const tempChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 4 Temp", data: readings.map((r) => r.port4_temp), borderColor: "#FF00FF", pointRadius: 0 },
    ],
  };

  const weatherChartData = {
    labels: weatherData?.hourly?.time?.map((t) => new Date(t)) || [],
    datasets: [
      {
        label: "Temperature",
        data: weatherData?.hourly?.temperature_2m || [],
        borderColor: "#ff3333",
        yAxisID: "y",
      },
      {
        label: "Rain",
        data: weatherData?.hourly?.rain || [],
        borderColor: "#00ccff",
        yAxisID: "y1",
      },
    ],
  };

  return (
    <main
      style={{
        padding: "1rem",
        overflowY: "auto",
        height: "calc(100vh - 80px)",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "1rem" }}>
        Mesocosm 2 Dashboard
      </h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label style={{ color: "#ccc" }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ color: "#ccc" }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ color: "#ccc" }}>ET Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="5min">5 min</option>
            <option value="1hour">1 hour</option>
            <option value="8hours">8 hours</option>
            <option value="12hours">12 hours</option>
            <option value="24hours">24 hours</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <LoadingScreen />
        </Card>
      ) : isError ? (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "red", margin: 0 }}>Error loading data.</p>
        </Card>
      ) : noData ? (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#ff9900", margin: 0 }}>
            No sensor data found for selected range.
          </p>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>ET Chart</h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 1.5rem)",
              }}
            >
              <ETChart data={etChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>
              Water Content
            </h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 1.5rem)",
              }}
            >
              <WCChart data={wcChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>
              Soil Temperature
            </h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 1.5rem)",
              }}
            >
              <TempChart data={tempChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Soil EC</h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 1.5rem)",
              }}
            >
              <ECChart data={ecChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "450px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>
              Weather Forecast
            </h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 1.5rem)",
              }}
            >
              <WeatherChart data={weatherChartData} />
            </div>
          </Card>
        </>
      )}
    </main>
  );
}