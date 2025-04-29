"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <html lang="en">
      <body>
        {isLoading ? (
          <div className="loading-container">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src="/ECOIGM_Logo_RGB.png" alt="ECOIGM Logo" />
              <div>Loading... Please wait</div>
            </div>
          </div>
        ) : (
          <div className="main-container">
            <Navbar />
            <Sidebar />
            <div className="content-wrapper">
              {children} {/* Render HomePage content here */}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}