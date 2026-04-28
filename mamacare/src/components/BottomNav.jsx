import { COLORS } from "../constants";

export function BottomNav({ active, onDiary, onAssistant, onProfile }) {
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
        <button key={tab.id} onClick={handlers[tab.id]} style={{
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
