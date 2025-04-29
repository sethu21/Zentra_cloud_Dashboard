"use client";

import React from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);


export default function TempChart({ data }) {
   return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
  
            // ---- SCALE DEFINITIONS ----
            scales: {
              x: {
                type: "time",
                time: {
                  tooltipFormat: "dd/MM/yy HH:mm",
                },
                ticks: {
                  color: "#fff",
                  autoSkip: true,
                  maxRotation: 0,
                  callback: (value) => {
                    // value is a timestamp (ms) or date string
                    const date = new Date(value);
                    return date.toLocaleString("en-GB", {
                      day:   "2-digit",
                      month: "2-digit",
                      year:  "2-digit",
                      hour:  "2-digit",
                      minute:"2-digit",
                    });
                  },
                },
                grid: {
                  color: "#444",
                },
              },
              y: {
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "#444",
                },
              },
            },
  
            // ---- PLUGINS ----
            plugins: {
              legend: {
                position: "top",
                labels: { color: "#fff" },
              },
              tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                  title: (items) => {
                    const date = new Date(items[0].parsed.x);
                    return date.toLocaleString("en-GB", {
                      day:   "2-digit",
                      month: "short",
                      year:  "numeric",
                      hour:  "2-digit",
                      minute:"2-digit",
                    });
                  },
                  label: (ctx) =>
                    `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)} mm`,
                },
              },
              zoom: {
                pan: {
                  enabled: true,
                  mode: "x",
                  modifierKey: "ctrl",
                },
                zoom: {
                  wheel: { enabled: true },
                  drag:  { enabled: true },
                  mode: "x",
                },
                limits: {
                  x: { min: "original", max: "original" },
                  y: { min: "original", max: "original" },
                },
              },
            },
          }}
        />
      </div>
    );
  }
  