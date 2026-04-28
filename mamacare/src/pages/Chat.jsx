import { useState, useRef, useEffect } from "react";
import { COLORS } from "../constants";
import { BackBtn } from "../components";
import { callChatAgent } from "../lib/api";

export function Chat({ onBack, initialMessage, user }) {
  const greeting = `Привет, ${user?.name || "дорогая"}! 🌸 Готова ответить на любой вопрос о беременности.`;
  const [msgs, setMsgs] = useState([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const busyRef = useRef(false);
  const initRef = useRef(false);

  const doSend = async (text) => {
    if (!text.trim() || busyRef.current) return;
    busyRef.current = true;
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
      <div style={{ background: COLORS.white, padding: "44px 18px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(45,36,32,0.07)", flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg,${COLORS.rose},#C26E65)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤱</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark }}>MamaCare AI</div>
          <div style={{ fontSize: 11, color: typing ? COLORS.rose : COLORS.sage }}>{typing ? "● Печатает..." : "● Онлайн · Доказательная медицина"}</div>
        </div>
      </div>

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

      <div style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 14px 26px", background: COLORS.white, borderTop: "1px solid rgba(45,36,32,0.07)", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Напишите вопрос..."
          style={{ flex: 1, background: COLORS.cream, border: `1.5px solid rgba(45,36,32,0.1)`, borderRadius: 100, padding: "12px 18px", fontFamily: "inherit", fontSize: 14, color: COLORS.dark, outline: "none" }} />
        <button onClick={handleSend} style={{ width: 42, height: 42, background: COLORS.rose, border: "none", borderRadius: "50%", cursor: "pointer", color: COLORS.white, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}
