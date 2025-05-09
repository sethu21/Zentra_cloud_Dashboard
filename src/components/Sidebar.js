// File: src/components/Sidebar.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Thermometer,
  Droplet,
  FileText,
  Settings,
  User,
  Layers,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="sidebar flex flex-col justify-between h-full">
      {/* Top nav links */}
      <div>
        <div className="text-xl font-semibold">Sensor Dashboard</div>
        <div className="mt-6 space-y-1">
          <Link href="/" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link href="/devices/zl6-makwana" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded">
            <Thermometer size={20} />
            <span>ZL6 DataLogger</span>
          </Link>
          <Link href="/devices/zl6-makwana/mesocosm1" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded pl-10">
            <Layers size={18} />
            <span>Mesocosm 1</span>
          </Link>
          <Link href="/devices/zl6-makwana/mesocosm2" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded pl-10">
            <Layers size={18} />
            <span>Mesocosm 2</span>
          </Link>
          <Link href="/sensor/evapotranspiration_soil" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded">
            <Droplet size={20} />
            <span>ET</span>
          </Link>
          <Link href="/sensor/summary" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded">
            <FileText size={20} />
            <span>Summary</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Bottom user section */}
      <div className="mt-6 space-y-1">
        {/* Profile display */}
        <div
          onClick={() => router.push("/profile")}
          className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded cursor-pointer"
        >
          <User size={20} />
          <span>{session?.user?.name ?? "Profile"}</span>
        </div>

        {/* Sign out as a Link */}
        <Link
          href={`/api/auth/signout?callbackUrl=${encodeURIComponent("/login")}`}
          className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Link>
      </div>
    </nav>
  );
}
