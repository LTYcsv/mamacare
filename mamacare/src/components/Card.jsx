import { COLORS } from "../constants";

export function Card({ children, style: s = {} }) {
  return <div style={{ background: COLORS.white, borderRadius: 24, padding: 20, boxShadow: "0 2px 16px rgba(45,36,32,0.07)", ...s }}>{children}</div>;
}
