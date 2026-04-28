import { useState } from "react";
import { COLORS, inp } from "../constants";
import { Btn, Label, BackBtn, TrimTag } from "../components";

export function ProfileSetup({ onBack, onNext }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [week, setWeek] = useState(8);

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "48px 24px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: COLORS.dark }}>О вас</span>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28, flexShrink: 0 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 100, background: i === 0 ? COLORS.rose : "rgba(45,36,32,0.15)" }} />)}
      </div>
      <div style={{ padding: "0 24px 40px" }}>
        <Label style={{ marginTop: 0 }}>Ваше имя</Label>
        <input style={inp} placeholder="Например, Алина" value={name} onChange={e => setName(e.target.value)} />

        <Label>Возраст</Label>
        <input style={inp} type="number" placeholder="28" value={age} onChange={e => setAge(e.target.value)} />

        <Label>Неделя беременности</Label>
        <div style={{ textAlign: "center", fontFamily: "'Fraunces',serif", fontSize: 52, fontWeight: 300, color: COLORS.dark, margin: "12px 0 8px" }}>
          {week} <span style={{ fontSize: 16, color: COLORS.mid }}>нед.</span>
        </div>
        <input type="range" min={1} max={42} value={week} onChange={e => setWeek(Number(e.target.value))}
          style={{ width: "100%", appearance: "none", height: 4, borderRadius: 100, outline: "none", cursor: "pointer", background: `linear-gradient(to right,${COLORS.rose} ${(week - 1) / 41 * 100}%,rgba(45,36,32,0.12) 0%)` }} />
        <div style={{ textAlign: "center", marginTop: 10 }}><TrimTag week={week} /></div>

        <div style={{ marginTop: 28 }}>
          <Btn onClick={() => name.trim() && onNext({ name: name.trim(), age, week })} disabled={!name.trim()}>Далее →</Btn>
        </div>
      </div>
    </div>
  );
}
