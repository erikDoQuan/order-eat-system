import React from "react";

export default function StatCard({ icon, label, value, color = "#1787e0" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px #0001",
        padding: "24px 32px",
        minWidth: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 32, color, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>{value}</div>
      <div style={{ fontSize: 16, color: "#888", fontWeight: 500 }}>{label}</div>
    </div>
  );
} 