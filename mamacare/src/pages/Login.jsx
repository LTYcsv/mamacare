import { useState } from "react";
import { COLORS, inp } from "../constants";
import { Btn } from "../components";

export function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      let data;
      try { data = await res.json(); } catch { throw new Error("Сервер недоступен. Попробуйте позже."); }
      if (!res.ok) throw new Error(data.error || "Ошибка входа");
      onLogin(data.access_token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg,#F9E8E5 0%,#EEF5F2 55%,#FAF7F2 100%)", display: "flex", flexDirection: "column", padding: "64px 28px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: 40, right: -60, background: "radial-gradient(circle,rgba(232,132,122,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", bottom: 120, left: -40, background: "radial-gradient(circle,rgba(122,158,142,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🌸</div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 36, lineHeight: 1.05, color: COLORS.dark, fontWeight: 500, marginBottom: 6 }}>
          Мама<em style={{ fontStyle: "italic", color: COLORS.rose }}>Care</em>
        </h1>
        <p style={{ fontSize: 13, color: COLORS.light }}>Личный дневник беременности</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 7 }}>Email</div>
          <input
            style={inp}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 7 }}>Пароль</div>
          <input
            style={inp}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: COLORS.alertPale, border: `1.5px solid rgba(224,123,69,0.25)`, borderRadius: 14, marginBottom: 4 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: COLORS.alert, lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? "Входим..." : "Войти →"}
        </Btn>
      </div>

      <div style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: COLORS.mid }}>
        Нет аккаунта?{" "}
        <button onClick={onGoRegister} style={{ background: "none", border: "none", color: COLORS.rose, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
}
