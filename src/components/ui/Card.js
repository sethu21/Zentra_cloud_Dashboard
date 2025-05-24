export default function Card({ children, style }) {
    return (
      <div
        style={{
          background: "#1F1F2E",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          padding: "1rem",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
  