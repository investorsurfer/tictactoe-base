import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
          {["X", "O", "X", "O", "X", "O", "O", "X", "O"].map((cell, i) => (
            <div
              key={i}
              style={{
                width: 100,
                height: 100,
                background: "#1a1a1a",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 52,
                fontWeight: "bold",
                color: cell === "X" ? "#34d399" : "#f87171",
              }}
            >
              {cell}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 64, fontWeight: "bold", color: "white", marginBottom: 12 }}>
          Tic Tac Toe
        </div>
        <div style={{ fontSize: 28, color: "#6b7280" }}>
          0.0001 ETH · play vs AI · no refunds · on Base
        </div>
      </div>
    ),
    { ...size }
  );
}
