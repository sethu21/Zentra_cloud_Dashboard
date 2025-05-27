"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useSensorData } from "@/lib/hooks/useSensorData";

import { cleanTimestamps } from "@/lib/utils/processReadings";

import WCChart from "@/components/charts/WCChart";
import ECChart from "@/components/charts/ECChart";
import TempChart from "@/components/charts/TempChart";
import WeatherChart from "@/components/charts/WeatherChart";
import Card from "@/components/ui/Card";
import { fetchLiveForecast, fetchHistoricalForecast } from "@/lib/weatherForecast";

export default function SensorDashboardPage() {
    const todayStr = new Date().toISOString().split("T")[0];
    const [whenFrom, setWhenFrom] = useState(todayStr);
    const [whenTo, setWhenTo] = useState(todayStr);
    const [forecastInfo, setForecastInfo] = useState(null);

    const lat = 56.9496;
    const lon = 24.1052;

    const { data: rawSensorLogs, isLoading, isError } = useSensorData(whenFrom, whenTo);
    const cleanedData = cleanTimestamps(rawSensorLogs || []);
    const nothingFound = cleanedData.length === 0;

    useEffect(() => {
        async function loadWeather() {
            const now = new Date().toISOString().split("T")[0];
            const weather = whenFrom < now
                ? await fetchHistoricalForecast(lat, lon, whenFrom, whenTo)
                : await fetchLiveForecast(lat, lon);
            setForecastInfo(weather);
        }
        loadWeather();
    }, [whenFrom, whenTo]);

    const wcChart = {
        labels: cleanedData.map((d) => d.timestamp),
        datasets: Array.from({ length: 6 }, (_, i) => ({
            label: `Port ${i + 1} WC`,
            data: cleanedData.map((d) => d[`port${i + 1}_wc`]),
            borderColor: ["#2B7AEB", "#2BC90E", "#FF9900", "#FF00FF", "#00FFFF", "#FFFF00"][i],
            pointRadius: 0,
        })),
    };

    const ecChart = {
        labels: cleanedData.map((d) => d.timestamp),
        datasets: [1, 2, 3, 4].map((p, i) => ({
            label: `Port ${p} EC`,
            data: cleanedData.map((d) => d[`port${p}_se_ec`]),
            borderColor: ["#00ccff", "#66ff66", "#ffa500", "#FF00FF"][i],
            pointRadius: 0,
        })),
    };

    const tempChart = {
        labels: cleanedData.map((d) => d.timestamp),
        datasets: [1, 2, 3, 4].map((p, i) => ({
            label: `Port ${p} Temp`,
            data: cleanedData.map((d) => d[`port${p}_temp`]),
            borderColor: ["#1BCFC9", "#9DD800", "#FFD700", "#FF00FF"][i],
            pointRadius: 0,
        })),
    };

    const weatherChart = {
        labels: forecastInfo?.hourly?.time?.map((t) => new Date(t)) || [],
        datasets: [
            {
                label: "Temperature",
                data: forecastInfo?.hourly?.temperature_2m || [],
                borderColor: "#ff3333",
                yAxisID: "y",
            },
            {
                label: "Rain",
                data: forecastInfo?.hourly?.rain || [],
                borderColor: "#00ccff",
                yAxisID: "y1",
            },
        ],
    };

    return (
        <main style={{ padding: "1rem", overflowY: "auto", height: "calc(100vh - 80px)" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "1rem" }}>
                Sensor Dashboard
            </h2>

            {/* date pickers */}
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
                    <input type="date" value={whenFrom} onChange={(e) => setWhenFrom(e.target.value)} />
                </div>
                <div>
                    <label style={{ color: "#ccc" }}>End Date</label>
                    <input type="date" value={whenTo} onChange={(e) => setWhenTo(e.target.value)} />
                </div>
            </div>

            {/* conditionals */}
            {isLoading ? (
                <Card style={{ padding: "2rem", textAlign: "center" }}>
                    <LoadingScreen />
                </Card>
            ) : isError ? (
                <Card style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "red", margin: 0 }}>Something went wrong loading the data.</p>
                </Card>
            ) : nothingFound ? (
                <Card style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "#ff9900", margin: 0 }}>
                        No sensor data found for those dates.
                    </p>
                </Card>
            ) : (
                <>
                    <Card style={{ marginBottom: "2rem", height: "350px" }}>
                        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Water Content</h3>
                        <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
                            <WCChart data={wcChart} />
                        </div>
                    </Card>

                    <Card style={{ marginBottom: "2rem", height: "350px" }}>
                        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Soil Temperature</h3>
                        <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
                            <TempChart data={tempChart} />
                        </div>
                    </Card>

                    <Card style={{ marginBottom: "2rem", height: "350px" }}>
                        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Soil EC</h3>
                        <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
                            <ECChart data={ecChart} />
                        </div>
                    </Card>

                    <Card style={{ marginBottom: "2rem", height: "450px" }}>
                        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Weather Forecast</h3>
                        <div style={{ position: "relative", width: "100%", height: "calc(100% - 1.5rem)" }}>
                            <WeatherChart data={weatherChart} />
                        </div>
                    </Card>
                </>
            )}
        </main>
    );
}
