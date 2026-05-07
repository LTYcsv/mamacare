# CLAUDE.md — MamaCare

## Проект

Дневник беременности — full-stack приложение: SPA на React + REST API на Express + PostgreSQL. AI-чат через Yandex AI Studio (через бэкенд-прокси). Запускается через Docker Compose.

## Стек

### Frontend (`mamacare/src/`)
- React 19.2.0 + Vite 8 (beta — заметка для будущего, риск регрессий)
- JSX (не TypeScript)
- `react-markdown` — рендеринг ответов AI-чата
- Без UI-библиотек — всё на inline CSS-in-JS
- Состояние: `useState` в `MamaCare.jsx` (~200 строк, оркестратор экранов), pages/ компоненты сами держат локальный стейт

### Backend (`backend/src/`)
- Node 20 + Express 4
- PostgreSQL 16 (драйвер `pg`)
- JWT-auth: access (1ч) в памяти SPA + refresh (30д) в httpOnly cookie с ротацией и reuse-detection
- Хеши паролей — нативный `bcrypt` cost 12
- Защита: `helmet`, `cors`, `express-rate-limit` (5/min на auth, 20/min на чат), `zod` валидация на каждом роуте, `express.json({ limit: '10kb' })`, глобальный error handler через `express-async-errors`

### Внешние интеграции
- **Yandex AI Studio** — чат-агент. Вызывается **с бэкенда** через `/api/chat`, ключ в `backend/.env`, в bundle не попадает.
- Yandex AI **не подставляет** переменные `{user_name}`/`{pregnancy_week}` через API; имя/неделя из БД инжектятся как `[Контекст: ...]` в `input` с санитизацией управляющих символов и разделителями `<<<USER_MESSAGE>>>`

### Инфраструктура
- `docker-compose.yml` поднимает три сервиса: `frontend` (nginx со статикой + прокси `/api/*` на backend), `backend`, `postgres`
- Multi-stage Dockerfile у бэкенда (~210MB финал)
- Секреты: корневой `.env` (POSTGRES_*) + `backend/.env` (JWT_SECRET, YANDEX_*, FRONTEND_URL). Оба в `.gitignore`. Примеры — `.env.example` файлы.

## Структура проекта

```
backend/src/
  index.js                  # Express app: helmet, cors, rate-limit, error handler
  db.js                     # pg.Pool из DATABASE_URL
  middleware/
    auth.js                 # requireAuth — verify JWT, кладёт req.userId
    validate.js             # validate(zodSchema) → 400 при ошибке
  routes/
    auth.js                 # register / login / refresh (с ротацией) / logout
    users.js                # POST /profile, GET /me
    entries.js              # POST / (upsert по дате)
    chat.js                 # POST / → Yandex AI с контекстом из БД
    summary.js              # POST / → JS-шаблон (план: Claude Haiku, см. memory)

mamacare/src/
  MamaCare.jsx              # Оркестратор: screen-switch, auth state, loading user/entries
  lib/api.js                # apiFetch с авторетраем при 401, setAccessToken/setAuthFailureHandler
  pages/                    # 11 экранов: Login, Register, ProfileSetup, DoctorSetup,
                            # Welcome, Diary, Checkin, Summary, QA, Chat, Alert, Profile
  components/               # Btn, Card, Chip, Label, BackBtn, BottomNav, PhoneShell, Toast, TrimTag
  constants.js              # COLORS, ALERT_SYMPTOMS, MOODS, SYMPTOMS, утилиты дат

db/
  init.sql                  # users, doctors, diary_entries, refresh_tokens
```

## Функциональность

### Ядро
- **Дневник** — ежедневный чекин: 5 уровней настроения, 8 предустановленных симптомов, заметки (самочувствие/питание/активность). Upsert по `(user_id, date)`.
- **Трекер недели** — пользователь указывает текущую неделю (1–42) при онбординге; приложение показывает триместр.

### Дополнительно
- **AI-чат** (Мия) — реальные вызовы Yandex AI с авторизацией. Имя пользователя и неделя инжектятся бэкендом.
- **AI-анализ недели** — пока JS-шаблон со счётчиками настроения и симптомов. Планируется замена на Claude Haiku (см. `memory/planned_claude_haiku_summary.md`).
- **Система алертов** — если за последние 7 дней есть критический симптом (головная боль, отёки, тревога, нарушение сна) — экран-предупреждение с контактом врача.
- **Карточка врача** — имя, специализация, телефон, клиника. Опционально на онбординге.

## Ключевые решения

- **Auth: access в памяти + httpOnly refresh** — refresh не доступен из JS (защита от XSS), access живёт в `useState` MamaCare и в module-level `_accessToken` в `lib/api.js`. `apiFetch` тихо обновляет токен при 401, вторая 401 → logout.
- **Refresh-rotation с reuse-detection** — каждый `/refresh` атомарно отзывает старый jti и выдаёт новый. Использование уже отозванного → отзыв всех активных токенов пользователя.
- **`__Host-` cookie только в проде** — требует `secure: true` + `path: '/'`, что несовместимо с http://localhost. В dev cookie называется `refresh_token`, в проде — `__Host-refresh_token`. Для прода обязательно `NODE_ENV=production` + HTTPS.
- **Yandex AI-ключ на бэкенде** — устранена прежняя проблема "ключ в bundle".
- **`prompt.id` без `instructions` override** — Yandex AI игнорирует попытки переопределить системный промпт когда задан агент. Поэтому контекст идёт в `input`.
- **Inline CSS** — без внешних UI-библиотек.

---

## Obsidian Knowledge Vault

**Путь**: `/Users/ashot17/Library/Mobile Documents/iCloud~md~obsidian/Documents/MamaCare`

### При старте сессии

Прочитать два файла для контекста:

```
00-home/index.md                   — навигация по всей базе знаний
00-home/текущие-приоритеты.md      — что актуально прямо сейчас
```

### При команде "сохрани сессию"

1. **Создать лог** в `sessions/YYYY-MM-DD-название.md` с frontmatter:
   ```yaml
   ---
   tags: [session]
   date: YYYY-MM-DD
   ---
   ```
   Включить: что сделано, какие файлы изменены, ключевые решения, открытые вопросы.

2. **Обновить** `00-home/текущие-приоритеты.md` — убрать выполненное, добавить новое.

3. **Зафиксировать решения** в `knowledge/decisions/` если было принято архитектурное решение.

4. **Зафиксировать баги** в `knowledge/debugging/` если был найден и/или исправлен баг.

5. **Обновить** любые устаревшие заметки в `atlas/` если изменилась архитектура.

### Структура vault

```
00-home/          index.md, текущие-приоритеты.md
atlas/            архитектура, стек, дизайн
knowledge/
  decisions/      архитектурные решения с обоснованием
  debugging/      баги и решения
  patterns/       паттерны кода
  business/       продукт, аудитория, фичи
sessions/         логи сессий
inbox/            необработанные заметки
```
