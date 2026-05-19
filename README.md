[README.md](https://github.com/user-attachments/files/28027178/README.md)
# 🇪🇸 Habla Español Bot

Telegram-бот для изучения испанского языка — A1 до C1.
Весёлый, с юмором, с ИИ-репетитором Sofía и монетизацией через Telegram Payments.

---

## 🚀 Быстрый старт

### 1. Установи зависимости
```bash
npm install
```

### 2. Получи токены

**BOT_TOKEN** — от @BotFather в Telegram:
1. Напиши @BotFather → /newbot
2. Придумай имя и username (например: HablaEspanolBot)
3. Скопируй токен

**ANTHROPIC_API_KEY** — от Anthropic:
1. Зайди на https://console.anthropic.com
2. API Keys → Create Key
3. Скопируй ключ

**PAYMENT_TOKEN** — от @BotFather:
1. @BotFather → /mybots → выбери бота → Payments
2. Подключи провайдера (Stripe для тестов, ЮMoney и др.)
3. Скопируй токен платежей

### 3. Запусти бота

```bash
BOT_TOKEN=твой_токен \
ANTHROPIC_API_KEY=твой_ключ \
PAYMENT_TOKEN=твой_платёжный_токен \
node bot.js
```

Или создай файл `.env` и используй dotenv:
```env
BOT_TOKEN=...
ANTHROPIC_API_KEY=...
PAYMENT_TOKEN=...
```

---

## 📚 Структура курса

| Уровень | Emoji | Темы |
|---------|-------|------|
| A1 | 🌱 | Знакомство, Страны, Числа/время, Ресторан |
| A2 | 🌿 | Indefinido, Imperfecto, Здоровье, Шопинг |
| B1 | 🌊 | Subjuntivo, Мнение, Сленг, Путешествия |
| B2 | 🔥 | Condicional, Косвенная речь, Риторика, Политика |
| C1 | 💫 | Идиомы, СМИ, Литература, Менталитет |

---

## 💰 Монетизация

- **1-й урок A1** — бесплатно
- **Каждый урок** — 1€
- **Весь курс A1–C1** — 10€

Оплата через Telegram Payments (встроенная система).

---

## 🤖 ИИ-репетитор Sofía

- Отвечает на вопросы об испанском 24/7
- Лимит: 10 вопросов в день на пользователя
- Сбрасывается каждый день в полночь
- Работает через Anthropic Claude API

---

## 🗄️ Хранение данных

Сейчас данные хранятся **в памяти** (users object).
Для продакшена замени на БД:

**SQLite (простой вариант):**
```bash
npm install better-sqlite3
```

**PostgreSQL (серьёзный вариант):**
```bash
npm install pg
```

---

## 🚢 Деплой на сервер

**Railway (рекомендую — легко):**
1. Создай проект на railway.app
2. Подключи GitHub репозиторий
3. Добавь переменные окружения в Variables
4. Деплой автоматический!

**VPS (если есть сервер):**
```bash
# Установи pm2 для автозапуска
npm install -g pm2
pm2 start bot.js --name habla-espanol
pm2 save
pm2 startup
```

---

## 📁 Структура файлов

```
habla-espanol-bot/
├── bot.js          # Основной файл бота
├── package.json    # Зависимости
└── README.md       # Этот файл
```

---

## ✏️ Добавить новые темы

В файле `bot.js` найди объект `COURSE` и добавь тему по шаблону:

```javascript
{
  title: "🎯 Название темы",
  theory: `*Заголовок* 📚\n\nТекст теории...`,
  exercises: [
    {
      q: "Вопрос?",
      options: ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
      correct: 0,  // индекс правильного ответа (0-3)
      explain: "Объяснение почему правильно!"
    }
  ],
  test: [
    { q: "Вопрос теста?", options: ["A", "B", "C", "D"], correct: 1 }
  ]
}
```

---

¡Buena suerte! 🍀🇪🇸
