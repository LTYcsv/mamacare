import { COLORS } from "../constants";

export function Label({ children, style: s = {} }) {
  return <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 10, marginTop: 22, ...s }}>{children}</div>;
}
