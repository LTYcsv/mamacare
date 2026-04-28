import { COLORS } from "../constants";

export function BackBtn({ onClick, light = false }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 14, border: "none", cursor: "pointer",
      background: light ? "rgba(255,255,255,0.18)" : COLORS.white,
      color: light ? COLORS.white : COLORS.dark,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
      boxShadow: light ? "none" : "0 2px 8px rgba(45,36,32,0.1)",
    }}>‹</button>
  );
}
