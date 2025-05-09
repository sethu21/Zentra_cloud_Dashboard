// File: src/app/layout.js
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/login?") ||
    pathname.startsWith("/register?");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {isLoading ? (
            <div className="loading-container">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img src="/ECOIGM_Logo_RGB.png" alt="ECOIGM Logo" />
                <div>Loading... Please wait</div>
              </div>
            </div>
          ) : (
            <div className="main-container flex">
              {/* Only show navbar/sidebar on non-auth pages */}
              {!isAuthPage && <Sidebar />}
              <div className="flex-1 flex flex-col">
                {!isAuthPage && <Navbar />}
                <div className="content-wrapper p-6">
                  {children}
                </div>
              </div>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
