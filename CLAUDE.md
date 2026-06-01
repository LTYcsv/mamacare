# CLAUDE.md — MamaCare

## Проект

Дневник беременности: SPA на React + REST API на Express + PostgreSQL + AI-чат через Yandex AI Studio (бэкенд-прокси).

## Стек

### Frontend (`mamacare/src/`)
- Vite 8 (beta — риск регрессий), JSX (не TypeScript)
- Без UI-библиотек — всё inline CSS

### Backend (`backend/src/`)
- JWT-auth: access (1ч) в памяти SPA + refresh (30д) в httpOnly cookie с ротацией и reuse-detection. `apiFetch` тихо обновляет при 401, вторая 401 → logout.
- Refresh-rotation: каждый `/refresh` атомарно отзывает старый jti. Использование отозванного → отзыв всех токенов пользователя.
- `__Host-` cookie только в проде (`NODE_ENV=production` + HTTPS). В dev — `refresh_token`.
- Zod-валидация на каждом роуте.

### Yandex AI
- Вызывается **с бэкенда** через `/api/chat`, ключ в `backend/.env`, в bundle не попадает.
- **Не подставляет** `{user_name}`/`{pregnancy_week}` через API — контекст инжектируется как `[Контекст: ...]` в `input` с разделителями `<<<USER_MESSAGE>>>`.
- `prompt.id` задан — переопределить системный промпт через `instructions` невозможно. Контекст только в `input`.

### Секреты
- Корневой `.env` — `POSTGRES_*`. `backend/.env` — `JWT_SECRET`, `YANDEX_*`, `FRONTEND_URL`.

## Ключевые ограничения

- Дневник: upsert по `(user_id, date)`, не INSERT.
- Неделя беременности: диапазон 1–42.

## Git

- Никогда не добавлять `Co-Authored-By:` в сообщения коммитов.

---

## Obsidian Knowledge Vault

**Путь**: `/Users/ashot17/Library/Mobile Documents/iCloud~md~obsidian/Documents/MamaCare`

### При старте сессии

Прочитать:
- `00-home/index.md` — навигация по базе знаний
- `00-home/текущие-приоритеты.md` — что актуально сейчас

### При команде "сохрани сессию"

1. Создать лог в `sessions/YYYY-MM-DD-название.md` с frontmatter `tags: [session], date: YYYY-MM-DD`. Включить: что сделано, изменённые файлы, ключевые решения, открытые вопросы.
2. Обновить `00-home/текущие-приоритеты.md`.
3. Архитектурные решения → `knowledge/decisions/`.
4. Баги → `knowledge/debugging/`.
5. Изменения архитектуры → обновить `atlas/`.
