import React from "react";
import "../globals.css";

export const metadata = {
  title: "Sign In",
};

export default function LoginLayout({ children }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        {children}
      </div>
    );
  }