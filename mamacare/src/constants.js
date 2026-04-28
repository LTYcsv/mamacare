export const COLORS = {
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

export const ALERT_SYMPTOMS = ["головная боль", "отёки", "тревога", "нарушение сна"];

export const MOODS = [
  { emoji: "😊", label: "отлично", score: 5 },
  { emoji: "🙂", label: "хорошо", score: 4 },
  { emoji: "😐", label: "нейтрально", score: 3 },
  { emoji: "😔", label: "плохо", score: 2 },
  { emoji: "😢", label: "ужасно", score: 1 },
];

export const SYMPTOMS = [
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

export const fmtShort = d => { const x = new Date(d); return `${DS[x.getDay()]}, ${x.getDate()} ${MS[x.getMonth()]}`; };
export const fmtFull  = d => { const x = new Date(d); return `${x.getDate()} ${MO[x.getMonth()]} ${x.getFullYear()}`; };
export const getTrimester = w => w <= 13 ? "I триместр" : w <= 26 ? "II триместр" : "III триместр";

export const inp = {
  width: "100%", background: COLORS.white, outline: "none", fontFamily: "inherit",
  border: `1.5px solid rgba(45,36,32,0.12)`, borderRadius: 16,
  padding: "14px 18px", fontSize: 15, color: COLORS.dark,
};
