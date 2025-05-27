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

// registering stuff for chart.js to behave
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

export default function ECChart({ data }) {
    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Line
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,

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
                                callback: (val) => {
                                    const timeVal = new Date(val);
                                    return timeVal.toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                },
                            },
                            grid: { color: "#444" },
                        },
                        y: {
                            ticks: { color: "#fff" },
                            grid: { color: "#444" },
                        },
                    },

                    plugins: {
                        legend: {
                            position: "top",
                            labels: {
                                color: "#fff",
                            },
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                            callbacks: {
                                title: (items) => {
                                    const dateThing = new Date(items[0].parsed.x);
                                    return dateThing.toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                },
                                label: (ctx) => {
                                    return `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(3)} mm`;
                                },
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
                                drag: { enabled: true },
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
