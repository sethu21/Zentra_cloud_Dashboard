"use client";

import { useState, useEffect } from "react";
import { SOIL_DATABASE, PLANT_DATABASE } from "@/lib/irrigationDecision";

export default function SettingsPage() {
  const [soilType, setSoilType] = useState("Sandy Loam");
  const [plantType, setPlantType] = useState("Salix Integra");
  const [rootDepth, setRootDepth] = useState(PLANT_DATABASE[plantType].rootDepth);
  const [mad, setMad] = useState(PLANT_DATABASE[plantType].mad);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("irrigationSettings") || "{}");
    if (saved) {
      setSoilType(saved.soilType || soilType);
      setPlantType(saved.plantType || plantType);
      setRootDepth(saved.rootDepth || rootDepth);
      setMad(saved.mad || mad);
    }
  }, []);

  useEffect(() => {
    setRootDepth(PLANT_DATABASE[plantType]?.rootDepth || 300);
    setMad(PLANT_DATABASE[plantType]?.mad || 0.5);
  }, [plantType]);

  useEffect(() => {
    localStorage.setItem(
      "irrigationSettings",
      JSON.stringify({ soilType, plantType, rootDepth, mad })
    );
  }, [soilType, plantType, rootDepth, mad]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2d, #3a3f58)",
        padding: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #2A244A, #3F3565)",
          border: "1px solid rgba(255, 77, 128, 0.5)",
          borderRadius: "10px",
          padding: "2rem",
          minWidth: "320px",
          maxWidth: "420px",
          width: "100%",
          color: "#fff",
          boxShadow: "0 0 10px rgba(255, 77, 128, 0.3)",
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 600, textAlign: "center", marginBottom: 24 }}>
          Irrigation Settings
        </h2>

        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            <span>Soil Type</span>
            <select
              value={soilType}
              onChange={e => setSoilType(e.target.value)}
              style={inputStyle}
            >
              {Object.keys(SOIL_DATABASE).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Plant Type</span>
            <select
              value={plantType}
              onChange={e => setPlantType(e.target.value)}
              style={inputStyle}
            >
              {Object.keys(PLANT_DATABASE).map(plant => (
                <option key={plant} value={plant}>
                  {plant}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Root Depth (mm)</span>
            <input
              type="number"
              value={rootDepth}
              onChange={e => setRootDepth(+e.target.value)}
              style={inputStyle}
              min={50}
              max={1000}
            />
          </label>

          <label>
            <span>Management Allowable Depletion (MAD)</span>
            <input
              type="number"
              step={0.01}
              value={mad}
              onChange={e => setMad(+e.target.value)}
              style={inputStyle}
              min={0.1}
              max={0.8}
            />
          </label>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#4caf50",
            fontSize: 14,
          }}
        >
          Settings are saved automatically.
        </p>
      </div>
    </div>
  );
}

// Same input style as login page
const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #444",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 14,
};
