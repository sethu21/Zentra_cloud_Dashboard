import { Bell, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="top-navbar flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">ZL6 Dashboard</h1>
      <div className="flex items-center gap-6">
        <button className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition">
          <Bell size={24} />
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            3
          </span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition">
          <UserCircle size={32} />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Sethu</span>
            <span className="text-gray-400 text-xs">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
