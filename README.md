# MamaCare

Личный дневник беременности с AI-ассистентом на базе Yandex AI Studio.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## Что умеет

- **Дневник** — ежедневный чекин: настроение (5 уровней), 8 симптомов, заметки о самочувствии, активности и питании
- **Трекер недели** — текущая неделя беременности (1–42) и триместр
- **AI-анализ** — еженедельное резюме по записям дневника
- **AI-чат** — ответы на вопросы по доказательной медицине (Yandex AI Studio)
- **Алерты** — автоматическое обнаружение тревожных симптомов с выводом контакта врача
- **Карточка врача** — имя, специализация, телефон, клиника

## Быстрый старт

### Требования

- Node.js 18+
- npm 9+
- Аккаунт [Yandex Cloud](https://cloud.yandex.ru/) с настроенным AI Studio агентом

### Установка

```bash
git clone https://github.com/LTYcsv/mamacare.git
cd mamacare/mamacare
npm install
```

### Настройка окружения

```bash
cp .env.example .env
```

Заполните `.env`:

```
VITE_YANDEX_API_KEY=your_api_key_here
VITE_YANDEX_FOLDER_ID=your_folder_id_here
VITE_YANDEX_CHAT_AGENT_ID=your_agent_id_here
```

Как получить значения:
1. Создайте API-ключ в [Yandex Cloud IAM](https://console.cloud.yandex.ru/iam)
2. Folder ID — в настройках облака
3. Agent ID — из [Yandex AI Studio](https://studio.yandex.cloud/) после создания агента

### Запуск

```bash
npm run dev
```

Откроется `http://localhost:5173`. Для быстрой демонстрации нажмите «У меня уже есть аккаунт» на экране приветствия.

## Команды

| Команда | Действие |
|---------|---------|
| `npm run dev` | Dev-сервер с HMR |
| `npm run build` | Production-сборка в `/dist` |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint проверка |

## Структура проекта

```
MamaCare/
├── mamacare/
│   ├── src/
│   │   ├── MamaCare.jsx   # Всё приложение (компоненты, экраны, логика)
│   │   ├── main.jsx       # Точка входа React
│   │   └── App.jsx        # Корневой компонент
│   ├── index.html
│   ├── vite.config.js     # Конфиг Vite + proxy для Yandex AI
│   └── .env.example       # Шаблон переменных окружения
└── CLAUDE.md              # Инструкции для AI-ассистента
```

## Стек

- **React 19** + **Vite 8** — SPA без роутера, кастомная навигация через `useState`
- **Inline CSS** — без UI-библиотек, собственная дизайн-система
- **Yandex AI Studio** — чат-агент для ответов на вопросы о беременности

## Статус

Версия **v0.0.0.1** — MVP-прототип. Данные хранятся только в памяти браузера (теряются при перезагрузке). Backend и аутентификация в планах.

## Лицензия

MIT
