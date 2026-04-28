import { COLORS } from "../constants";

export function Btn({ children, onClick, variant = "dark", disabled = false, style: s = {} }) {
  const base = {
    width: "100%", border: "none", borderRadius: 100, padding: "16px 24px",
    fontFamily: "inherit", fontSize: 15, fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
    transition: "opacity 0.15s, transform 0.1s",
  };
  const v = {
    dark:    { background: COLORS.dark, color: COLORS.white },
    rose:    { background: COLORS.rose, color: COLORS.white },
    outline: { background: "transparent", color: COLORS.mid, border: `1.5px solid rgba(45,36,32,0.18)`, padding: "14px 24px" },
    ghost:   { background: "none", color: COLORS.mid, textDecoration: "underline", textUnderlineOffset: 3, width: "auto", padding: "8px 0", fontSize: 14 },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...s }}>{children}</button>;
}
