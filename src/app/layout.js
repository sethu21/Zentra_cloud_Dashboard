"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple loading screen for 1.5s
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <html lang="en">
      <body className="main-container">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen w-full text-3xl font-bold">
            Loading... Please wait
          </div>
        ) : (
          <>
            <Navbar />
            <Sidebar />
            <div className="content-wrapper">{children}</div>
          </>
        )}
      </body>
    </html>
  );
}
