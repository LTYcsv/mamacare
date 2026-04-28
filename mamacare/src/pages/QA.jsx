import { COLORS } from "../constants";
import { Label, BottomNav } from "../components";

export function QA({ onOpenChat, onNav }) {
  const cats = [
    { icon: "🩺", bg: COLORS.rosePale, title: "Физическое состояние", sub: "Симптомы, самочувствие, питание" },
    { icon: "💛", bg: "#FEF3C7", title: "Эмоции и настроение", sub: "Тревога, страхи, поддержка" },
    { icon: "📋", bg: COLORS.sagePale, title: "Организационные вопросы", sub: "Документы, льготы, запись к врачу" },
  ];
  const quick = [
    "Можно ли пить кофе при беременности?",
    "Какова норма шевелений плода?",
    "Отёки ног — это опасно?",
    "Когда уходят в декрет?",
    "Что проверяют на УЗИ на 20 неделе?",
  ];

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ background: "linear-gradient(160deg,#EEF5F2,#FAF7F2)", padding: "44px 24px 20px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: COLORS.dark }}>Ассистент</div>
        <div style={{ fontSize: 14, color: COLORS.mid, marginTop: 3 }}>Задайте вопрос по доказательной медицине</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 88px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
          {cats.map(cat => (
            <div key={cat.title} onClick={() => onOpenChat(cat.title)}
              style={{ background: COLORS.white, borderRadius: 22, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 2px 10px rgba(45,36,32,0.05)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.dark, marginBottom: 2 }}>{cat.title}</div>
                <div style={{ fontSize: 12, color: COLORS.light }}>{cat.sub}</div>
              </div>
              <div style={{ color: COLORS.light, fontSize: 18 }}>›</div>
            </div>
          ))}
        </div>

        <Label>Часто спрашивают</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {quick.map(q => (
            <button key={q} onClick={() => onOpenChat(null, q)}
              style={{ background: COLORS.white, border: `1.5px solid rgba(45,36,32,0.1)`, borderRadius: 100, padding: "8px 14px", fontSize: 12, color: COLORS.mid, cursor: "pointer", fontFamily: "inherit" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="assistant" onDiary={() => onNav("diary")} onAssistant={() => {}} onProfile={() => onNav("profile")} />
    </div>
  );
}
