import Link from "next/link";
import { Home, Thermometer, Droplet, FileText, Settings, User, Layers } from "lucide-react";

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="text-xl font-semibold">Sensor Dashboard</div>
      <div className="mt-6">
        <Link href="/" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/devices/zl6-makwana" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Thermometer size={20} />
          <span>ZL6 DataLogger</span>
        </Link>
        <Link href="/devices/zl6-makwana/mesocosm1" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition pl-10">
          <Layers size={18} />
          <span>Mesocosm 1</span>
        </Link>
        <Link href="/devices/zl6-makwana/mesocosm2" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition pl-10">
          <Layers size={18} />
          <span>Mesocosm 2</span>
        </Link>
        <Link href="/sensor/evapotranspiration_soil" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Droplet size={20} />
          <span>ET</span>
        </Link>
        <Link href="/sensor/summary" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <FileText size={20} />
          <span>Summary</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <User size={20} />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
