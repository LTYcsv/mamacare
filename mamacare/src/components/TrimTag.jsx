import { COLORS, getTrimester } from "../constants";

export function TrimTag({ week }) {
  return (
    <span style={{ background: COLORS.rosePale, color: COLORS.rose, borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
      {getTrimester(week)}
    </span>
  );
}
