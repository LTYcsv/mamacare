# MamaCare

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-8.0_beta-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Zod-4.4-3068B7?style=flat-square" alt="Zod"/>
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" alt="Proprietary"/>
</p>

Персональный дневник беременности с AI-ассистентом.

---

## О проекте

MamaCare — веб-приложение для сопровождения беременности: от первых недель до родов. Помогает вести ежедневный дневник самочувствия, отслеживать прогресс по неделям, получать ответы на вопросы от AI-ассистента и вовремя замечать тревожные симптомы.

Проект создан для будущих мам, которым нужен удобный и приватный инструмент — без лишних функций, рекламы и посторонних глаз.

---

## Что умеет

**Ежедневный чекин** — настроение, симптомы, заметки о питании, активности и самочувствии. Всё в одном месте, каждый день.

**Трекер недель** — текущая неделя беременности (1–42) и триместр с визуальным прогрессом.

**AI-ассистент** — отвечает на вопросы о беременности, опираясь на актуальные данные. Знает, на какой неделе вы находитесь, и учитывает это в ответах.

**Еженедельная сводка** — AI анализирует записи за неделю и формирует краткий дайджест: как прошла неделя, что изменилось.

**Тревожные симптомы** — если в чекине отмечены опасные симптомы, приложение сразу показывает контакты врача и рекомендацию обратиться за помощью.

**Карточка врача** — имя, специализация, телефон, клиника. Всегда под рукой.

---

## Статус

Проект находится в разработке, публичный деплой не выпущен.

---

## Безопасность и приватность

- Пароли хранятся в виде хеша (bcrypt), в открытом виде не сохраняются
- Сессии защищены JWT с ротацией refresh-токенов: при обнаружении повторного использования токена все сессии пользователя автоматически отзываются
- AI-запросы обрабатываются через серверный прокси — ключи API не попадают в браузер
- Соединение защищено HTTPS

---

## Стек

React · Node.js / Express · PostgreSQL · Yandex AI Studio · Docker

---

## Лицензия

Copyright © 2025 MamaCare. Все права защищены.

Исходный код доступен для ознакомления. Использование, копирование, распространение или создание производных продуктов — в том числе в коммерческих целях или в составе SaaS-сервисов — без письменного разрешения правообладателя запрещено.

По вопросам лицензирования: ash06work17@gmail.com
