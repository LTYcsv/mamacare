import { COLORS } from "../constants";
import { Btn, Card, Label, TrimTag, BottomNav } from "../components";

export function Profile({ user, doctor, entries, onNav, onReset }) {
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
