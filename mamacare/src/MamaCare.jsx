import { useState, useRef, useEffect } from "react";

// ─── КОНСТАНТЫ ────────────────────────────────────────────────────────────────
const COLORS = {
  rose: "#E8847A",
  rosePale: "#FDF0EF",
  roseLight: "#F5C4C0",
  sage: "#7A9E8E",
  sagePale: "#EEF5F2",
  sageLight: "#C4D9D1",
  cream: "#FAF7F2",
  dark: "#2D2420",
  mid: "#6B5B55",
  light: "#B8A9A5",
  alert: "#E07B45",
  alertPale: "#FDF0E8",
  white: "#FFFFFF",
};

const ALERT_SYMPTOMS = ["головная боль", "отёки", "тревога", "нарушение сна"];

const MOODS = [
  { emoji: "😊", label: "отлично", score: 5 },
  { emoji: "🙂", label: "хорошо", score: 4 },
  { emoji: "😐", label: "нейтрально", score: 3 },
  { emoji: "😔", label: "плохо", score: 2 },
  { emoji: "😢", label: "ужасно", score: 1 },
];

const SYMPTOMS = [
  { key: "тошнота", icon: "🤢", label: "Тошнота" },
  { key: "усталость", icon: "😴", label: "Усталость" },
  { key: "головная боль", icon: "🤕", label: "Гол. боль" },
  { key: "отёки", icon: "🦶", label: "Отёки" },
  { key: "изжога", icon: "🔥", label: "Изжога" },
  { key: "боль в спине", icon: "🔙", label: "Спина" },
  { key: "нарушение сна", icon: "🌙", label: "Сон" },
  { key: "тревога", icon: "💭", label: "Тревога" },
];

const MO = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const MS = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const DS = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

const fmtShort = d => { const x = new Date(d); return `${DS[x.getDay()]}, ${x.getDate()} ${MS[x.getMonth()]}`; };
const fmtFull  = d => { const x = new Date(d); return `${x.getDate()} ${MO[x.getMonth()]} ${x.getFullYear()}`; };
const getTrimester = w => w <= 13 ? "I триместр" : w <= 26 ? "II триместр" : "III триместр";

// ─── BACKEND API ──────────────────────────────────────────────────────────────
async function callChatAgent(userText, _ctx) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: userText }),
  });
  const data = await res.json();
  return data.reply || "Не удалось получить ответ.";
}

async function callSummaryAgent(entries, ctx) {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries, week: ctx?.week }),
  });
  const data = await res.json();
  return data.summary;
}

// ─── UI БЛОКИ ─────────────────────────────────────────────────────────────────
const inp = {
  width: "100%", background: COLORS.white, outline: "none", fontFamily: "inherit",
  border: `1.5px solid rgba(45,36,32,0.12)`, borderRadius: 16,
  padding: "14px 18px", fontSize: 15, color: COLORS.dark,
};

function Btn({ children, onClick, variant = "dark", disabled = false, style: s = {} }) {
  const base = {
    width: "100%", border: "none", borderRadius: 100, padding: "16px 24px",
    fontFamily: "inherit", fontSize: 15, fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
    transition: "opacity 0.15s, transform 0.1s",
  };
  const v = {
    dark:      { background: COLORS.dark, color: COLORS.white },
    rose:      { background: COLORS.rose, color: COLORS.white },
    outline:   { background: "transparent", color: COLORS.mid, border: `1.5px solid rgba(45,36,32,0.18)`, padding: "14px 24px" },
    ghost:     { background: "none", color: COLORS.mid, textDecoration: "underline", textUnderlineOffset: 3, width: "auto", padding: "8px 0", fontSize: 14 },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...s }}>{children}</button>;
}

function Card({ children, style: s = {} }) {
  return <div style={{ background: COLORS.white, borderRadius: 24, padding: 20, boxShadow: "0 2px 16px rgba(45,36,32,0.07)", ...s }}>{children}</div>;
}

function Label({ children, style: s = {} }) {
  return <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 10, marginTop: 22, ...s }}>{children}</div>;
}

