import { useState, useEffect, useMemo } from "react";
import { COLORS, ALERT_SYMPTOMS } from "./constants";
import { Toast } from "./components";
import { apiRefresh, apiLogout, apiFetchMe, apiSaveProfile, apiSaveEntry, setAccessToken, setAuthFailureHandler } from "./lib/api";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProfileSetup } from "./pages/ProfileSetup";
import { DoctorSetup } from "./pages/DoctorSetup";
import { Diary } from "./pages/Diary";
import { Checkin } from "./pages/Checkin";
import { Summary } from "./pages/Summary";
import { QA } from "./pages/QA";
import { Chat } from "./pages/Chat";
import { Alert } from "./pages/Alert";
import { Profile } from "./pages/Profile";

export default function MamaCare() {
  const [screen,  setScreen]  = useState("loading");
  const [user,    setUser]    = useState(null);
  const [doctor,  setDoctor]  = useState(null);
  const [entries, setEntries] = useState([]);
  const [chatMsg, setChatMsg] = useState(null);
  const [toast,   setToast]   = useState({ text: "", on: false });

  const showToast = (text) => {
    setToast({ text, on: true });
    setTimeout(() => setToast(t => ({ ...t, on: false })), 2400);
  };

  const normalizeEntries = (rows) =>
    rows.map(r => ({ ...r, moodLabel: r.mood_label ?? r.moodLabel }));

  // При старте — регистрируем reset-on-auth-failure и пробуем тихий refresh
  useEffect(() => {
    setAuthFailureHandler(() => {
      setAccessToken(null);
      setUser(null); setDoctor(null); setEntries([]);
      setScreen("login");
    });
    apiRefresh()
      .then(async (accessToken) => {
        if (!accessToken) { setScreen("login"); return; }
        setAccessToken(accessToken);
        const { user: u, doctor: d, entries: e } = await apiFetchMe();
        setUser(u); setDoctor(d); setEntries(normalizeEntries(e));
        setScreen(u.profile_complete ? "diary" : "profile-setup");
      })
      .catch(() => setScreen("login"));
  }, []);

  // После успешного логина или регистрации
  const handleAuthSuccess = async (accessToken, userInfo) => {
    setAccessToken(accessToken);
    if (userInfo.profile_complete) {
      const { user: u, doctor: d, entries: e } = await apiFetchMe();
      setUser(u); setDoctor(d); setEntries(normalizeEntries(e));
      setScreen("diary");
    } else {
      setUser(userInfo);
      setScreen("profile-setup");
    }
  };

  const alertSymptoms = useMemo(() => {
    const counts = {};
    const wk = 7 * 86400000;
    entries
      .filter(e => Date.now() - new Date(e.date).getTime() < wk)
      .flatMap(e => e.symptoms ?? [])
      .filter(s => ALERT_SYMPTOMS.includes(s))
      .forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts);
  }, [entries]);

  // Завершить онбординг → сохранить анкету в БД
  const finishOnboarding = async (profileData, doctorData) => {
    await apiSaveProfile(profileData, doctorData);
    const { user: u, doctor: d, entries: e } = await apiFetchMe();
    setUser(u); setDoctor(d); setEntries(normalizeEntries(e));
    setScreen("diary");
    showToast("Добро пожаловать! 🌸");
  };

  // Сохранение чекина
  const saveCheckin = async (data) => {
    const date = new Date().toISOString().split("T")[0];
    const saved = await apiSaveEntry({
      date,
      emoji:     data.mood.emoji,
      moodLabel: data.mood.label,
      text:      data.text,
      symptoms:  data.symptoms,
      activity:  data.activity,
      diet:      data.diet,
    });
    const normalized = { ...saved, moodLabel: saved.mood_label };
    setEntries(prev => [...prev.filter(e => e.date?.slice(0, 10) !== date), normalized]);
    const hasAlert = data.symptoms.some(s => ALERT_SYMPTOMS.includes(s));
    showToast("Запись сохранена! 🌸");
    setTimeout(() => setScreen(hasAlert ? "alert" : "diary"), 500);
  };

  const handleLogout = async () => {
    await apiLogout();
    setAccessToken(null);
    setUser(null); setDoctor(null); setEntries([]);
    setScreen("login");
  };

  const openChat = (category, quick) => {
    setChatMsg(quick || (category ? `Расскажи подробнее про: ${category}` : null));
    setScreen("chat");
  };

  const renderScreen = () => {
    switch (screen) {
      case "loading":
        return (
          <div style={{ height: "100%", background: COLORS.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌸</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, color: COLORS.dark, fontWeight: 500 }}>MamaCare</div>
            <div style={{ fontSize: 13, color: COLORS.light, marginTop: 8 }}>Загрузка...</div>
          </div>
        );
      case "login":       return <Login onLogin={handleAuthSuccess} onGoRegister={() => setScreen("register")} />;
      case "register":    return <Register onRegister={handleAuthSuccess} onGoLogin={() => setScreen("login")} />;
      case "profile-setup": return <ProfileSetup onBack={() => setScreen("login")} onNext={u => { setUser(u); setScreen("doctor-setup"); }} />;
      case "doctor-setup":  return <DoctorSetup onBack={() => setScreen("profile-setup")} onNext={d => finishOnboarding(user, d)} onSkip={() => finishOnboarding(user, null)} />;
      case "diary":         return user && <Diary user={user} entries={entries} alertSymptoms={alertSymptoms} onCheckin={() => setScreen("checkin")} onSummary={() => setScreen("summary")} onAlert={() => setScreen("alert")} onNav={setScreen} />;
      case "checkin":       return <Checkin onBack={() => setScreen("diary")} onSave={saveCheckin} />;
      case "summary":       return user && <Summary onBack={() => setScreen("diary")} entries={entries} user={user} alertSymptoms={alertSymptoms} />;
      case "qa":            return <QA onOpenChat={openChat} onNav={setScreen} />;
      case "chat":          return user && <Chat onBack={() => setScreen("qa")} initialMessage={chatMsg} user={user} />;
      case "alert":         return <Alert onBack={() => setScreen("diary")} onChat={() => { setChatMsg("У меня тревожные симптомы при беременности. Что делать?"); setScreen("chat"); }} alertSymptoms={alertSymptoms} doctor={doctor} entries={entries} />;
      case "profile":       return user && <Profile user={user} doctor={doctor} entries={entries} onNav={setScreen} onReset={handleLogout} />;
      default:              return null;
    }
  };

  return (
    <div className="mc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        ::-webkit-scrollbar { display: none; }
        input[type=range] { appearance: none; height: 4px; border-radius: 100px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 22px; height: 22px; background: #E8847A; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(232,132,122,0.45); }

        .mc-page {
          font-family: 'DM Sans', sans-serif;
          background: #FAF7F2;
          min-height: 100dvh;
        }
        .mc-app {
          width: 100%;
          height: 100dvh;
          position: relative;
          overflow: hidden;
          background: #FAF7F2;
        }
        .mc-screen {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          animation: fadeIn 0.22s ease;
        }

        @media (min-width: 480px) {
          .mc-page {
            background: #E8E3DC;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 24px 16px;
          }
          .mc-app {
            max-width: 480px;
            height: calc(100dvh - 48px);
            border-radius: 24px;
            box-shadow: 0 8px 40px rgba(45,36,32,0.14);
            overflow: hidden;
          }
        }

        @media (min-width: 768px) {
          .mc-page {
            padding: 40px 20px;
            align-items: center;
          }
          .mc-app {
            height: calc(100dvh - 80px);
          }
        }
      `}</style>
      <div className="mc-app">
        <div className="mc-screen" key={screen}>
          {renderScreen()}
        </div>
        <Toast msg={toast.text} visible={toast.on} />
      </div>
    </div>
  );
}
