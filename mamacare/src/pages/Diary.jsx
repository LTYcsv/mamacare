import { COLORS, ALERT_SYMPTOMS, getTrimester, fmtShort, fmtFull } from "../constants";
import { Label, BottomNav } from "../components";

export function Diary({ user, entries, alertSymptoms, onCheckin, onSummary, onAlert, onNav }) {
  const today = new Date().toDateString();
  const todayEntry = entries.find(e => new Date(e.date).toDateString() === today);
  const recentEntries = [...entries].reverse().slice(0, 7);
  const w = user.week;
  const weekRange = Array.from({ length: 9 }, (_, i) => w - 4 + i).filter(x => x >= 1 && x <= 42);

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ background: "linear-gradient(160deg,#F9E8E5 0%,#FAF7F2 100%)", padding: "44px 24px 20px", flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: COLORS.mid, marginBottom: 2 }}>Добрый день,</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, color: COLORS.dark, fontWeight: 500 }}>{user.name} 🌸</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.white, borderRadius: 100, padding: "7px 16px", marginTop: 10, boxShadow: "0 2px 8px rgba(45,36,32,0.08)", fontSize: 13, fontWeight: 500, color: COLORS.dark }}>
          <div style={{ width: 7, height: 7, background: COLORS.rose, borderRadius: "50%" }} />
          {w} неделя · {getTrimester(w)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 24px", flexShrink: 0, scrollbarWidth: "none" }}>
        {weekRange.map(n => (
          <div key={n} style={{ flexShrink: 0, width: 46, height: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 14, background: n === w ? COLORS.dark : COLORS.white, color: n === w ? COLORS.white : COLORS.light, border: `1.5px solid ${n === w ? COLORS.dark : "transparent"}` }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{n}</span>
            <span style={{ fontSize: 10 }}>нед.</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 88px" }}>
        <Label style={{ marginTop: 8 }}>Сегодня</Label>
        <div onClick={onCheckin} style={{ background: COLORS.white, borderRadius: 22, padding: 18, position: "relative", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(45,36,32,0.06)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: COLORS.rose }} />
          <div style={{ fontSize: 26, marginBottom: 6 }}>{todayEntry ? todayEntry.emoji : "✏️"}</div>
          <div style={{ fontSize: 14, color: COLORS.mid, lineHeight: 1.5 }}>
            {todayEntry ? (todayEntry.text || `Настроение: ${todayEntry.moodLabel}`) : "Добавить запись о самочувствии на сегодня"}
          </div>
          <div style={{ fontSize: 11, color: COLORS.light, marginTop: 6 }}>{fmtFull(new Date())} · {todayEntry ? "Изменить" : "Нажмите, чтобы добавить"}</div>
        </div>

        {alertSymptoms.length > 0 && (
          <>
            <Label>Внимание</Label>
            <div onClick={onAlert} style={{ background: COLORS.alertPale, border: `1.5px solid rgba(224,123,69,0.3)`, borderRadius: 20, padding: "14px 16px", display: "flex", gap: 12, cursor: "pointer" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.alert, marginBottom: 2 }}>Тревожные симптомы</div>
                <div style={{ fontSize: 12, color: COLORS.mid, lineHeight: 1.4 }}>{alertSymptoms.map(([s]) => s).join(", ")} — стоит обсудить с врачом</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.alert, marginTop: 5 }}>Подробнее →</div>
              </div>
            </div>
          </>
        )}

        <Label>AI-инсайт недели</Label>
        <div onClick={onSummary} style={{ background: "linear-gradient(135deg,#2D2420,#3D3330)", borderRadius: 22, padding: 20, cursor: "pointer" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>🤖 MAMACARE AI</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.6 }}>
            {entries.length > 0 ? "Нажмите для AI-анализа записей за неделю →" : "Добавьте первые записи для анализа"}
          </div>
          {alertSymptoms.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {alertSymptoms.map(([s]) => <span key={s} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>⚠️ {s}</span>)}
            </div>
          )}
        </div>

        {recentEntries.length > 0 && (
          <>
            <Label>История записей</Label>
            {recentEntries.map(e => (
              <div key={e.id} style={{ background: COLORS.white, borderRadius: 18, padding: "14px 16px", marginBottom: 8, borderLeft: `4px solid ${COLORS.roseLight}`, boxShadow: "0 1px 6px rgba(45,36,32,0.05)" }}>
                <div style={{ fontSize: 11, color: COLORS.light, marginBottom: 3 }}>{fmtShort(e.date)}</div>
                <span style={{ fontSize: 18, marginRight: 6 }}>{e.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.dark }}>{e.moodLabel}</span>
                {e.text && <div style={{ fontSize: 13, color: COLORS.mid, marginTop: 5, lineHeight: 1.45 }}>{e.text.slice(0, 90)}{e.text.length > 90 ? "…" : ""}</div>}
                {e.symptoms.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 7 }}>
                    {e.symptoms.map(s => (
                      <span key={s} style={{ borderRadius: 100, padding: "2px 8px", fontSize: 10, background: ALERT_SYMPTOMS.includes(s) ? COLORS.alertPale : COLORS.rosePale, color: ALERT_SYMPTOMS.includes(s) ? COLORS.alert : COLORS.rose }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {entries.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.light, fontSize: 13 }}>Записей пока нет. Добавьте первую! 🌸</div>}
      </div>

      <button onClick={onCheckin} style={{ position: "absolute", bottom: 80, right: 18, width: 52, height: 52, background: COLORS.rose, border: "none", borderRadius: 18, cursor: "pointer", fontSize: 26, color: COLORS.white, boxShadow: "0 8px 24px rgba(232,132,122,0.5)", zIndex: 50 }}>+</button>

      <BottomNav active="diary" onDiary={() => {}} onAssistant={() => onNav("qa")} onProfile={() => onNav("profile")} />
    </div>
  );
}
