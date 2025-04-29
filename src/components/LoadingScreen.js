"use client";

export default function LoadingScreen({
  logoSrc = "/ECOIGM_Logo_RGB.png",
  message = "Loading... Please wait",
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e2d, #3a3f58)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={logoSrc}
          alt="ECOIGM Logo"
          style={{ width: "200px", height: "auto", marginBottom: "8px" }}
        />
        <div style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}>
          {message}
        </div>
      </div>
    </div>
  );
}
