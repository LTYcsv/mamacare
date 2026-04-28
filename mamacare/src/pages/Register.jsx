import { useState } from "react";
import { COLORS, inp } from "../constants";
import { Btn, BackBtn } from "../components";

export function Register({ onRegister, onGoLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || !password2) { setError("Заполните все поля"); return; }
    if (password !== password2) { setError("Пароли не совпадают"); return; }
    if (password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      let data;
      try { data = await res.json(); } catch { throw new Error("Сервер недоступен. Попробуйте позже."); }
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
      onRegister(data.access_token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg,#F9E8E5 0%,#EEF5F2 55%,#FAF7F2 100%)", display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: 40, right: -60, background: "radial-gradient(circle,rgba(232,132,122,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ padding: "52px 28px 0", flexShrink: 0 }}>
        <BackBtn onClick={onGoLogin} />
      </div>

      <div style={{ textAlign: "center", padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🌸</div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 30, color: COLORS.dark, fontWeight: 500, marginBottom: 4 }}>
          Создать аккаунт
        </h1>
        <p style={{ fontSize: 13, color: COLORS.light }}>Анкету заполним после регистрации</p>
      </div>

      <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 7 }}>Email</div>
          <input
            style={inp}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 7 }}>Пароль</div>
          <input
            style={inp}
            type="password"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.light, marginBottom: 7 }}>Повторите пароль</div>
          <input
            style={inp}
            type="password"
            placeholder="••••••••"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: COLORS.alertPale, border: `1.5px solid rgba(224,123,69,0.25)`, borderRadius: 14 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 13, color: COLORS.alert, lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        <div style={{ marginTop: 4 }}>
          <Btn onClick={handleSubmit} disabled={loading}>
            {loading ? "Создаём..." : "Зарегистрироваться →"}
          </Btn>
        </div>

        <div style={{ textAlign: "center", fontSize: 14, color: COLORS.mid, marginTop: 8 }}>
          Уже есть аккаунт?{" "}
          <button onClick={onGoLogin} style={{ background: "none", border: "none", color: COLORS.rose, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}
