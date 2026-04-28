import { COLORS } from "../constants";

export function Toast({ msg, visible }) {
  return (
    <div style={{
      position: "absolute", bottom: 88, left: 20, right: 20,
      background: COLORS.dark, color: COLORS.white,
      borderRadius: 16, padding: "13px 18px", fontSize: 13, lineHeight: 1.45,
      zIndex: 500, pointerEvents: "none",
      transition: "all 0.3s ease",
      transform: visible ? "translateY(0)" : "translateY(16px)",
      opacity: visible ? 1 : 0,
    }}>{msg}</div>
  );
}