function BackBtn({ onClick, light = false }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 14, border: "none", cursor: "pointer",
      background: light ? "rgba(255,255,255,0.18)" : COLORS.white,
      color: light ? COLORS.white : COLORS.dark,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
      boxShadow: light ? "none" : "0 2px 8px rgba(45,36,32,0.1)",
    }}>‹</button>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: active ? COLORS.rosePale : COLORS.white,
      border: `1.5px solid ${active ? COLORS.rose : "rgba(45,36,32,0.12)"}`,
      color: active ? COLORS.rose : COLORS.mid,
      borderRadius: 100, padding: "8px 14px", fontSize: 12,
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
    }}>{label}</button>
  );
}

function TrimTag({ week }) {
  return (
    <span style={{ background: COLORS.rosePale, color: COLORS.rose, borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
      {getTrimester(week)}
    </span>
  );
}

function Toast({ msg, visible }) {
  return (
    <div style={{
      position: "absolute", bottom: 88, left: 20, right: 20,
      background: COLORS.dark, color: COLORS.white,
      borderRadius: 16, padding: "13px 18px", fontSize: 13, lineHeight: 1.45,
      zIndex: 500, pointerEvents: "none",
      transition: "all 0.3s ease",
      transform: visible ? "translateY(0)" : "translateY(16px)",
      opacity: visible ? 1 : 0,
    }}>{msg}</div>
  );
}

// ─── НАВИГАЦИЯ ────────────────────────────────────────────────────────────────
function BottomNav({ active, onDiary, onAssistant, onProfile }) {
  const tabs = [
    { id: "diary", label: "Дневник", icon: "📔" },
    { id: "assistant", label: "Ассистент", icon: "💬" },
    { id: "profile", label: "Профиль", icon: "👤" },
  ];
  const handlers = { diary: onDiary, assistant: onAssistant, profile: onProfile };
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 68,
      background: COLORS.white, borderTop: "1px solid rgba(45,36,32,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      paddingBottom: 6, zIndex: 100,
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={handlers[tab.id]}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 10, fontFamily: "inherit", padding: "4px 20px",
            color: active === tab.id ? COLORS.rose : COLORS.light,
            fontWeight: active === tab.id ? 600 : 400,
          }}>
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── ЭКРАНЫ ───────────────────────────────────────────────────────────────────

// WELCOME
function ScreenWelcome({ onStart, onDemo }) {
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
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
        <Btn onClick={onStart}>Начать →</Btn>
        <Btn variant="outline" onClick={onDemo}>У меня уже есть аккаунт</Btn>
      </div>
    </div>
  );
}

// PROFILE SETUP
function ScreenProfileSetup({ onBack, onNext }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [week, setWeek] = useState(8); // BUG FIX 1: начинаем с 8, min=1

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "48px 24px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: COLORS.dark }}>О вас</span>
      </div>
      {/* Прогресс */}
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
        {/* BUG FIX 1: min=1 */}
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

// DOCTOR SETUP
function ScreenDoctorSetup({ onBack, onNext, onSkip }) {
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

// DIARY
function ScreenDiary({ user, entries, alertSymptoms, onCheckin, onSummary, onAlert, onNav }) {
  const today = new Date().toDateString();
  const todayEntry = entries.find(e => new Date(e.date).toDateString() === today);
  const recentEntries = [...entries].reverse().slice(0, 7);
  const w = user.week;
  // BUG FIX 3: лента строится вокруг текущей недели
  const weekRange = Array.from({ length: 9 }, (_, i) => w - 4 + i).filter(x => x >= 1 && x <= 42);

  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Хедер */}
      <div style={{ background: "linear-gradient(160deg,#F9E8E5 0%,#FAF7F2 100%)", padding: "44px 24px 20px", flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: COLORS.mid, marginBottom: 2 }}>Добрый день,</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, color: COLORS.dark, fontWeight: 500 }}>{user.name} 🌸</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.white, borderRadius: 100, padding: "7px 16px", marginTop: 10, boxShadow: "0 2px 8px rgba(45,36,32,0.08)", fontSize: 13, fontWeight: 500, color: COLORS.dark }}>
          <div style={{ width: 7, height: 7, background: COLORS.rose, borderRadius: "50%" }} />
          {w} неделя · {getTrimester(w)}
        </div>
      </div>

      {/* Лента недель — BUG FIX 3 */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 24px", flexShrink: 0, scrollbarWidth: "none" }}>
        {weekRange.map(n => (
          <div key={n} style={{ flexShrink: 0, width: 46, height: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 14, background: n === w ? COLORS.dark : COLORS.white, color: n === w ? COLORS.white : COLORS.light, border: `1.5px solid ${n === w ? COLORS.dark : "transparent"}` }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{n}</span>
            <span style={{ fontSize: 10 }}>нед.</span>
          </div>
        ))}
      </div>

      {/* Контент */}
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

        {/* Алерт */}
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

        {/* AI инсайт */}
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

        {/* История */}
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

      {/* FAB */}
      <button onClick={onCheckin} style={{ position: "absolute", bottom: 80, right: 18, width: 52, height: 52, background: COLORS.rose, border: "none", borderRadius: 18, cursor: "pointer", fontSize: 26, color: COLORS.white, boxShadow: "0 8px 24px rgba(232,132,122,0.5)", zIndex: 50 }}>+</button>

      <BottomNav active="diary" onDiary={() => {}} onAssistant={() => onNav("qa")} onProfile={() => onNav("profile")} />
    </div>
  );
}

