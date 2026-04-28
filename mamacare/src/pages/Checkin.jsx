import { useState } from "react";
import { COLORS, MOODS, SYMPTOMS, inp, fmtFull } from "../constants";
import { Btn, Label, BackBtn, Chip } from "../components";

export function Checkin({ onBack, onSave }) {
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [text, setText] = useState("");
  const [activity, setActivity] = useState("");
  const [diet, setDiet] = useState("");
  const toggle = k => setSymptoms(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(160deg,#EEF5F2,#FAF7F2)", padding: "44px 24px 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <BackBtn onClick={onBack} />
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 500, color: COLORS.dark }}>Как вы сегодня?</span>
        </div>
        <div style={{ fontSize: 13, color: COLORS.mid }}>{fmtFull(new Date())}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 40px" }}>
        <Label style={{ marginTop: 12 }}>Настроение</Label>
        <div style={{ display: "flex", gap: 7 }}>
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setMood(m)} style={{
              flex: 1, height: 64, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, border: `2px solid ${mood?.label === m.label ? COLORS.rose : "transparent"}`,
              borderRadius: 16, cursor: "pointer", fontFamily: "inherit",
              background: mood?.label === m.label ? COLORS.rosePale : COLORS.white,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontSize: 9, color: COLORS.light }}>{m.label}</span>
            </button>
          ))}
        </div>

        <Label>Самочувствие</Label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Тошнота, усталость, боли — всё важно..."
          style={{ ...inp, borderRadius: 18, lineHeight: 1.6, resize: "none", minHeight: 76, display: "block" }} />

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          {SYMPTOMS.map(s => (
            <Chip key={s.key} label={`${s.icon} ${s.label}`} active={symptoms.includes(s.key)} onClick={() => toggle(s.key)} />
          ))}
        </div>

        <Label>Физическая активность</Label>
        <textarea value={activity} onChange={e => setActivity(e.target.value)}
          placeholder="Прогулка, йога, плавание... Сколько минут?"
          style={{ ...inp, borderRadius: 18, lineHeight: 1.6, resize: "none", minHeight: 60, display: "block" }} />

        <Label>Питание</Label>
        <textarea value={diet} onChange={e => setDiet(e.target.value)}
          placeholder="Что ели? Пили ли достаточно воды?"
          style={{ ...inp, borderRadius: 18, lineHeight: 1.6, resize: "none", minHeight: 60, display: "block" }} />

        <div style={{ marginTop: 22 }}>
          <Btn onClick={() => mood && onSave({ mood, symptoms, text, activity, diet })} disabled={!mood}>Сохранить</Btn>
        </div>
      </div>
    </div>
  );
}
