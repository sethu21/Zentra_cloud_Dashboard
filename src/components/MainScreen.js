"use client";

export default function MainScreen({ children }) {
  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-50 text-gray-800">
      {children}
    </div>
  );
}
