import { ImageResponse } from "next/og";

export const alt = "FloBrain: the intelligence layer for every device";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social preview image for every page (1200x630). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#020617",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, marginBottom: 32 }}>FloBrain</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#CC34FF" }}>THE INTELLIGENCE LAYER</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#9333EA" }}>FOR EVERY DEVICE</div>
        <div style={{ fontSize: 28, marginTop: 40, color: "#A1A1AA", maxWidth: 960 }}>
          Workflow orchestration, persistent memory, and privacy-first AI for devices and apps.
        </div>
      </div>
    ),
    size,
  );
}
