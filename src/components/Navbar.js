import { Bell, UserCircle } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
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
    <header className="top-navbar flex items-center justify-between px-4">
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
        <h1>ECOIGM Dashboard</h1>
      </div>


      {/* Right Section: Notifications and User Profile */}
      <div className="flex items-center gap-6">
        <button className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition">
          <Bell size={24} className="text-white" />
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition">
          <UserCircle size={28} className="text-white" />
          <div className="flex flex-col">
            <span className="font-medium text-sm text-white">Sethu</span>
            <span className="text-gray-400 text-xs">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}