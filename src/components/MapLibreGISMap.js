"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapLibreGISMap({ deviceLocations, geoJsonData }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Function to determine marker color based on water content
  const getMarkerColor = (waterContent) => {
    if (waterContent > 0.3) return "#ff3333"; // Red for high water content (> 30%)
    if (waterContent > 0.2) return "#ffcc00"; // Yellow for medium (20-30%)
    return "#3388ff"; // Blue for low (< 20%)
  };

  useEffect(() => {
    setIsMounted(true);
    console.log("MapLibreGISMap component mounted");
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    // Validate deviceLocations
    if (!deviceLocations || !Array.isArray(deviceLocations) || deviceLocations.length === 0) {
      console.error("No device locations available to display on the map.");
      return;
    }

    const center = [deviceLocations[0].lng, deviceLocations[0].lat]; // MapLibre uses [lng, lat]
    if (!center[0] || !center[1] || isNaN(center[0]) || isNaN(center[1])) {
      console.error("Invalid map center coordinates.");
      return;
    }

    // Initialize the map
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: center,
      zoom: 15, // Closer zoom to show detailed geographical features
    });

    // Add navigation controls (zoom and rotation)
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Wait for the map to load before adding markers and layers
    mapRef.current.on("load", () => {
      // Add a source and layer for circles (to visualize water content)
      mapRef.current.addSource("devices", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: deviceLocations.map((device) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [device.lng, device.lat],
            },
            properties: {
              name: device.name,
              temp: device.latest?.temp,
              wc: device.latest?.wc,
              ec: device.latest?.ec,
              timestamp: device.latest?.timestamp,
            },
          })),
        },
      });

      // Add a circle layer for water content visualization
      mapRef.current.addLayer({
        id: "device-circles",
        type: "circle",
        source: "devices",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "wc"],
            0,
            10, // Minimum radius
            0.5,
            50, // Maximum radius
          ],
          "circle-color": [
            "step",
            ["get", "wc"],
            "#3388ff", // Blue for low (< 20%)
            0.2,
            "#ffcc00", // Yellow for medium (20-30%)
            0.3,
            "#ff3333", // Red for high (> 30%)
          ],
          "circle-opacity": 0.5,
        },
      });

      // Add a symbol layer for markers
      mapRef.current.addLayer({
        id: "device-markers",
        type: "circle",
        source: "devices",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "step",
            ["get", "wc"],
            "#3388ff",
            0.2,
            "#ffcc00",
            0.3,
            "#ff3333",
          ],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });
      mapRef.current.on("click", "device-markers", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, temp, wc, ec, timestamp } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="background-color: #2f2f2f; color: #fff; padding: 10px; border-radius: 5px; font-size: 14px;">
              <strong style="font-size: 16px; display: block; margin-bottom: 8px;">${name}</strong>
              <div style="margin-bottom: 5px;">
                🌡 <strong>Soil Temp:</strong> ${temp ? temp.toFixed(2) : "N/A"} °C
              </div>
              <div style="margin-bottom: 5px;">
                💧 <strong>Water Content:</strong> ${wc ? wc.toFixed(2) : "N/A"} m³/m³
              </div>
              <div style="margin-bottom: 5px;">
                ⚡ <strong>EC:</strong> ${ec ? ec.toFixed(2) : "N/A"} dS/m
              </div>
              <div>
                🕒 <strong>Timestamp:</strong> ${
                  timestamp ? new Date(timestamp).toLocaleString() : "No timestamp"
                }
              </div>
            </div>
          `)
          .addTo(mapRef.current);
      });
      mapRef.current.on("mouseenter", "device-markers", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "device-markers", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });

      
      if (geoJsonData) {
        mapRef.current.addSource("soil-types", {
          type: "geojson",
          data: geoJsonData,
        });

        // GeoJSON layer
        mapRef.current.addLayer({
          id: "soil-types-layer",
          type: "fill",
          source: "soil-types",
          paint: {
            "fill-color": "#ff7800", // color for soil type boundary
            "fill-opacity": 0.5,
            "fill-outline-color": "#ff7800",
          },
        });

        // Adds popups for GeoJSON layer
        mapRef.current.on("click", "soil-types-layer", (e) => {
          const coordinates = e.lngLat;
          const { name } = e.features[0].properties;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="background-color: #2f2f2f; color: #fff; padding: 10px; border-radius: 5px; font-size: 14px;">
                <strong>${name || "Unknown Soil Type"}</strong>
              </div>
            `)
            .addTo(mapRef.current);
        });

        mapRef.current.on("mouseenter", "soil-types-layer", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "soil-types-layer", () => {
          mapRef.current.getCanvas().style.cursor = "";
        });
      }
    });

    // legend for water content and GeoJSON layer
    const legendDiv = document.createElement("div");
    legendDiv.style.position = "absolute";
    legendDiv.style.bottom = "10px";
    legendDiv.style.right = "10px";
    legendDiv.style.background = "#2f2f2f";
    legendDiv.style.color = "#fff";
    legendDiv.style.padding = "10px";
    legendDiv.style.borderRadius = "5px";
    legendDiv.style.zIndex = "1000";
    legendDiv.innerHTML = `
      <h4 style="margin: 0 0 5px 0;">Legend</h4>
      <div>
        <span style="background: #ff3333; width: 18px; height: 18px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span>
        Water Content: High (> 30%)
      </div>
      <div>
        <span style="background: #ffcc00; width: 18px; height: 18px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span>
        Water Content: Medium (20-30%)
      </div>
      <div>
        <span style="background: #3388ff; width: 18px; height: 18px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span>
        Water Content: Low (< 20%)
      </div>
      <div>
        <span style="background: #ff7800; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></span>
        Soil Type Boundary (100m x 100m)
      </div>
    `;
    mapContainerRef.current.appendChild(legendDiv);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMounted, deviceLocations, geoJsonData]); // Add geoJsonData to dependencies

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "600px", 
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #4a4a4a",
        position: "relative",
      }}
    >
      {!isMounted && <div style={{ color: "#fff", textAlign: "center" }}>Loading map...</div>}
    </div>
  );
}