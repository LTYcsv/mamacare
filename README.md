<div align="center">

# 🤱 MamaCare

### Персональный дневник беременности с AI-ассистентом

*Ведите дневник самочувствия, общайтесь с AI и держите контакты врача под рукой — всё в одном приватном приложении*

<br/>

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0_beta-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose)

</div>

---

## 📱 Что умеет приложение

<table>
<tr>
<td width="50%">

### 📓 Ежедневный дневник
Настроение с эмодзи, симптомы, заметки о питании, физической активности и самочувствии. Каждый день — одна запись, которую можно редактировать в любое время.

</td>
<td width="50%">

### 📅 Трекер недель
Текущая неделя беременности (1–42) и триместр с визуальным прогрессом. Задаётся в профиле и учитывается во всём приложении.

</td>
</tr>
<tr>
<td width="50%">

### 🤖 AI-ассистент
Отвечает на вопросы о беременности через Yandex AI Studio. Знает имя пользователя и текущую неделю — отвечает в контексте, а не обезличенно.

</td>
<td width="50%">

### 📊 Еженедельная сводка
Анализ записей за 7 дней: средний балл настроения, частые симптомы, активность, персональные рекомендации.

</td>
</tr>
<tr>
<td width="50%">

### ⚠️ Тревожные симптомы
Если отмечены опасные симптомы — отёки, сильная головная боль, тревога — приложение мгновенно показывает предупреждение и контакты врача.

</td>
<td width="50%">

### 🩺 Карточка врача
Имя, специализация, телефон, клиника, адрес. Заполняется один раз при настройке профиля.

</td>
</tr>
</table>

---

## 🏗️ Архитектура

```mermaid
graph TB
    subgraph Client["🌐 Браузер"]
        SPA["React SPA<br/>(access token в памяти)"]
    end

    subgraph Compose["🐳 Docker Compose"]
        direction TB
        NGINX["nginx :5173<br/>(статика + proxy)"]
        API["Express API :3001<br/>(auth · entries · chat · summary)"]
        DB[("PostgreSQL 16<br/>(users · diary · tokens · doctors)")]
    end

    subgraph External["☁️ Yandex Cloud"]
        AI["AI Studio<br/>(Chat Agent)"]
    end

    SPA -->|"Bearer token"| NGINX
    NGINX -->|"proxy /api/*"| API
    API <-->|"pg driver"| DB
    API -->|"REST, API key"| AI
    SPA -.->|"httpOnly cookie<br/>refresh_token"| API
```

---

## 🔐 Схема аутентификации

> Реализован полноценный refresh-rotation с защитой от кражи токенов.

```mermaid
sequenceDiagram
    participant B as 🌐 Браузер
    participant A as ⚙️ Express API
    participant DB as 🗄️ PostgreSQL

    B->>A: POST /auth/login
    A->>DB: INSERT refresh_token (jti = UUID)
    A-->>B: access_token (1ч) + Set-Cookie: refresh_token (30д, httpOnly)

    Note over B: access_token — в памяти SPA<br/>refresh_token — в httpOnly cookie

    B->>A: Запрос с истёкшим access_token
    A-->>B: 401 Unauthorized

    B->>A: POST /auth/refresh (автоматически, cookie)
    A->>DB: UPDATE SET revoked_at=NOW() WHERE jti=old ← атомарно
    A->>DB: INSERT новый refresh_token
    A-->>B: новый access_token + новый cookie

    Note over A,DB: ⚠️ Если старый токен предъявлен повторно —<br/>все сессии пользователя немедленно отзываются
```

---

## 🛡️ Безопасность

| Механизм | Реализация |
|---|---|
| Хранение паролей | bcrypt, cost factor 12 |
| Access token | JWT, 1 час, хранится в памяти SPA |
| Refresh token | JWT, 30 дней, `httpOnly` + `SameSite: Strict` cookie |
| Ротация токенов | Каждый `/refresh` атомарно инвалидирует старый `jti` |
| Reuse detection | Повторное использование отозванного токена → сброс всех сессий |
| Production cookie | Префикс `__Host-` (требует HTTPS, блокирует подмену домена) |
| AI-ключи | Только на сервере, в bundle фронтенда не попадают |
| Prompt injection | Пользовательский ввод изолирован разделителями `<<<USER_MESSAGE>>>` |
| Rate limiting | 20 запросов/мин на пользователя для `/api/chat` |
| Валидация | Zod-схемы на каждом роуте, до попадания в бизнес-логику |

