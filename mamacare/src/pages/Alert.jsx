import { COLORS, ALERT_SYMPTOMS } from "../constants";
import { Btn, Card, Label, BackBtn } from "../components";

export function Alert({ onBack, onChat, alertSymptoms, doctor, entries }) {
  const syms = alertSymptoms.length > 0 ? alertSymptoms :
    (entries.slice(-1)[0]?.symptoms.filter(s => ALERT_SYMPTOMS.includes(s)).map(s => [s, 1]) || []);
  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ background: "linear-gradient(160deg,#FEF0E6,#FAF7F2)", padding: "44px 24px 28px", flexShrink: 0 }}>
        <div style={{ marginBottom: 14 }}><BackBtn onClick={onBack} /></div>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, color: COLORS.dark, fontWeight: 500, marginBottom: 8 }}>Тревожные симптомы</div>
        <div style={{ fontSize: 14, color: COLORS.mid, lineHeight: 1.55 }}>AI обнаружил симптомы, которые стоит обсудить с врачом в течение 24 часов.</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {syms.map(([s, c]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 7, height: 7, background: COLORS.alert, borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: COLORS.mid }}>{s}{c > 1 ? ` · ${c} раза` : ""}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "18px 24px 40px" }}>
        <Label style={{ marginTop: 0 }}>Ваш врач</Label>
        <Card style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: COLORS.sagePale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👩‍⚕️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{doctor?.name || "Врач не указан"}</div>
            {doctor?.spec && <div style={{ fontSize: 12, color: COLORS.mid }}>{doctor.spec}{doctor.clinic ? ` · ${doctor.clinic}` : ""}</div>}
            {doctor?.phone && <div style={{ fontSize: 11, color: COLORS.sage, marginTop: 3 }}>📞 {doctor.phone}</div>}
            {!doctor?.name && <div style={{ fontSize: 11, color: COLORS.light }}>Добавьте врача в профиле</div>}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {doctor?.phone && <Btn variant="rose">📞 Позвонить в клинику</Btn>}
          <Btn variant="outline" onClick={onChat}>💬 Спросить AI-ассистента</Btn>
          <Btn variant="ghost" onClick={onBack} style={{ textAlign: "center" }}>Я уже у врача</Btn>
        </div>
        <div style={{ fontSize: 11, color: COLORS.light, textAlign: "center", lineHeight: 1.5, marginTop: 20 }}>
          ⚕️ MamaCare не ставит диагнозы. Решение принимает только врач.
        </div>
      </div>
    </div>
  );
}
