"use client";
import { useState, useEffect } from "react";
import { SOIL_DATABASE, PLANT_DATABASE } from "@/lib/irrigationDecision";

export default function SettingsPage() {
  const [soilType, setSoilType] = useState("Sandy Loam");
  const [plantType, setPlantType] = useState("Salix Integra");
  const [rootDepth, setRootDepth] = useState(PLANT_DATABASE["Salix Integra"].rootDepth);
  const [mad, setMad] = useState(PLANT_DATABASE["Salix Integra"].mad);

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("irrigationSettings"));
    if (saved) {
      setSoilType(saved.soilType || soilType);
      setPlantType(saved.plantType || plantType);
      setRootDepth(saved.rootDepth || rootDepth);
      setMad(saved.mad || mad);
    }
    
  }, []);

  // Update rootDepth and mad if plantType changes (unless user overrides)
  useEffect(() => {
    setRootDepth(PLANT_DATABASE[plantType]?.rootDepth || 300);
    setMad(PLANT_DATABASE[plantType]?.mad || 0.5);
  }, [plantType]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      "irrigationSettings",
      JSON.stringify({ soilType, plantType, rootDepth, mad })
    );
  }, [soilType, plantType, rootDepth, mad]);

  return (
    <main className="p-6 max-w-xl mx-auto text-white">
      <h2 className="text-2xl mb-4">Irrigation Decision Settings</h2>
      <form className="flex flex-col gap-6">
        <div>
          <label>Soil Type:</label>
          <select value={soilType} onChange={e => setSoilType(e.target.value)} className="ml-2 text-black">
            {Object.keys(SOIL_DATABASE).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Plant Type:</label>
          <select value={plantType} onChange={e => setPlantType(e.target.value)} className="ml-2 text-black">
            {Object.keys(PLANT_DATABASE).map(plant => (
              <option key={plant} value={plant}>{plant}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Root Depth (mm):</label>
          <input
            type="number"
            value={rootDepth}
            onChange={e => setRootDepth(Number(e.target.value))}
            min={50}
            max={1000}
            className="ml-2 text-black"
          />
        </div>
        <div>
          <label>Management Allowable Depletion (MAD):</label>
          <input
            type="number"
            step={0.01}
            min={0.1}
            max={0.8}
            value={mad}
            onChange={e => setMad(Number(e.target.value))}
            className="ml-2 text-black"
          />
          <span className="ml-2">(e.g., 0.5 = 50%)</span>
        </div>
        <div className="text-green-400">
          <p>Your irrigation settings are saved automatically.</p>
        </div>
      </form>
    </main>
  );
}
