import { COLORS } from "../constants";
import { Btn } from "../components";

export function Welcome({ onStart }) {
  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg,#F9E8E5 0%,#EEF5F2 55%,#FAF7F2 100%)", display: "flex", flexDirection: "column", padding: "72px 28px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", top: 60, right: -80, background: "radial-gradient(circle,rgba(232,132,122,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", bottom: 160, left: -50, background: "radial-gradient(circle,rgba(122,158,142,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 52, marginBottom: 20 }}>🌸</div>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 44, lineHeight: 1.05, color: COLORS.dark, marginBottom: 14, fontWeight: 500 }}>
        Мама<em style={{ fontStyle: "italic", color: COLORS.rose }}>Care</em>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: COLORS.mid, marginBottom: 36 }}>
        Личный дневник беременности с AI-ассистентом, который заботится о вас каждый день.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
        {["📔 Дневник", "🤖 AI-анализ", "👩‍⚕️ Врач", "⚠️ Алерты"].map(p => (
          <span key={p} style={{ background: COLORS.white, borderRadius: 100, padding: "7px 14px", fontSize: 12, fontWeight: 500, color: COLORS.mid, boxShadow: "0 2px 8px rgba(45,36,32,0.08)" }}>{p}</span>
        ))}
      </div>
      <div style={{ marginTop: "auto" }}>
        <Btn onClick={onStart}>Начать →</Btn>
      </div>
    </div>
  );
}
