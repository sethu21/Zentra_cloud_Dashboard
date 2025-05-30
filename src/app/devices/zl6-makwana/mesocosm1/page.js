"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useSensorData } from "@/lib/hooks/useSensorData";
import {
  cleanTimestamps,
  compressByInterval,
  estimateETByPort,
  estimateTotalETByInterval,
} from "@/lib/utils/processReadings";
import ETChart from "@/components/charts/ETChart";
import WCChart from "@/components/charts/WCChart";
import ECChart from "@/components/charts/ECChart";
import TempChart from "@/components/charts/TempChart";
import WeatherChart from "@/components/charts/WeatherChart";
import Card from "@/components/ui/Card";
import { fetchLiveForecast, fetchHistoricalForecast } from "@/lib/weatherForecast";

export default function Mesocosm1Page() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);
  const [interval,  setInterval]  = useState("5min");
  const [weatherData, setWeatherData] = useState(null);

  const latitude  = 56.9496;
  const longitude = 24.1052;

  const { data: rawData, isLoading, isError } = useSensorData(startDate, endDate);
  const readings = cleanTimestamps(rawData || []);
  const noData   = readings.length === 0;

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

  // bucket into interval and get last readings per bucket for per-port ET
// 1) Bucket raw readings into intervals
const buckets = noData
    ? []
    : compressByInterval(readings, interval, startDate, endDate);

  const aggregated = buckets.map(({ timestamp, readings }) => {
    const last = readings[readings.length - 1];
    return {
      timestamp,
      p1_wc: last.port1_wc,
      p2_wc: last.port2_wc,
      p3_wc: last.port3_wc,
    };
  });


  // 2) per-port ET from those end-of-bucket values
  const port1ET = estimateETByPort(aggregated, "p1_wc", 200);  // 15 cm
  const port2ET = estimateETByPort(aggregated, "p2_wc", 150);  // 30 cm
  const port3ET = estimateETByPort(aggregated, "p3_wc", 150);  // 45 cm

  // combined ET by summing all intra-bucket drops in the full reading series
  // 3) Combined ET by summing all drops inside each bucket
  const combinedET = aggregated.map((_, i) =>
    (port1ET[i] || 0) + (port2ET[i] || 0) + (port3ET[i] || 0)
  );


  // Chart data
  const etChartData = {
    labels: aggregated.map(r => r.timestamp),
    datasets: [
      { label: "ET (Port 1)", data: port1ET, borderColor: "#2B7AEB", pointRadius: 0 },
      { label: "ET (Port 2)", data: port2ET, borderColor: "#2BC90E", pointRadius: 0 },
      { label: "ET (Port 3)", data: port3ET, borderColor: "#FF9900", pointRadius: 0 },
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
      { label: "Port 1 WC", data: readings.map((r) => r.port1_wc), borderColor: "#2B7AEB", pointRadius: 0 },
      { label: "Port 2 WC", data: readings.map((r) => r.port2_wc), borderColor: "#2BC90E", pointRadius: 0 },
      { label: "Port 3 WC", data: readings.map((r) => r.port3_wc), borderColor: "#FF9900", pointRadius: 0 },
    ],
  };

  const ecChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 1 EC", data: readings.map((r) => r.port1_se_ec), borderColor: "#00ccff", pointRadius: 0 },
      { label: "Port 2 EC", data: readings.map((r) => r.port2_se_ec), borderColor: "#66ff66", pointRadius: 0 },
      { label: "Port 3 EC", data: readings.map((r) => r.port3_se_ec), borderColor: "#ffa500", pointRadius: 0 },
    ],
  };

  const tempChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 1 Temp", data: readings.map((r) => r.port1_temp), borderColor: "#1BCFC9", pointRadius: 0 },
      { label: "Port 2 Temp", data: readings.map((r) => r.port2_temp), borderColor: "#9DD800", pointRadius: 0 },
      { label: "Port 3 Temp", data: readings.map((r) => r.port3_temp), borderColor: "#FFD700", pointRadius: 0 },
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
        Mesocosm 1 Dashboard
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