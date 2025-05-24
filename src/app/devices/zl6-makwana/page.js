"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useSensorData } from "@/lib/hooks/useSensorData";

import {
  cleanTimestamps,
  compressByInterval,
  estimateETByPort,
  estimateTotalET,
} from "@/lib/utils/processReadings";

import ETChart from "@/components/charts/ETChart";
import WCChart from "@/components/charts/WCChart";
import ECChart from "@/components/charts/ECChart";
import TempChart from "@/components/charts/TempChart";
import WeatherChart from "@/components/charts/WeatherChart";
import Card from "@/components/ui/Card";
import { fetchLiveForecast, fetchHistoricalForecast } from "@/lib/weatherForecast";

export default function SensorDashboardPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [interval, setInterval] = useState("5min");
  const [weatherData, setWeatherData] = useState(null);

  const latitude = 56.9496;
  const longitude = 24.1052; // need to verify this with google map

  const { data: rawData, isLoading, isError } = useSensorData(startDate, endDate);
  const readings = cleanTimestamps(rawData || []);
  const noData = readings.length === 0;

  useEffect(() => {
    // this use to  check date and fetch something
    const getWeatherData = async () => {
      const now = new Date().toISOString().split("T")[0];
      let data;
      if (startDate < now) {
        // this help to fetch and  use historical data if date is older
        data = await fetchHistoricalForecast(latitude, longitude, startDate, endDate);
      } else {
        // otherwise, grab the live forecast
        data = await fetchLiveForecast(latitude, longitude);
      }
      setWeatherData(data);
    };
    getWeatherData();
  }, [startDate, endDate]);

  const wcChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 1 WC", data: readings.map((r) => r.port1_wc), borderColor: "blue" ,pointRadius: 0},
      { label: "Port 2 WC", data: readings.map((r) => r.port2_wc), borderColor: "green" ,pointRadius: 0},
      { label: "Port 3 WC", data: readings.map((r) => r.port3_wc), borderColor: "orange",pointRadius: 0 },
      { label: "Port 4 WC", data: readings.map((r) => r.port4_wc), borderColor: "purple",pointRadius: 0 },
      { label: "Port 5 WC", data: readings.map((r) => r.port5_wc), borderColor: "cyan" ,pointRadius: 0},
      { label: "Port 6 WC", data: readings.map((r) => r.port6_wc), borderColor: "yellow",pointRadius: 0 },
    ],
  };

  const ecChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 1 EC", data: readings.map((r) => r.port1_se_ec), borderColor: "#00ccff",pointRadius: 0 },
      { label: "Port 2 EC", data: readings.map((r) => r.port2_se_ec), borderColor: "#66ff66",pointRadius: 0 },
      { label: "Port 3 EC", data: readings.map((r) => r.port3_se_ec), borderColor: "#ffa500" ,pointRadius: 0},
      { label: "Port 4 EC", data: readings.map((r) => r.port4_se_ec), borderColor: "#FF00FF" ,pointRadius: 0},
    ],
  };

  const tempChartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      { label: "Port 1 Temp", data: readings.map((r) => r.port1_temp), borderColor: "#1BCFC9",pointRadius: 0},
      { label: "Port 2 Temp", data: readings.map((r) => r.port2_temp), borderColor: "#9DD800" ,pointRadius: 0},
      { label: "Port 3 Temp", data: readings.map((r) => r.port3_temp), borderColor: "#FFD700" ,pointRadius: 0},
      { label: "Port 4 Temp", data: readings.map((r) => r.port4_temp), borderColor: "#FF00FF",pointRadius: 0 },
    ],
  };

  let weatherChartData = null;
  if (weatherData && weatherData.hourly && weatherData.hourly.time && weatherData.hourly.time.length > 0) {
    weatherChartData = {
      labels: weatherData.hourly.time.map((t) => new Date(t)),
      datasets: [
        {
          label: "Temperature",
          data: weatherData.hourly.temperature_2m,
          borderColor: "#ff3333",
          yAxisID: "y",
        },
        {
          label: "Rain",
          data: weatherData.hourly.rain,
          borderColor: "#00ccff",
          yAxisID: "y1",
        },
      ],
    };
  }

  return (
    <main style={{ padding: "1rem", overflowY: "auto", height: "calc(100vh - 80px)" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "1rem" }}>Sensor Dashboard</h2>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem", alignItems: "flex-end" }}>
        <div>
          <label style={{ color: "#ccc" }}>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={{ color: "#ccc" }}>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>


      {isLoading && (
        <Card style={{ padding: "2rem", textAlign: "center" }}><LoadingScreen /></Card>
      )}
      {!isLoading && isError && (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "red", margin: 0 }}>Error loading data.</p>
        </Card>
      )}
      {!isLoading && !isError && noData && (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#ff9900", margin: 0 }}>No sensor data found for selected range.</p>
        </Card>
      )}
      {!isLoading && !isError && !noData && (
        <>
          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Water Content</h3>
            <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
              <WCChart data={wcChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Soil Temperature</h3>
            <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
              <TempChart data={tempChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "350px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Soil EC</h3>
            <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
              <ECChart data={ecChartData} />
            </div>
          </Card>

          <Card style={{ marginBottom: "2rem", height: "450px" }}>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Weather Forecast</h3>
            <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
              <WeatherChart data={weatherChartData} />
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
