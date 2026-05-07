import { useState, useEffect } from "react";
import { COLORS, MOODS } from "../constants";
import { Label, Card, BackBtn } from "../components";
import { callSummaryAgent } from "../lib/api";

export function Summary({ onBack, entries, user, alertSymptoms }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const recent = entries.filter(e => (Date.now() - new Date(e.date).getTime()) < 7 * 86400000);
  const scores = recent.map(e => MOODS.find(m => m.label === e.moodLabel)?.score || 3);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";

  useEffect(() => {
    setLoading(true);
    callSummaryAgent().then(r => { setResult(r); setLoading(false); });
  }, []);

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(160deg,#2D2420,#3D3330)", padding: "44px 24px 28px", color: COLORS.white, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <BackBtn onClick={onBack} light />
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}>AI-резюме</span>
        </div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 500 }}>Анализ недели</div>
        <div style={{ fontSize: 13, opacity: 0.55, marginTop: 3 }}>{user.week} неделя · последние 7 дней</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 16 }}>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 60, color: COLORS.roseLight, lineHeight: 1 }}>{avg}</span>
          <span style={{ fontSize: 14, opacity: 0.65 }}>средний балл</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const sc = scores[i];
            return <div key={i} style={{ flex: 1, height: 7, borderRadius: 100, background: !sc ? "rgba(255,255,255,0.12)" : sc >= 4 ? COLORS.sageLight : sc >= 3 ? "#F5D78B" : COLORS.rose }} />;
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 40px" }}>
        <Label style={{ marginTop: 0 }}>Анализ AI</Label>
        {loading ? (
          <div style={{ background: "linear-gradient(135deg,#2D2420,#3D3330)", borderRadius: 22, padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 6, height: 6, background: COLORS.roseLight, borderRadius: "50%", animation: `pulse 1.2s ease ${d}s infinite` }} />)}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Анализирую записи...</span>
          </div>
        ) : (
          <Card><div style={{ fontSize: 14, lineHeight: 1.75, color: COLORS.dark, whiteSpace: "pre-line" }}>{result}</div></Card>
        )}

        <Label>Статус</Label>
        {alertSymptoms.length > 0 ? (
          <div style={{ background: COLORS.alertPale, border: `1.5px solid rgba(224,123,69,0.3)`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.alert, marginBottom: 3 }}>Стоит обсудить с врачом</div>
              <div style={{ fontSize: 12, color: COLORS.mid, lineHeight: 1.4 }}>Выявлены: {alertSymptoms.map(([s]) => s).join(", ")}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: COLORS.sagePale, border: `1.5px solid ${COLORS.sageLight}`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.sage, marginBottom: 3 }}>Всё в порядке</div>
              <div style={{ fontSize: 12, color: COLORS.mid }}>Тревожных симптомов не выявлено. Продолжайте вести дневник!</div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: COLORS.light, textAlign: "center", lineHeight: 1.5, paddingTop: 20 }}>
          ⚕️ AI — помощник, не врач. Рекомендации носят информационный характер.
        </div>
      </div>
    </div>
  );
}
