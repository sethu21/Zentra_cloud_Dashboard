"use client";

import Image from "next/image";

export default function HomePage() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e2d, #3a3f58)",
      }}
    >
      {/* Centered container that the image will fill */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "80%",
          height: "80%",
          transform: "translate(-50%, -50%)",
          background: "#2f2f3d",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <Image
          src="/ECOIGM_Logo_White_small.png"
          alt="Company Logo"
          fill
          style={{
            objectFit: "contain", // Ensures the image scales to fit the container
            objectPosition: "center",
          }}
          quality={100}
        />
      </div>
    </div>
  );
}
