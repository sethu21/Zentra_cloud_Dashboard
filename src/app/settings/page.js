"use client";

import React, { useState, useEffect } from "react";
import { SOIL_DATABASE, PLANT_DATABASE } from "@/lib/irrigationDecision";

export default function SettingsPage() {
  const [soilType, setSoilType] = useState("Sandy Loam");
  const [plantType, setPlantType] = useState("Salix Integra");
  const [rootDepth, setRootDepth] = useState(300); // starting value
  const [managementAllowableDepletion, setMAD] = useState(0.5); // starting MAD
  let tempCount = 0; // for checking updates later

  // try loading previous settings if there
  useEffect(() => {
    const saved = localStorage.getItem("irrigationSettings");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.soilType) setSoilType(data.soilType);
      if (data.plantType) setPlantType(data.plantType);
      if (data.rootDepth) setRootDepth(data.rootDepth);
      if (data.mad) setMAD(data.mad);
    }
  }, []);

  // update when the plant type changes
  useEffect(() => {
    const update = PLANT_DATABASE[plantType];
    if (update) {
      setRootDepth(update.rootDepth);
      setMAD(update.mad);
    }
  }, [plantType]);

  // auto-save when user changes something
  useEffect(() => {
    const stuff = {
      soilType,
      plantType,
      rootDepth,
      mad: managementAllowableDepletion
    };
    localStorage.setItem("irrigationSettings", JSON.stringify(stuff));
  }, [soilType, plantType, rootDepth, managementAllowableDepletion]);

  // handlers for form stuff
  const changeSoil = (e) => setSoilType(e.target.value);
  const changePlant = (e) => setPlantType(e.target.value);
  const changeDepth = (e) => setRootDepth(+e.target.value);
  const changeMAD = (e) => setMAD(+e.target.value);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "#333" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>
        Irrigation Settings</h1>
      <div style={{ maxWidth: 400, margin: "auto", background: "#444", padding: "1rem", borderRadius: 8 }}>
        <label>
          Soil Type
          <select value={soilType} onChange={changeSoil} style={{ width: "100%", margin: "0.5rem 0" }}>

            {SOIL_DATABASE ? (
              Object.keys(SOIL_DATABASE).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))
            ) : (
              <option disabled>still loading...</option>
            )}
          </select>
        </label>

        <label>
          Plant Type
          <select value={plantType} onChange={changePlant} 
          style={{ width: "100%", margin: "0.5rem 0" }}>
            {PLANT_DATABASE ? (
              Object.keys(PLANT_DATABASE).map((plant) => (
                <option key={plant} value={plant}>{plant}
                </option>
              ))
            ) : (
              <option disabled>still loading...</option>
            )}
          </select>
        </label>

        <label>
          Root Depth (mm)
          <input
            type="number"
            value={rootDepth}
            onChange={changeDepth}
            style={{ width: "100%", margin: "0.5rem 0" }}
            min={50}
            max={1000}
          />
        </label>

        <label>
          Management Allowable Depletion (MAD)
          <input
            type="number"
            step={0.01}
             value={managementAllowableDepletion}
            onChange={changeMAD}
            style={{ width: "100%", margin: "0.5rem 0" }}
            min={0.1}
            max={0.8}
          />
        </label>

        
        {tempCount > 0 && <pre style={{ color: "red" }}>tempCount: {tempCount}</pre>}
        
      </div>
    </div>
  ); // future need to add the features of chnaging the user name in here that will be good 
}
