import { COLORS } from "../constants";

export function PhoneShell({ children }) {
  return (
    <div style={{
      width: 375, height: 812, borderRadius: 50, overflow: "hidden", position: "relative",
      boxShadow: "0 40px 80px rgba(45,36,32,0.22), 0 0 0 8px #2D2420, 0 0 0 11px #3D3330",
      flexShrink: 0, background: COLORS.cream,
    }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 118, height: 26, background: "#2D2420", borderRadius: "0 0 18px 18px", zIndex: 200 }} />
      {children}
    </div>
  );
}