// CHECKIN
function ScreenCheckin({ onBack, onSave }) {
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
        {/* BUG FIX 2: все 5 в одну строку */}
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

// SUMMARY
function ScreenSummary({ onBack, entries, user, alertSymptoms }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const recent = entries.filter(e => (Date.now() - new Date(e.date).getTime()) < 7 * 86400000);
  const scores = recent.map(e => MOODS.find(m => m.label === e.moodLabel)?.score || 3);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";

  useEffect(() => {
    setLoading(true);
    callSummaryAgent(recent, user).then(r => { setResult(r); setLoading(false); });
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

// QA HUB
function ScreenQA({ onOpenChat, onNav }) {
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

// CHAT — BUG FIX 5: doSend объявлен ДО useEffect
function ScreenChat({ onBack, initialMessage, user }) {
  const greeting = `Привет, ${user?.name || "дорогая"}! 🌸 Готова ответить на любой вопрос о беременности.`;
  const [msgs, setMsgs] = useState([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const busyRef = useRef(false);  // предотвращаем двойной вызов
  const initRef = useRef(false);  // initialMessage отправлен только один раз

  // doSend объявлен ПЕРВЫМ — до любых useEffect
  const doSend = async (text) => {
    if (!text.trim() || busyRef.current) return;
    busyRef.current = true;
    const userMsg = { role: "assistant", text }; // добавим правильно ниже
    setMsgs(m => [...m, { role: "user", text }]);
    setTyping(true);
    try {
      const reply = await callChatAgent(text, { week: user?.week });
      setMsgs(m => [...m, { role: "assistant", text: reply }]);
    } finally {
      setTyping(false);
      busyRef.current = false;
    }
  };

  // BUG FIX 5: initialMessage отправляется ровно один раз
  useEffect(() => {
    if (initialMessage && !initRef.current) {
      initRef.current = true;
      doSend(initialMessage);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    doSend(t);
  };

  return (
    <div style={{ height: "100%", background: "#F5F0EA", display: "flex", flexDirection: "column" }}>
      {/* Хедер */}
      <div style={{ background: COLORS.white, padding: "44px 18px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(45,36,32,0.07)", flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg,${COLORS.rose},#C26E65)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤱</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark }}>MamaCare AI</div>
          <div style={{ fontSize: 11, color: typing ? COLORS.rose : COLORS.sage }}>{typing ? "● Печатает..." : "● Онлайн · Доказательная медицина"}</div>
        </div>
      </div>

      {/* Сообщения */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" && (
              <div style={{ width: 26, height: 26, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg,${COLORS.rose},#C26E65)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤱</div>
            )}
            <div style={{ maxWidth: "76%" }}>
              <div style={{ padding: "11px 15px", borderRadius: 18, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-line", background: m.role === "user" ? COLORS.dark : COLORS.white, color: m.role === "user" ? COLORS.white : COLORS.dark, borderBottomLeftRadius: m.role === "assistant" ? 5 : 18, borderBottomRightRadius: m.role === "user" ? 5 : 18, boxShadow: m.role === "assistant" ? "0 2px 8px rgba(45,36,32,0.06)" : "none" }}>
                {m.text}
              </div>
              {m.role === "assistant" && i > 0 && <div style={{ fontSize: 10, color: COLORS.light, marginTop: 3 }}>⚕️ Информационный ответ. AI не ставит диагнозы.</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <div style={{ width: 26, height: 26, borderRadius: 9, background: `linear-gradient(135deg,${COLORS.rose},#C26E65)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤱</div>
            <div style={{ background: COLORS.white, borderRadius: 18, borderBottomLeftRadius: 5, padding: "13px 16px", display: "flex", gap: 4, boxShadow: "0 2px 8px rgba(45,36,32,0.06)" }}>
              {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 6, height: 6, background: COLORS.light, borderRadius: "50%", animation: `pulse 1.2s ease ${d}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Инпут */}
      <div style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 14px 26px", background: COLORS.white, borderTop: "1px solid rgba(45,36,32,0.07)", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Напишите вопрос..."
          style={{ flex: 1, background: COLORS.cream, border: `1.5px solid rgba(45,36,32,0.1)`, borderRadius: 100, padding: "12px 18px", fontFamily: "inherit", fontSize: 14, color: COLORS.dark, outline: "none" }} />
        <button onClick={handleSend} style={{ width: 42, height: 42, background: COLORS.rose, border: "none", borderRadius: "50%", cursor: "pointer", color: COLORS.white, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

// ALERT
function ScreenAlert({ onBack, onChat, alertSymptoms, doctor, entries }) {
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

// PROFILE
function ScreenProfile({ user, doctor, entries, onNav, onReset }) {
  return (
    <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "44px 24px 20px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: COLORS.dark }}>Мой профиль</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 88px" }}>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌸</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: COLORS.dark }}>{user.name}</div>
          {user.age && <div style={{ fontSize: 13, color: COLORS.mid, marginTop: 3 }}>{user.age} лет</div>}
          <div style={{ marginTop: 10 }}><TrimTag week={user.week} /></div>
        </Card>

        <Label style={{ marginTop: 0 }}>Врач</Label>
        <Card style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: COLORS.sagePale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👩‍⚕️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{doctor?.name || "Не указан"}</div>
            {doctor?.spec && <div style={{ fontSize: 12, color: COLORS.mid }}>{doctor.spec}</div>}
            {doctor?.phone && <div style={{ fontSize: 11, color: COLORS.mid, marginTop: 2 }}>{doctor.phone}</div>}
          </div>
        </Card>

        <Label>Статистика</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, color: COLORS.rose }}>{entries.length}</div>
            <div style={{ fontSize: 11, color: COLORS.light, marginTop: 3 }}>Записей</div>
          </Card>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, color: COLORS.sage }}>{user.week}</div>
            <div style={{ fontSize: 11, color: COLORS.light, marginTop: 3 }}>Неделя</div>
          </Card>
        </div>
        <Btn variant="outline" onClick={onReset}>Выйти из аккаунта</Btn>
      </div>
      <BottomNav active="profile" onDiary={() => onNav("diary")} onAssistant={() => onNav("qa")} onProfile={() => {}} />
    </div>
  );
}

// ─── PHONE SHELL ──────────────────────────────────────────────────────────────
function PhoneShell({ children }) {
  return (
    <div style={{
      width: 375, height: 812, borderRadius: 50, overflow: "hidden", position: "relative",
      boxShadow: "0 40px 80px rgba(45,36,32,0.22), 0 0 0 8px #2D2420, 0 0 0 11px #3D3330",
      flexShrink: 0, background: COLORS.cream,
    }}>
      {/* Notch */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 118, height: 26, background: "#2D2420", borderRadius: "0 0 18px 18px", zIndex: 200 }} />
      {children}
    </div>
  );
}

// ─── APP — ЕДИНЫЙ РОУТЕР ──────────────────────────────────────────────────────
export default function MamaCare() {
  const [screen, setScreen] = useState("welcome");
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [entries, setEntries] = useState([]);
  const [chatMsg, setChatMsg] = useState(null);   // initialMessage для чата
  const [toast, setToast] = useState({ text: "", on: false });

  const showToast = (text) => {
    setToast({ text, on: true });
    setTimeout(() => setToast(t => ({ ...t, on: false })), 2400);
  };

  // Алерт симптомы за последние 7 дней
  const alertSymptoms = (() => {
    const counts = {};
    const wk = 7 * 86400000;
    entries
      .filter(e => Date.now() - new Date(e.date).getTime() < wk)
      .flatMap(e => e.symptoms)
      .filter(s => ALERT_SYMPTOMS.includes(s))
      .forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts);
  })();

  // Демо-аккаунт
  const loadDemo = () => {
    setUser({ name: "Алина", age: "28", week: 20 });
    setDoctor({ name: "Иванова М.С.", spec: "Акушер-гинеколог", phone: "+7 (495) 000-00-00", clinic: "Клиника «Здоровье»" });
    const now = Date.now();
    setEntries([
      { id: 1, date: new Date(now - 86400000 * 3).toISOString(), emoji: "🙂", moodLabel: "хорошо", text: "Небольшая тошнота с утра, прошла после завтрака.", symptoms: ["тошнота"], activity: "Прогулка 30 мин", diet: "Каша, суп, фрукты" },
      { id: 2, date: new Date(now - 86400000 * 2).toISOString(), emoji: "😊", moodLabel: "отлично", text: "Чудесный день! Сходила на йогу.", symptoms: [], activity: "Йога 45 мин", diet: "Правильное питание" },
      { id: 3, date: new Date(now - 86400000).toISOString(), emoji: "😐", moodLabel: "нейтрально", text: "Болела голова к вечеру. Немного отекли ноги.", symptoms: ["головная боль", "отёки"], activity: "", diet: "Обычное" },
    ]);
    setScreen("diary");
    showToast("Добро пожаловать! 🌸");
  };

  // Сохранение чекина
  const saveCheckin = (data) => {
    const today = new Date().toDateString();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      emoji: data.mood.emoji,
      moodLabel: data.mood.label,
      text: data.text,
      symptoms: data.symptoms,
      activity: data.activity,
      diet: data.diet,
    };
    setEntries(prev => [...prev.filter(e => new Date(e.date).toDateString() !== today), entry]);
    const hasAlert = data.symptoms.some(s => ALERT_SYMPTOMS.includes(s));
    showToast("Запись сохранена! 🌸");
    setTimeout(() => setScreen(hasAlert ? "alert" : "diary"), 500);
  };

  // Открыть чат
  const openChat = (category, quick) => {
    setChatMsg(quick || (category ? `Расскажи подробнее про: ${category}` : null));
    setScreen("chat");
  };

  // Рендер активного экрана
  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <ScreenWelcome onStart={() => setScreen("profile-setup")} onDemo={loadDemo} />;

      case "profile-setup":
        return <ScreenProfileSetup onBack={() => setScreen("welcome")} onNext={u => { setUser(u); setScreen("doctor-setup"); }} />;

      case "doctor-setup":
        return <ScreenDoctorSetup onBack={() => setScreen("profile-setup")} onNext={d => { setDoctor(d); setScreen("diary"); showToast("Добро пожаловать! 🌸"); }} onSkip={() => { setScreen("diary"); showToast("Добро пожаловать! 🌸"); }} />;

      case "diary":
        return user && <ScreenDiary user={user} entries={entries} alertSymptoms={alertSymptoms} onCheckin={() => setScreen("checkin")} onSummary={() => setScreen("summary")} onAlert={() => setScreen("alert")} onNav={setScreen} />;

      case "checkin":
        return <ScreenCheckin onBack={() => setScreen("diary")} onSave={saveCheckin} />;

      case "summary":
        return user && <ScreenSummary onBack={() => setScreen("diary")} entries={entries} user={user} alertSymptoms={alertSymptoms} />;

      case "qa":
        return <ScreenQA onOpenChat={openChat} onNav={setScreen} />;

      case "chat":
        return user && <ScreenChat key={chatMsg} onBack={() => setScreen("qa")} initialMessage={chatMsg} user={user} />;

      case "alert":
        return <ScreenAlert onBack={() => setScreen("diary")} onChat={() => { setChatMsg("У меня тревожные симптомы при беременности. Что делать?"); setScreen("chat"); }} alertSymptoms={alertSymptoms} doctor={doctor} entries={entries} />;

      case "profile":
        return user && <ScreenProfile user={user} doctor={doctor} entries={entries} onNav={setScreen} onReset={() => { setUser(null); setDoctor(null); setEntries([]); setScreen("welcome"); }} />;

      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#E8E3DC", padding: "40px 20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        input[type=range] { appearance: none; height: 4px; border-radius: 100px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 22px; height: 22px; background: #E8847A; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(232,132,122,0.45); }
      `}</style>

      <PhoneShell>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, animation: "fadeIn 0.22s ease" }} key={screen}>
          {renderScreen()}
        </div>
        <Toast msg={toast.text} visible={toast.on} />
      </PhoneShell>
    </div>
  );
}
