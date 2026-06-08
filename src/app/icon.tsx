import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

function KanbanMark({ scale = 1 }: { scale?: number }) {
  const barWidth = 5 * scale;
  const gap = 3 * scale;
  const radius = 2 * scale;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap,
        height: 18 * scale,
      }}
    >
      <div
        style={{
          width: barWidth,
          height: 11 * scale,
          background: "rgba(255,255,255,0.75)",
          borderRadius: radius,
        }}
      />
      <div
        style={{
          width: barWidth,
          height: 16 * scale,
          background: "white",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={8 * scale}
          height={8 * scale}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 6.2 5 8.7 9.5 3.8"
            stroke="#4f46e5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        style={{
          width: barWidth,
          height: 9 * scale,
          background: "rgba(255,255,255,0.75)",
          borderRadius: radius,
        }}
      />
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #312e81 0%, #4f46e5 45%, #6366f1 100%)",
          borderRadius: 7,
        }}
      >
        <KanbanMark />
      </div>
    ),
    { ...size }
  );
}
