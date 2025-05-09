// File: src/components/Navbar.js
"use client";

import { Bell, UserCircle } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const leftSectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const logoContainerStyle = {
    position: "relative",
    width: "96px",
    height: "96px",
  };

  return (
    <header className="top-navbar flex items-center justify-between px-4 bg-gray-900">
      {/* Left Section: Logo and Title */}
      <div style={leftSectionStyle}>
        <div style={logoContainerStyle}>
          <Image
            src="/ECOIGM_Logo_RGB.png"
            alt="ECOIGM Logo"
            width={96}
            height={96}
            className="object-contain"
            quality={100}
          />
        </div>
        <h1 className="text-white text-xl font-semibold">ECOIGM Dashboard</h1>
      </div>
    </header>
  );
}