---

## 🗄️ Схема базы данных

```mermaid
erDiagram
    users {
        int id PK
        text email
        text password_hash
        text name
        int age
        int week
        bool profile_complete
        timestamptz created_at
    }

    doctors {
        int id PK
        int user_id FK
        text name
        text spec
        text phone
        text clinic
        text addr
    }

    diary_entries {
        int id PK
        int user_id FK
        date date
        text emoji
        text mood_label
        text text
        text[] symptoms
        text activity
        text diet
        timestamptz created_at
    }

    refresh_tokens {
        uuid jti PK
        int user_id FK
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
    }

    users ||--o| doctors : "1:1"
    users ||--o{ diary_entries : "1:N"
    users ||--o{ refresh_tokens : "1:N"
```

---

## 🚀 Быстрый старт

### Требования

- [Docker + Docker Compose v2](https://docs.docker.com/compose/install/)
- Аккаунт в [Yandex AI Studio](https://studio.yandex.cloud/) с созданным Chat-агентом

### 1. Клонировать репозиторий

```bash
git clone https://github.com/<your-username>/MamaCare.git
cd MamaCare
```

### 2. Настроить переменные окружения

**Корневой `.env`** (PostgreSQL):
```env
POSTGRES_DB=mamacare
POSTGRES_USER=mamacare
POSTGRES_PASSWORD=your-strong-password
```

**`backend/.env`**:
```env
PORT=3001
DATABASE_URL=postgresql://mamacare:your-strong-password@postgres:5432/mamacare
JWT_SECRET=your-long-random-secret-at-least-32-chars
YANDEX_API_KEY=your-yandex-api-key
YANDEX_FOLDER_ID=your-folder-id
YANDEX_CHAT_AGENT_ID=your-agent-id
FRONTEND_URL=http://localhost:5173
```

### 3. Запустить

```bash
docker compose up --build
```

Приложение доступно на **http://localhost:5173**

> Схема базы данных создаётся автоматически при первом запуске через `db/init.sql`.

### Разработка (горячая перезагрузка бэкенда)

```bash
docker compose watch
```

---

## 📁 Структура проекта

```
MamaCare/
│
├── mamacare/                   # 🌐 Frontend
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx       # Вход / регистрация
│       │   ├── ProfileSetup.jsx # Онбординг: неделя, имя, врач
│       │   ├── Checkin.jsx     # Ежедневный дневник
│       │   ├── Diary.jsx       # История записей
│       │   ├── Chat.jsx        # AI-чат
│       │   ├── Summary.jsx     # Еженедельная сводка
│       │   ├── Alert.jsx       # Тревожные симптомы
│       │   └── Profile.jsx     # Профиль и карточка врача
│       ├── components/         # Btn, Card, Chip, Toast, BottomNav…
│       └── lib/api.js          # apiFetch с авто-рефрешем токена
│
├── backend/                    # ⚙️ Backend
│   └── src/
│       ├── routes/
│       │   ├── auth.js         # register · login · refresh · logout
│       │   ├── entries.js      # upsert дневниковых записей
│       │   ├── users.js        # профиль · /me
│       │   ├── chat.js         # проксирование к Yandex AI
│       │   └── summary.js      # анализ за 7 дней
│       └── middleware/
│           ├── auth.js         # requireAuth (JWT verify)
│           └── validate.js     # Zod валидация тела запроса
│
├── db/
│   └── init.sql                # 📋 DDL: все таблицы и индексы
│
└── docker-compose.yml          # 🐳 nginx + node + postgres
```

---

## 🧰 Технологии

<div align="center">

| Слой | Технологии |
|---|---|
| **Frontend** | React 19, Vite 8 (beta), JSX, inline CSS |
| **Backend** | Node.js 18+, Express 4, ESM |
| **База данных** | PostgreSQL 16 |
| **AI** | Yandex AI Studio (Chat Agents API) |
| **Аутентификация** | JWT (jsonwebtoken), bcrypt, cookie-parser |
| **Валидация** | Zod 4 |
| **Безопасность** | helmet, express-rate-limit, CORS |
| **Инфраструктура** | Docker Compose, nginx |

</div>

---

## 📄 Лицензия

Copyright © 2025 MamaCare. Все права защищены.

Исходный код открыт для ознакомления. Использование, копирование, распространение или создание производных продуктов без письменного разрешения правообладателя запрещено.

По вопросам лицензирования: ash06work17@gmail.com
