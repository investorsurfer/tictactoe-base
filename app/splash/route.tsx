import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 200, height: 200 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 80,
          fontWeight: "bold",
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: "#34d399" }}>X</span>
        <span style={{ color: "#6b7280" }}>O</span>
      </div>
    ),
    { ...size }
  );
}
