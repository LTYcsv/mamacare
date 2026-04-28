import { COLORS } from "../constants";

export function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: active ? COLORS.rosePale : COLORS.white,
      border: `1.5px solid ${active ? COLORS.rose : "rgba(45,36,32,0.12)"}`,
      color: active ? COLORS.rose : COLORS.mid,
      borderRadius: 100, padding: "8px 14px", fontSize: 12,
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
    }}>{label}</button>
  );
}
