import { useState } from "react";
import { COLORS, inp } from "../constants";
import { Btn, Label, BackBtn } from "../components";

export function DoctorSetup({ onBack, onNext, onSkip }) {
  const [f, setF] = useState({ name: "", spec: "", phone: "", clinic: "", addr: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const fields = [
    ["name", "ФИО врача", "Иванова Мария Сергеевна"],
    ["spec", "Специализация", "Акушер-гинеколог"],
    ["phone", "Телефон клиники", "+7 (495) 000-00-00"],
    ["clinic", "Название клиники", "Клиника «Здоровье»"],
    ["addr", "Адрес", "ул. Пушкина, д. 1"],
  ];
  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "48px 24px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: COLORS.dark }}>Ваш врач</span>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28, flexShrink: 0 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: i === 1 ? 24 : 8, height: 8, borderRadius: 100, background: i === 1 ? COLORS.rose : "rgba(45,36,32,0.15)" }} />)}
      </div>
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{ background: `linear-gradient(135deg,${COLORS.sage},#5E8A7A)`, borderRadius: 24, padding: 20, marginBottom: 20, color: COLORS.white }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👩‍⚕️</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, marginBottom: 4, fontWeight: 500 }}>Зачем это нужно?</div>
          <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>При тревожных симптомах MamaCare поможет быстро связаться с вашим врачом.</div>
        </div>
        {fields.map(([k, label, ph]) => (
          <div key={k}>
            <Label style={{ marginTop: k === "name" ? 0 : undefined }}>{label}</Label>
            <input style={inp} placeholder={ph} value={f[k]} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn onClick={() => onNext(f)}>Готово →</Btn>
          <Btn variant="outline" onClick={onSkip} style={{ width: "auto", padding: "14px 20px" }}>Пропустить</Btn>
        </div>
      </div>
    </div>
  );
}
