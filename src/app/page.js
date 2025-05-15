// File: src/app/page.js
"use client";

import useSWR from "swr";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import dynamic from "next/dynamic";
import { getIrrigationDecision } from "@/lib/irrigationDecision";
import { useEffect, useState } from "react";
import { estimateTotalET } from "@/lib/utils/processReadings";
import { fetchLiveForecast } from "@/lib/weatherForecast";
import { FaTint, FaFaucet, FaCommentDots } from "react-icons/fa";
import ChatBubble from "@/components/ChatBubble";

const MapLibreGISMap = dynamic(() => import("@/components/MapLibreGISMap"), {
  ssr: false,
  loading: () => <div style={{ color: "#fff", textAlign: "center" }}>Loading map component...</div>,
});

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const today = new Date().toISOString().split("T")[0];
  const apiUrl = `/api/zentra/fetch-makwana?start_date=${encodeURIComponent(
    `${today} 00:00`
  )}&end_date=${encodeURIComponent(`${today} 23:59`)}`;

  const { data, error } = useSWR(apiUrl, fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  });

  const [userSettings, setUserSettings] = useState({ soilType: "Sandy Loam", rootDepth: 300, mad: 0.5 });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("irrigationSettings"));
      if (saved) setUserSettings(saved);
    }
  }, []);

  const [weatherData, setWeatherData] = useState(null);
  useEffect(() => {
    async function getWeather() {
      const lat = 56.9301676, lon = 24.1613327;
      const w = await fetchLiveForecast(lat, lon);
      setWeatherData(w);
    }
    getWeather();
  }, []);

  // popup states
  const [showPopup, setShowPopup] = useState(false);
  const [showChat, setShowChat] = useState(false);

   useEffect(() => {
    const tomorrow6 = new Date();
    tomorrow6.setDate(tomorrow6.getDate() + 1);
    tomorrow6.setHours(6, 0, 0, 0);
    fetch("/api/notifications/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleAt: tomorrow6.toISOString() }),
    }).catch(console.error);
  }, []);

  if (error)
    return <div style={{ color: "red", textAlign: "center" }}>Error loading sensor data: {error.message}</div>;
  if (!data)
    return <LoadingScreen message="Loading sensor data, please wait..." />;

  const readings = Array.isArray(data.data) ? data.data : [];
  if (readings.length < 2)
    return <div style={{ color: "#fff", textAlign: "center" }}>Not enough sensor data available.</div>;

  const last = readings[readings.length - 1];

  let combinedET = [];
  if (readings && weatherData) {
    combinedET = estimateTotalET(readings, weatherData, "5min");
  }
  const rainSeries =
    weatherData?.hourly?.rain?.slice(0, combinedET.length) || Array(combinedET.length).fill(0);

  const irrigationDecision = getIrrigationDecision({
    soilType: userSettings.soilType,
    rootDepth: userSettings.rootDepth,
    mad: userSettings.mad,
    etData: combinedET,
    rainData: rainSeries,
  });

  const devices = [
    {
      name: "ZL6 Maskavas",
      lat: 56.9301676,
      lng: 24.1613327,
      latest: {
        temp: last.port1_temp,
        wc: last.port1_wc,
        ec: last.port1_se_ec,
        timestamp: last.timestamp,
      },
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2d, #3a3f58)",
        padding: "2rem",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Irrigation Decision Button */}
      <button
        aria-label="Show Irrigation Decision"
        onClick={() => setShowPopup(true)}
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          zIndex: 999,
          background: "#2962ff",
          color: "#fff",
          borderRadius: "50%",
          width: 70,
          height: 70,
          border: "none",
          boxShadow: "0 8px 24px #0003",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          cursor: "pointer",
        }}
      >
        {irrigationDecision.decision === "Irrigation recommended" ? <FaFaucet /> : <FaTint />}
      </button>

      {/* Irrigation Popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(34,34,51,0.95)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              background: "#222",
              borderRadius: "18px",
              padding: "2rem 3rem",
              boxShadow: "0 2px 30px #000c",
              textAlign: "center",
              color: "#fff",
              minWidth: 320,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {irrigationDecision.decision === "Irrigation recommended" ? (
                <FaFaucet color="#4fc3f7" />
              ) : (
                <FaTint color="#4caf50" />
              )}
            </div>
            <h2 style={{ margin: "0 0 8px 0" }}>Irrigation Decision</h2>
            <div style={{ fontSize: 18, marginBottom: 12 }}>{irrigationDecision.decision}</div>
            <div style={{ fontSize: 15 }}>
              Depletion: <b>{irrigationDecision.currentDepletion} mm</b>
              <br />
              Threshold: <b>{irrigationDecision.threshold} mm</b>
            </div>
            <button
              style={{
                marginTop: 22,
                background: "#2962ff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.8rem",
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header / Logo */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <Image
          src="/ECOIGM_Logo_RGB.png"
          alt="Company Logo"
          width={300}
          height={150}
          style={{ objectFit: "contain", objectPosition: "center" }}
          quality={100}
        />
        <p style={{ marginTop: 8 }}>
          Last Updated: {last.timestamp ? new Date(last.timestamp).toLocaleString() : ""}
        </p>
      </div>

      {/* Map Card */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: "linear-gradient(145deg, #2A244A, #3F3565)",
            border: "1px solid rgba(255, 77, 128, 0.5)",
            borderRadius: "10px",
            padding: "1rem",
            color: "#fff",
            boxShadow: "0 0 10px rgba(255, 77, 128, 0.3)",
            width: 600,
            height: 600,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", textAlign: "center", color: "#FF4D80" }}>
            Device Location Map
          </h2>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              overflow: "visible",
              background: "#252244",
            }}
          >
            <MapLibreGISMap deviceLocations={devices} />
          </div>
        </div>
      </div>

      {/* Chat Icon */}
      <button
        aria-label="Open Chat"
        onClick={() => setShowChat(true)}
        style={{
          position: "fixed",
          right: 110,
          bottom: 32,
          zIndex: 999,
          background: "#2962ff",
          color: "#fff",
          borderRadius: "50%",
          width: 70,
          height: 70,
          border: "none",
          boxShadow: "0 8px 24px #0003",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          cursor: "pointer",
        }}
      >
        <FaCommentDots />
      </button>

      {/* Chat Bubble */}
      {showChat && <ChatBubble onClose={() => setShowChat(false)} />}
    </div>
  );
}
