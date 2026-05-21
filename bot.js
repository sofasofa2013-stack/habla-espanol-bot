/**
 * 🇪🇸 HABLA ESPAÑOL BOT
 * Telegram bot for learning Spanish — A1 to C1
 * Stack: node-telegram-bot-api + Anthropic Claude API
 *
 * SETUP:
 *   npm install node-telegram-bot-api @anthropic-ai/sdk
 *   BOT_TOKEN=... ANTHROPIC_API_KEY=... PAYMENT_TOKEN=... node bot.js
 */

const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk");

// ─── ENV ────────────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_KEY";
// Telegram Payments token — get from @BotFather → Payments


const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ─── PRICES ─────────────────────────────────────────────────
const PRICE_LESSON = 100;   // 1 EUR in cents
const PRICE_COURSE = 1000;  // 10 EUR in cents

// ─── IN-MEMORY STATE ────────────────────────────────────────
// In production replace with a real DB (SQLite / Postgres / Redis)
const users = {}; // { chatId: { paid, fullCourse, currentLevel, currentTopic, currentStep, aiCount, ... } }

function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      paid: [],          // list of "A1_0", "A1_1", … lesson keys that are unlocked
      fullCourse: false,
      currentLevel: null,
      currentTopic: null,
      currentStep: 0,    // 0=theory, 1=exercises, 2=test, 3=results
      exerciseIndex: 0,
      testIndex: 0,
      testScore: 0,
      testAnswers: [],
      aiCount: 0,        // Sofia questions used today
      aiDate: null,      // date string for reset
      awaitingAI: false,
    };
  }
  return users[chatId];
}

// ─── COURSE DATA ─────────────────────────────────────────────
const COURSE = {
  A1: {
    emoji: "🌱",
    label: "A1 — Bebé Español",
    topics: [
      {
        title: "👋 Hola, mundo! Знакомство",
        theory: `*Базовые приветствия* 🎉

*Hola* — Привет (в любое время суток, буквально!)
*Buenos días* — Доброе утро ☀️
*Buenas tardes* — Добрый день/вечер 🌤
*Buenas noches* — Спокойной ночи 🌙
*¿Cómo te llamas?* — Как тебя зовут?
*Me llamo...* — Меня зовут...
*Mucho gusto* — Очень приятно 🤝
*Encantado/a* — Рад/а познакомиться

🧠 *Лайфхак:* Испанцы говорят «Hola» даже когда берут трубку. Никакого «алло» — только страсть! 🔥

*Глагол LLAMARSE (называться):*
Me llamo — я называюсь
Te llamas — ты называешься
Se llama — он/она называется

😄 Запомни: «Me llamo» буквально «я называю себя». Какая самооценка!`,
        exercises: [
          { q: "🤔 Как сказать «Добрый день»?", options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"], correct: 1, explain: "Tardes = вторая половина дня. Días = утро. Не путай — иначе поздороваешься с ночью в полдень 😂" },
          { q: "👩 Женщина говорит «Я очень рада». Что скажет?", options: ["Encantado", "Mucho gusto", "Encantada", "Me llamo"], correct: 2, explain: "EncantadA — женский род! Испанский честен насчёт пола 😏" },
          { q: "📝 Заполни: «_____ llamo Sofia»", options: ["Te", "Me", "Se", "Le"], correct: 1, explain: "Me llamo = меня зовут. Я называю СЕБЯ Sofíей! 💁‍♀️" },
        ],
        test: [
          { q: "Как спросить имя?", options: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "¿Cuántos años?"], correct: 1 },
          { q: "«Спокойной ночи» по-испански:", options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"], correct: 2 },
          { q: "«Mucho gusto» означает:", options: ["Очень вкусно", "Очень приятно", "Очень много", "Привет"], correct: 1 },
          { q: "Мужчина скажет:", options: ["Encantada", "Encantado", "Encantados", "Encantadas"], correct: 1 },
          { q: "«Me llamo» = ...", options: ["Ты называешься", "Он называется", "Я называюсь", "Мы называемся"], correct: 2 },
        ],
      },
      {
        title: "🌍 ¿De dónde eres? Страны и национальности",
        theory: `*Откуда ты родом?* 🗺

*¿De dónde eres?* — Откуда ты?
*Soy de Rusia* — Я из России
*Soy ruso/rusa* — Я русский/русская

🇪🇸 Испания → español/española
🇫🇷 Francia → francés/francesa  
🇩🇪 Alemania → alemán/alemana
🇲🇽 México → mexicano/mexicana
🇦🇷 Argentina → argentino/argentina

*Глагол SER (быть):*
Yo soy — Я
Tú eres — Ты
Él/Ella es — Он/Она
Nosotros somos — Мы
Ellos son — Они

⚠️ *Важно:* национальности пишутся с маленькой буквы!
Soy ruso — не Ruso. Испанский скромнее нас 😄`,
        exercises: [
          { q: "«Ella _____ de México»", options: ["soy", "eres", "es", "son"], correct: 2, explain: "Ella → es. Три формы: yo→soy, tú→eres, él/ella→es. Выучи — и ты уже говоришь! 🚀" },
          { q: "Женщина из Франции скажет:", options: ["Soy francés", "Soy francesa", "Es francesa", "Eres francesa"], correct: 1, explain: "Francesa — женский род. Francés — мужской. Она говорит о СЕБЕ → Soy francesa 💁‍♀️" },
          { q: "Национальности пишутся...", options: ["С большой буквы", "С маленькой буквы", "Как угодно", "Всегда капсом"], correct: 1, explain: "Soy ruso — не Ruso! Испанский скромен в этом вопросе 😌" },
        ],
        test: [
          { q: "«Nosotros _____ amigos»", options: ["soy", "eres", "es", "somos"], correct: 3 },
          { q: "Как спросить «Откуда ты?»", options: ["¿Cómo te llamas?", "¿De dónde eres?", "¿Dónde estás?", "¿Qué haces?"], correct: 1 },
          { q: "«Мы из России»:", options: ["Soy de Rusia", "Eres de Rusia", "Somos de Rusia", "Son de Rusia"], correct: 2 },
          { q: "Мужчина из Испании:", options: ["española", "español", "Español", "Española"], correct: 1 },
          { q: "«Ellos _____ españoles»", options: ["soy", "eres", "es", "son"], correct: 3 },
        ],
      },
      {
        title: "🔢 Números y tiempo — Числа и время",
        theory: `*Числа 1–20* 🔢

1 uno, 2 dos, 3 tres, 4 cuatro, 5 cinco
6 seis, 7 siete, 8 ocho, 9 nueve, 10 diez
11 once, 12 doce, 13 trece, 14 catorce, 15 quince
16 dieciséis, 17 diecisiete, 18 dieciocho, 19 diecinueve, 20 veinte

*Который час?* ⏰
*¿Qué hora es?* — Который час?
*Es la una* — Час (единственное число!)
*Son las dos* — Два часа
*Son las tres y media* — Полтретьего (3:30)
*Son las cuatro menos cuarto* — Без четверти четыре (3:45)

*Дни недели* 📅
lunes, martes, miércoles, jueves, viernes, sábado, domingo

😂 *Факт:* Испания живёт не по своему часовому поясу — Франко в 1940-м перевёл часы под Берлин. Теперь испанцы ужинают в 22:00 и ложатся за полночь. Хаос? Нет — традиция!`,
        exercises: [
          { q: "«3 часа» по-испански:", options: ["Es la tres", "Son las tres", "Son los tres", "Es las tres"], correct: 1, explain: "Son las tres — множественное число. Только час (una) — es la una. Запомни это исключение! ⏰" },
          { q: "«Son las seis y media» = ?", options: ["6:15", "6:30", "6:45", "7:30"], correct: 1, explain: "Media = половина = 30 минут. ¡Muy bien! 🎉" },
          { q: "Среда по-испански:", options: ["martes", "jueves", "miércoles", "viernes"], correct: 2, explain: "Miércoles — от планеты Меркурий! Все дни недели = планеты. Космос! 🪐" },
        ],
        test: [
          { q: "«¿Qué hora es?» = ?", options: ["Какой день?", "Который час?", "Сколько лет?", "Как дела?"], correct: 1 },
          { q: "Число 15:", options: ["quince", "doce", "trece", "catorce"], correct: 0 },
          { q: "«Es la una» используется для:", options: ["2 часов", "3 часов", "1 часа", "12 часов"], correct: 2 },
          { q: "Пятница:", options: ["sábado", "viernes", "jueves", "lunes"], correct: 1 },
          { q: "«Без четверти пять» = ?", options: ["Son las cinco y cuarto", "Son las cinco menos cuarto", "Son las cuatro y media", "Es la cinco"], correct: 1 },
        ],
      },
      {
        title: "🍽️ En el restaurante — В ресторане",
        theory: `*В ресторане* 🍷

*¿Tiene una mesa para dos?* — Столик на двоих есть?
*La carta, por favor* — Меню, пожалуйста
*¿Qué recomienda?* — Что посоветуете?
*Quisiera...* — Я бы хотел/а...
*Para mí, ...* — Для меня...
*La cuenta, por favor* — Счёт, пожалуйста

*Еда и напитки* 🥘
*el agua* — вода
*el vino tinto/blanco* — красное/белое вино
*la cerveza* — пиво
*la paella* — паэлья
*el jamón* — хамон (священная реликвия Испании 😄)
*la tortilla* — испанский омлет с картошкой

😂 *Культфакт:* Jamón ibérico стоит до €300 за ногу. В средневековье испанцы вешали хамон в окнах как доказательство своей религии. История — суровая штука!

*Quisiera* = вежливая форма «хочу». Quiero — звучит как приказ. Quisiera — как воспитанный человек 🎩`,
        exercises: [
          { q: "Как попросить меню?", options: ["La cuenta, por favor", "La carta, por favor", "El agua, por favor", "La mesa, por favor"], correct: 1, explain: "La carta = меню! La cuenta = счёт. Не перепутай — иначе попросишь счёт вместо меню 😅" },
          { q: "«Красное вино»:", options: ["vino blanco", "vino rosado", "vino tinto", "vino negro"], correct: 2, explain: "Tinto = тёмный/красный для вина. В Испании это must-know! 🍷" },
          { q: "Tortilla española — это:", options: ["Мексиканская лепёшка", "Омлет с картошкой", "Блин", "Пицца"], correct: 1, explain: "Испанская тортилья — ОМЛЕТ с картофелем. Совсем не мексиканская лепёшка! 🤯" },
        ],
        test: [
          { q: "«La cuenta» = ?", options: ["Карта", "Счёт", "Меню", "Столик"], correct: 1 },
          { q: "Вежливое «я хочу»:", options: ["Quiero", "Quisiera", "Quieres", "Queremos"], correct: 1 },
          { q: "«Para mí» = ?", options: ["Для тебя", "Для него", "Для меня", "Для нас"], correct: 2 },
          { q: "«¿Qué recomienda?» = ?", options: ["Что вы хотите?", "Что посоветуете?", "Что это?", "Сколько стоит?"], correct: 1 },
          { q: "El jamón — это:", options: ["Рыба", "Курица", "Вяленая свинина", "Сыр"], correct: 2 },
        ],
      },
    ],
  },

  A2: {
    emoji: "🌿",
    label: "A2 — Despegando",
    topics: [
      {
        title: "⏮️ Pretérito Indefinido — Что ты делал вчера?",
        theory: `*Прошедшее завершённое время* 📅

Используй для конкретных завершённых действий в прошлом!

*Правильные глаголы (-AR):*
hablar → hablé, hablaste, habló, hablamos, hablaron

*Правильные глаголы (-ER/-IR):*
comer → comí, comiste, comió, comimos, comieron

*Маркеры времени:*
ayer — вчера 📆
la semana pasada — на прошлой неделе
hace dos días — два дня назад
el año pasado — в прошлом году

*Неправильные (учи как стихи! 😅):*
ir/ser → fui, fuiste, fue, fuimos, fueron

😂 *Забавный факт:* IR и SER в прошедшем — ОДИНАКОВЫЕ! «Fui médico» = я был врачом. «Fui al mercado» = я пошёл на рынок. Испанский любит загадки!`,
        exercises: [
          { q: "«Вчера я говорил»:", options: ["Ayer hablo", "Ayer hablé", "Ayer hablaba", "Ayer hablaré"], correct: 1, explain: "Hablé — Indefinido для yo (-AR глагол). Ударение: хаблЭ! 🎯" },
          { q: "«Она ела пиццу»:", options: ["comía pizza", "come pizza", "comió pizza", "comerá pizza"], correct: 2, explain: "Comió — третье лицо Indefinido от comer. Ударение на последнем слоге! 💪" },
          { q: "«Hace dos días» = ?", options: ["Через два дня", "Два дня назад", "Каждые два дня", "Два дня подряд"], correct: 1, explain: "Hace + время = [время] НАЗАД. Hace un año = год назад 🕐" },
        ],
        test: [
          { q: "«Fui» — форма глагола:", options: ["saber", "tener", "ir/ser", "hacer"], correct: 2 },
          { q: "«Мы жили в Испании»:", options: ["Vivimos en España", "Vivíamos", "Viviremos", "Vivían"], correct: 0 },
          { q: "Маркер Indefinido:", options: ["siempre", "todos los días", "ayer", "cuando era niño"], correct: 2 },
          { q: "«Ты купил книгу»:", options: ["compras", "comprabas", "compraste", "comprarás"], correct: 2 },
          { q: "«Ellos hablaron» = ?", options: ["они говорят", "они говорили (завершённо)", "они говорили обычно", "они будут говорить"], correct: 1 },
        ],
      },
      {
        title: "🌅 Pretérito Imperfecto — Детство и воспоминания",
        theory: `*Незавершённое прошедшее* 😌

*Когда использовать:*
• Привычные действия в прошлом («я ВСЕГДА делал»)
• Описание фона («была ночь, шёл дождь»)
• Возраст и состояние («мне было 10 лет»)

*Окончания -AR:*
hablar → hablaba, hablabas, hablaba, hablábamos, hablaban

*Окончания -ER/-IR:*
comer → comía, comías, comía, comíamos, comían

*Маркеры Imperfecto:*
siempre — всегда 🔄
antes — раньше
cuando era niño — когда я был ребёнком
todos los días — каждый день
de pequeño/a — в детстве

*Только 3 неправильных глагола!* 🎉
ser → era / ir → iba / ver → veía

😄 *Запомни разницу:*
comí = я поел (один раз, завершил)
comía = я ел (регулярно, было привычкой)`,
        exercises: [
          { q: "«Я всегда ел пиццу в детстве»:", options: ["Siempre comí pizza", "Siempre comía pizza", "Siempre comeré pizza", "Siempre como pizza"], correct: 1, explain: "Siempre + привычка в прошлом = Imperfecto. Comía — правильно! 🍕" },
          { q: "«Era» — форма глагола:", options: ["estar", "tener", "ir", "ser"], correct: 3, explain: "Era — Imperfecto от SER. Era niño = был ребёнком 👦" },
          { q: "Imperfecto НЕ используется для:", options: ["описания погоды", "единственного завершённого действия", "привычек", "возраста"], correct: 1, explain: "Одно завершённое = Indefinido! Comí (раз поел) vs comía (обычно ел) 🎯" },
        ],
        test: [
          { q: "«Раньше я жил в Москве»:", options: ["Antes vivía en Moscú", "Antes viví", "Antes vivo", "Antes viviré"], correct: 0 },
          { q: "«Iba» — форма глагола:", options: ["hablar", "ir", "ver", "ser"], correct: 1 },
          { q: "«Мне было 10 лет»:", options: ["Tengo 10 años", "Tuve 10 años", "Tenía 10 años", "Tendré 10 años"], correct: 2 },
          { q: "Маркер Imperfecto:", options: ["ayer", "hace dos días", "siempre", "el año pasado"], correct: 2 },
          { q: "«Todos los días comía» = ?", options: ["Однажды поел", "Ел каждый день (привычка)", "Буду есть каждый день", "Ем каждый день"], correct: 1 },
        ],
      },
      {
        title: "🏥 La salud — Здоровье и у врача",
        theory: `*У врача* 🩺

*Me duele...* — У меня болит... (ед.ч.)
*Me duelen...* — У меня болят... (мн.ч.)
*Tengo fiebre* — У меня температура 🌡
*Tengo tos* — У меня кашель
*Estoy mareado/a* — Кружится голова
*Me siento mal* — Я плохо себя чувствую
*¿Qué le pasa?* — Что с вами? (врач спрашивает)

*Части тела* 💪
la cabeza — голова
la garganta — горло
el estómago — живот
la espalda — спина
el brazo — рука (от плеча)
la pierna — нога

*Грамматика: DOLER (болеть)*
Me *duele* la cabeza — голова (ед.ч.)
Me *duelen* las piernas — ноги (мн.ч.)

😂 Работает как GUSTAR — субъект ПОСЛЕ глагола! Не путай — иначе скажешь что ты болишь у головы 😅

*В аптеке:*
un analgésico — обезболивающее
una receta — рецепт`,
        exercises: [
          { q: "«У меня болит голова»:", options: ["Me duelen la cabeza", "Me duele la cabeza", "Tengo cabeza", "Me dolor cabeza"], correct: 1, explain: "Duele — единственное число (la cabeza = 1 голова). Duelen — для мн.ч. 🧠" },
          { q: "«У меня кашель»:", options: ["Tengo tos", "Tengo gripe", "Estoy tos", "Me duele tos"], correct: 0, explain: "Tengo tos = у меня есть кашель. Просто и работает! 😷" },
          { q: "«Me duelen las piernas» — почему DUELEN?", options: ["Всегда duelen", "Piernas — множественное", "С me всегда duelen", "Ошибка"], correct: 1, explain: "Piernas (ноги) — мн.ч. → duelen. Одна нога → me duele la pierna 🦵" },
        ],
        test: [
          { q: "«La receta» = ?", options: ["Рецепт", "Лекарство", "Больница", "Врач"], correct: 0 },
          { q: "«Мне плохо»:", options: ["Me siento bien", "Me siento mal", "Estoy bien", "Tengo bien"], correct: 1 },
          { q: "Горло:", options: ["el pecho", "la espalda", "la garganta", "el cuello"], correct: 2 },
          { q: "«¿Qué le pasa?» — вопрос:", options: ["пациента к врачу", "врача к пациенту", "в аптеке", "дружеский"], correct: 1 },
          { q: "«У меня температура»:", options: ["Tengo fiebre", "Me duele fiebre", "Estoy fiebre", "Tengo frío"], correct: 0 },
        ],
      },
      {
        title: "🛍️ Las compras — Шопинг",
        theory: `*В магазине* 🏬

*¿Cuánto cuesta?* — Сколько стоит?
*¿Tiene esto en otra talla?* — Есть другой размер?
*¿Puedo probármelo?* — Можно примерить?
*Me queda bien/mal* — Подходит/не подходит
*Me lo llevo* — Я это возьму 🛒
*¿Aceptan tarjeta?* — Принимаете карту?
Efectivo — наличные / Tarjeta — карта

*Числа для цен:*
30 treinta, 40 cuarenta, 50 cincuenta
60 sesenta, 70 setenta, 80 ochenta, 90 noventa
100 cien, 101 ciento uno, 200 doscientos, 1000 mil

*Прилагательные:*
caro/a — дорогой 💸
barato/a — дешёвый 🎉
de moda — модный
pasado de moda — немодный

😂 *Культфакт:* Испанский супермаркет Mercadona — национальная религия. Их фирменные товары стоят втрое дешевле брендов. Испанцы едут в другой район ради «своего» Меркадоны!`,
        exercises: [
          { q: "Как спросить цену?", options: ["¿Cómo se llama?", "¿Cuánto cuesta?", "¿Dónde está?", "¿Qué es esto?"], correct: 1, explain: "¿Cuánto cuesta? = Сколько стоит? Cuánto = сколько, costar = стоить 💰" },
          { q: "«Me lo llevo» = ?", options: ["Я смотрю", "Я примеряю", "Я это возьму", "Я ухожу"], correct: 2, explain: "Me lo llevo — буквально «я это несу с собой». Фраза кассира мечты! 🛍️" },
          { q: "«Me queda mal» = ?", options: ["Мне нравится", "Не подходит", "Это дорого", "Мне плохо"], correct: 1, explain: "Quedar = подходить (об одежде). Mal = плохо → не подходит 👗" },
        ],
        test: [
          { q: "«Esto es barato» = ?", options: ["Это дорого", "Это дёшево", "Это красиво", "Это новое"], correct: 1 },
          { q: "«¿Puedo probármelo?» = просьба...", options: ["посмотреть", "примерить", "купить", "вернуть"], correct: 1 },
          { q: "«Efectivo» = ?", options: ["Карта", "Наличные", "Чек", "Скидка"], correct: 1 },
          { q: "100 по-испански (само по себе):", options: ["ciento", "cien", "cientos", "cent"], correct: 1 },
          { q: "«Otra talla» = ?", options: ["Другой цвет", "Другой размер", "Другая цена", "Другой стиль"], correct: 1 },
        ],
      },
    ],
  },

  B1: {
    emoji: "🌊",
    label: "B1 — Intermedio",
    topics: [
      {
        title: "😱 Subjuntivo — Добро пожаловать в кошмар",
        theory: `*Subjuntivo — Сослагательное наклонение* 🎭

Используй когда говоришь о НЕРЕАЛЬНОМ, ЖЕЛАЕМОМ, СОМНИТЕЛЬНОМ!

*Правило WEIRDO:*
W — Wishes (желания): querer, desear
E — Emotion (эмоции): alegrarse, tener miedo
I — Impersonal: es importante que
R — Recommendation: recomendar, aconsejar
D — Doubt/Denial (сомнение): no creer, dudar
O — Ojalá (пожелания)

*Формы Presente de Subjuntivo (-AR):*
hablar → hable, hables, hable, hablemos, hablen

*Формы (-ER/-IR):*
comer → coma, comas, coma, comamos, coman

🎯 *Главное правило:*
Два субъекта + que → Subjuntivo!
Yo quiero *(YO)* que tú vengas *(TÚ)* → Subjuntivo! ✅
Yo quiero venir *(YO+YO)* → Infinitivo ✅

😂 Subjuntivo существует потому что испанский проводит границу между реальностью и нереальностью. Это ФИЛОСОФИЯ! «If I were you» в английском — тоже Subjuntivo. Так что ты уже знал, просто не знал что знал 🤣`,
        exercises: [
          { q: "«Quiero que tú _____ (venir)»:", options: ["vienes", "vengas", "viene", "venís"], correct: 1, explain: "Два субъекта (yo, tú) + que → Subjuntivo! Vengas — правильно! 🎯" },
          { q: "В каком предложении Subjuntivo НУЖЕН?", options: ["Creo que es verdad", "No creo que sea verdad", "Sé que viene", "Veo que trabaja"], correct: 1, explain: "No creo que + Subjuntivo (сомнение). Creo que + Indicativo (уверенность). Отрицание меняет всё! 🔄" },
          { q: "«Ojalá» требует:", options: ["Indicativo", "Subjuntivo", "Infinitivo", "Futuro"], correct: 1, explain: "Ojalá + Subjuntivo — ВСЕГДА! Ojalá от арабского «иншалла» 🌙" },
        ],
        test: [
          { q: "«Es importante que _____ (estudiar)»:", options: ["estudias", "estudies", "estudiás", "estudia"], correct: 1 },
          { q: "«Me alegra que estés aquí» — почему Subjuntivo?", options: ["после que всегда", "эмоция (E в WEIRDO)", "желание", "сомнение"], correct: 1 },
          { q: "Subjuntivo от COMER для nosotros:", options: ["comemos", "comamos", "comermos", "comimos"], correct: 1 },
          { q: "«Te recomiendo que _____ (descansar)»:", options: ["descansas", "descansarás", "descanses", "descansa"], correct: 2 },
          { q: "«Quiero venir» vs «Quiero que vengas»:", options: ["нет разницы", "я хочу прийти / хочу чтобы ты пришёл", "только стиль", "временная разница"], correct: 1 },
        ],
      },
      {
        title: "💬 Opinión y debate — Выражение мнения",
        theory: `*Как спорить по-испански* 🗣️

Испанцы спорят громко, эмоционально и перебивая друг друга. Готов? 😤

*Выражение мнения:*
En mi opinión... — По моему мнению...
Creo que / Pienso que — Думаю, что...
Me parece que — Мне кажется, что...
Estoy convencido/a de que — Я убеждён, что...
Desde mi punto de vista — С моей точки зрения

*Согласие/несогласие:*
Estoy de acuerdo — Согласен ✅
No estoy de acuerdo — Не согласен ❌
Tienes razón — Ты прав
No tienes razón — Ты не прав
En parte, sí, pero... — Отчасти да, но...

*Для дискуссии:*
Por un lado... por otro lado — С одной стороны...
Sin embargo — Тем не менее
A pesar de (que) — Несмотря на

😂 *Культфакт:* Испанские кафе — место для tertulia: бесконечной беседы без цели прийти к выводу. Часами. Это не лень — это культура! ☕`,
        exercises: [
          { q: "«Ты прав» по-испански:", options: ["Estás correcto", "Tienes razón", "Eres razón", "Tienes correcto"], correct: 1, explain: "Tener razón = быть правым (буквально «иметь разум»). Испанская логика! 🧠" },
          { q: "«Тем не менее»:", options: ["Por lo tanto", "Sin embargo", "Por ejemplo", "Además"], correct: 1, explain: "Sin embargo = тем не менее. Один из самых полезных союзов! Учи наизусть 📝" },
          { q: "«En parte, sí, pero...» выражает:", options: ["полное согласие", "полное несогласие", "частичное согласие", "безразличие"], correct: 2, explain: "Отчасти да, но... — дипломатичный способ не согласиться, не обидев. Очень полезно! 🤝" },
        ],
        test: [
          { q: "«Estoy de acuerdo» = ?", options: ["Я согласен", "Я не согласен", "Я не понимаю", "Мне всё равно"], correct: 0 },
          { q: "«A pesar de que» = ?", options: ["из-за того что", "несмотря на то что", "потому что", "если"], correct: 1 },
          { q: "«Por un lado» = ?", options: ["Напротив", "С одной стороны", "Кроме того", "Например"], correct: 1 },
          { q: "«Me parece que» + ?", options: ["Subjuntivo всегда", "Indicativo", "Infinitivo", "ничего"], correct: 1 },
          { q: "«No tienes razón» = ?", options: ["Ты прав", "Ты не прав", "У тебя нет разума", "Не понимаю"], correct: 1 },
        ],
      },
      {
        title: "😎 Slengo — Разговорный испанский",
        theory: `*Язык улицы* 🏙️

Учебники учат одному. Улица — другому. Сегодня ты учишь УЛИЦУ! 😎

*Испанский сленг (Испания):*
¡Qué guay! — Как круто! 🤩
¡Mola! / ¡Mola mazo! — Классно! / Очень круто!
Tío/Tía — Чувак/Чувиха
Flipar — сойти с ума от восторга: ¡Estoy flipando!
Mogollón (de) — куча: Hay mogollón de gente
¡Venga! — Давай! / Ок! / Пошли! / Пока! (всё сразу 😂)
¡Qué rollo! — Как скучно!
Estar hecho polvo — быть в хлам уставшим
Pasarlo bien/mal — хорошо/плохо проводить время

*Латиноамериканские варианты:*
¡Qué chévere! (Колумбия) — Круто!
¡Órale! (Мексика) — Давай/Ок
Güey/Wey (Мексика) — Чувак
¡Buena onda! (Аргентина) — Хорошая атмосфера

😂 Испанцы произносят «¡Venga!» в среднем 47 раз в день. Venga = пока, давай, ок, пошли, ладно. Один звук — вся палитра согласия!`,
        exercises: [
          { q: "«¡Mola mazo!» = ?", options: ["Очень скучно", "Очень круто", "Много людей", "Пошли!"], correct: 1, explain: "Molar = нравиться/быть крутым. Mazo = очень. Mola mazo = ОЧЕНЬ круто! 🔥" },
          { q: "«¡Qué rollo!» — это:", options: ["Как интересно!", "Как скучно!", "Как круто!", "Сколько народу!"], correct: 1, explain: "Rollo = скука/тягомотина. Антоним ¡Qué guay! Произноси с выражением страдания 😩" },
          { q: "«Estar hecho polvo» = ?", options: ["Быть богатым", "Быть в хлам уставшим", "Быть модным", "Быть голодным"], correct: 1, explain: "Буквально «стать пылью». Estoy hecho polvo después del trabajo 😵" },
        ],
        test: [
          { q: "«Tío» в разговорном испанском = ?", options: ["Дядя (всегда)", "Чувак", "Старик", "Друг"], correct: 1 },
          { q: "«¡Venga!» используется как:", options: ["только «пошли»", "только «пока»", "только «ок»", "всё перечисленное и больше"], correct: 3 },
          { q: "«Flipar» = ?", options: ["скучать", "потерять голову от восторга", "уставать", "спорить"], correct: 1 },
          { q: "«Güey/Wey» — сленг из:", options: ["Испании", "Аргентины", "Мексики", "Колумбии"], correct: 2 },
          { q: "«Pasarlo bien» = ?", options: ["плохо провести время", "хорошо провести время", "пройти мимо", "не обращать внимания"], correct: 1 },
        ],
      },
      {
        title: "✈️ Viajes y turismo — Путешествия",
        theory: `*В аэропорту и отеле* 🏨

*el vuelo* — рейс ✈️
*la escala* — пересадка
*facturar el equipaje* — сдать багаж
*la tarjeta de embarque* — посадочный талон
*la aduana* — таможня
*hacer cola* — стоять в очереди

*В отеле:*
*¿Tiene habitaciones disponibles?* — Есть свободные номера?
*una habitación doble* — двухместный номер
*con desayuno incluido* — с включённым завтраком
*¿Hay wifi?* — Есть вайфай?

*Ориентация в городе:*
*¿Cómo se llega a...?* — Как добраться до...?
*Todo recto* — Прямо
*a la derecha* — направо
*a la izquierda* — налево
*en la esquina* — на углу

😂 *Культфакт:* Испания — одна из самых посещаемых стран. Но туристы едут в Барселону, а местные предпочитают маленькие белые деревни Андалусии — pueblos blancos. Спроси у испанца о любимом месте — получишь часовой рассказ!`,
        exercises: [
          { q: "«Посадочный талон»:", options: ["la aduana", "el pasaporte", "la tarjeta de embarque", "el vuelo"], correct: 2, explain: "Tarjeta de embarque = boarding pass. Embarque = посадка 🛫" },
          { q: "«Стоять в очереди»:", options: ["hacer cola", "hacer fila", "esperar tiempo", "estar fila"], correct: 0, explain: "Hacer cola = стоять в очереди (буквально «делать хвост»). Cola = хвост 🐒" },
          { q: "«Todo recto» = ?", options: ["Направо", "Налево", "Прямо", "Назад"], correct: 2, explain: "Todo recto = всё прямо = прямо. Синоним: derecho (не путай с a la derecha = направо!) 🧭" },
        ],
        test: [
          { q: "«Con desayuno incluido» = ?", options: ["Без завтрака", "С включённым завтраком", "Только завтрак", "Завтрак отдельно"], correct: 1 },
          { q: "«¿Cómo se llega a...?» — вопрос о:", options: ["названии места", "истории места", "как добраться", "стоимости"], correct: 2 },
          { q: "«La escala» в авиации:", options: ["шкала оценок", "пересадка", "расстояние", "время в пути"], correct: 1 },
          { q: "«A la izquierda» = ?", options: ["Направо", "Налево", "Прямо", "Назад"], correct: 1 },
          { q: "«¿Hay habitaciones disponibles?»:", options: ["Есть ли свободные номера?", "Сколько стоит номер?", "Когда выезд?", "Есть ли вайфай?"], correct: 0 },
        ],
      },
    ],
  },

  B2: {
    emoji: "🔥",
    label: "B2 — Avanzado",
    topics: [
      {
        title: "💭 Condicional — Мечты и условия",
        theory: `*Conditional Simple* ✨

*Образование:* Инфинитив + -ía, -ías, -ía, -íamos, -íais, -ían

hablar → hablaría, hablarías, hablaría...
comer → comería, comerías, comería...

*Когда использовать:*
1️⃣ Вежливые просьбы: ¿Podría ayudarme? — Не могли бы помочь?
2️⃣ Желания: Me gustaría viajar — Хотелось бы путешествовать
3️⃣ Советы: En tu lugar, estudiaría más — На твоём месте, учился бы больше
4️⃣ Условные Si+Imperfecto Subj.+Condicional:
Si tuviera dinero, viajaría — Если бы были деньги, путешествовал бы

*Неправильные основы:*
poder → podr- (podría) ✈️
tener → tendr- (tendría)
hacer → har- (haría)
decir → dir- (diría)
salir → saldr- (saldría)
venir → vendr- (vendría)

😂 «Quiero un café» звучит как приказ. «Querría un café» = воспитанный человек. Один суффикс — и ты уже джентльмен! 🎩`,
        exercises: [
          { q: "«Если бы было время, учился бы»:", options: ["Si tengo tiempo, estudiaré", "Si tuviera tiempo, estudiaría", "Si tendría tiempo, estudiaría", "Si tuviera tiempo, estudiara"], correct: 1, explain: "Si + Imperfecto Subj. (tuviera) + Condicional (estudiaría). Золотое правило типа 2! 🏆" },
          { q: "Condicional от HACER:", options: ["hacería", "haría", "harería", "hacía"], correct: 1, explain: "Hacer → основа har- + -ía = haría. Неправильная основа — учи! 💪" },
          { q: "«¿Podría ayudarme?» — это:", options: ["приказ", "вежливая просьба", "гипотеза", "мечта"], correct: 1, explain: "Podría = Condicional от poder. Вежливая просьба = could you в английском 🎩" },
        ],
        test: [
          { q: "«Me gustaría» = ?", options: ["Мне нравится", "Хотелось бы", "Мне не нравится", "Нравилось бы тебе?"], correct: 1 },
          { q: "«Saldría» — от глагола:", options: ["saber", "salvar", "salir", "saltar"], correct: 2 },
          { q: "«En tu lugar, yo...» вводит:", options: ["факт", "вопрос", "гипотетический совет", "приказ"], correct: 2 },
          { q: "«Si fuera rico» — fuera от:", options: ["ir", "ser", "ir или ser", "estar"], correct: 2 },
          { q: "Вежливый эквивалент «quiero»:", options: ["querría", "quería", "querré", "quiero más"], correct: 0 },
        ],
      },
      {
        title: "🗣️ Estilo indirecto — Косвенная речь",
        theory: `*Косвенная речь* 📢

Прямая: María dijo: «Estoy cansada.»
Косвенная: María dijo que *estaba* cansada.

*Трансформация времён (глагол в прошедшем):*
Presente → Imperfecto
«Vivo aquí» → dijo que *vivía* allí

Futuro → Condicional
«Vendré» → dijo que *vendría*

Indefinido → Pluscuamperfecto
«Llegué» → dijo que *había llegado*

Imperativo → que + Subjuntivo Imperfecto
«Ven» → me dijo que *fuera*

*Трансформация наречий:*
aquí → allí 🗺️
ahora → entonces
hoy → ese día
mañana → al día siguiente
ayer → el día anterior

*Verbs introductores:*
decir que / preguntar si / afirmar que / pedir que

😂 Испанские новости — один большой estilo indirecto. «El presidente afirmó que...» — теперь ты понимаешь телевизор! 📺`,
        exercises: [
          { q: "«Estoy cansado» → dijo que...", options: ["está cansado", "estará cansado", "estaba cansado", "esté cansado"], correct: 2, explain: "Presente (estoy) → Imperfecto (estaba) в косвенной речи. Базовое правило! 📚" },
          { q: "«Hoy» в косвенной речи становится:", options: ["ahora", "ese día", "entonces", "al día siguiente"], correct: 1, explain: "Hoy → ese día. Временные маркеры тоже смещаются! 📅" },
          { q: "«Ven» (приказ) → me dijo que...", options: ["vengas", "vinieras", "vendrías", "vienes"], correct: 1, explain: "Imperativo → que + Imperfecto Subjuntivo. Me dijo que fuera/vinieras ✅" },
        ],
        test: [
          { q: "«Vendré» → dijo que...", options: ["vendrá", "vendría", "venga", "vino"], correct: 1 },
          { q: "«Aquí» в косвенной речи:", options: ["aquí", "allí", "acá", "ahí"], correct: 1 },
          { q: "«Preguntar si» для:", options: ["утверждений", "закрытых вопросов", "приказов", "пожеланий"], correct: 1 },
          { q: "«Ha llegado» → dijo que...", options: ["llegó", "llegaba", "había llegado", "llegaría"], correct: 2 },
          { q: "«Ayer» → al día...", options: ["siguiente", "anterior", "pasado", "presente"], correct: 1 },
        ],
      },
      {
        title: "📝 Argumentación — Искусство убеждать",
        theory: `*Аргументированная речь* 🎤

*Введение тезиса:*
El tema que vamos a tratar es... — Тема, которую мы рассмотрим...
Quisiera plantear la cuestión de... — Хотел бы поднять вопрос...
En este texto voy a analizar... — Я проанализирую...

*Аргументы «за»:*
Cabe destacar que... — Стоит подчеркнуть...
Es innegable que... — Неоспоримо, что...
Los datos muestran que... — Данные показывают...
No hay que olvidar que... — Нельзя забывать...

*Контраргументы:*
No obstante... — Тем не менее...
Por el contrario... — Напротив...
Si bien es cierto que..., también lo es que... — Хотя верно, что..., также верно...

*Заключение:*
En conclusión / En definitiva — В заключение
Todo ello nos lleva a concluir que... — Всё ведёт к выводу...

😂 Испанские политические дебаты — все говорят одновременно, перебивают, кричат. Ведущий бессилен. Страна воспринимает это как норму. Аргументация — национальный спорт! 🏆`,
        exercises: [
          { q: "«Es innegable que» = ?", options: ["невозможно, что", "неоспоримо, что", "невероятно, что", "непонятно, что"], correct: 1, explain: "Innegable = неоспоримый (negar = отрицать + in- = не). Сильный риторический приём! 💪" },
          { q: "«En conclusión» использую для:", options: ["введения", "аргументов", "заключения", "примеров"], correct: 2, explain: "En conclusión = в заключение. Синонимы: En definitiva, Para concluir 🎯" },
          { q: "«Cabe destacar que» = ?", options: ["Стоит отметить", "Напротив", "Несмотря на", "Кроме того"], correct: 0, explain: "Cabe destacar = стоит выделить/отметить. Уместно + подчеркнуть = академический стиль! 🎓" },
        ],
        test: [
          { q: "«Por el contrario» = ?", options: ["Кроме того", "Напротив", "Потому что", "Например"], correct: 1 },
          { q: "«Los datos muestran que» вводит:", options: ["вывод", "важный факт", "контраргумент", "вопрос"], correct: 1 },
          { q: "«No obstante» = ?", options: ["Тем не менее", "Потому что", "Например", "Кроме того"], correct: 0 },
          { q: "«Si bien es cierto que A...» означает:", options: ["отрицание A", "признание A + добавление B", "сравнение A и B", "простое A"], correct: 1 },
          { q: "«Quisiera plantear la cuestión» используется в:", options: ["заключении", "введении", "контраргументе", "примере"], correct: 1 },
        ],
      },
      {
        title: "🏛️ Política española — Политика Испании",
        theory: `*Политическая система Испании* 👑

*la monarquía parlamentaria* — парламентская монархия
*el Rey Felipe VI* — Король Фелипе VI
*el Congreso de los Diputados* — нижняя палата парламента
*el Senado* — Сенат (верхняя палата)
*el presidente del Gobierno* — председатель правительства

*Партии:*
🔴 PSOE — Partido Socialista Obrero Español (левые)
🔵 PP — Partido Popular (правые)
🟢 Sumar/Podemos — левее левых
🟡 Ciudadanos — либеральный центр
⚫ Vox — ультраправые

*Ключевые темы:*
*la Constitución de 1978* — Конституция
*la Transición* — переход от диктатуры к демократии
*el independentismo catalán* — каталонский сепаратизм
*la corrupción* — коррупция (вечная тема!)
*la vivienda* — жилищный кризис

😂 Испания — конституционная монархия. Но монархию ВОССТАНОВИЛ Франко, который сам же её отменил в 1931-м! История как сериал — не оторваться 📺`,
        exercises: [
          { q: "«La Transición» — это:", options: ["переход к евро", "переход от диктатуры к демократии", "вступление в ЕС", "реформа 2000-х"], correct: 1, explain: "La Transición española (1975-1982) = мирный переход от Франко к демократии. Образцовый для мира! 🕊️" },
          { q: "PSOE — партия:", options: ["ультраправая", "левоцентристская", "либеральная", "сепаратистская"], correct: 1, explain: "PSOE = Partido Socialista Obrero Español. Левоцентристы, основана в 1879! 🔴" },
          { q: "«La vivienda» = социальная проблема о:", options: ["еде", "здоровье", "жилье", "образовании"], correct: 2, explain: "La vivienda = жилье. Кризис аренды — острейшая проблема Испании 2020-х 🏠" },
        ],
        test: [
          { q: "Президент Правительства Испании =", options: ["Король", "Премьер-министр", "Президент страны", "Мэр Мадрида"], correct: 1 },
          { q: "«La corrupción» = ?", options: ["Коррупция", "Конкуренция", "Конституция", "Конфедерация"], correct: 0 },
          { q: "Испания — это:", options: ["президентская республика", "федерация", "парламентская монархия", "конфедерация"], correct: 2 },
          { q: "«El independentismo catalán» — движение за:", options: ["объединение с Францией", "независимость от Испании", "вступление в НАТО", "слияние со страной Басков"], correct: 1 },
          { q: "«La Constitución de 1978» принята после:", options: ["Первой мировой", "Второй мировой", "смерти Франко", "вступления в ЕС"], correct: 2 },
        ],
      },
    ],
  },

  C1: {
    emoji: "💫",
    label: "C1 — Maestro",
    topics: [
      {
        title: "🎭 Modismos — Идиомы как местный",
        theory: `*Испанские идиомы — топ-20* 🌶️

🎯 *Matar dos pájaros de un tiro* — убить двух зайцев
🌟 *No hay mal que por bien no venga* — нет худа без добра
🐦 *Más vale pájaro en mano que ciento volando* — лучше синица в руке
🌧️ *Más vale tarde que nunca* — лучше поздно, чем никогда
👄 *En boca cerrada no entran moscas* — молчание золото
💪 *Querer es poder* — кто хочет, тот добьётся
☁️ *Estar en las nubes* — витать в облаках
💸 *Costar un ojo de la cara* — стоить целое состояние
✂️ *Tomar el pelo* — дурачить кого-то
🎭 *Hacer de tripas corazón* — взять себя в руки (из кишок сердце 😂)
⚡ *No hay dos sin tres* — Бог троицу любит
🦁 *El que mucho abarca, poco aprieta* — За двумя зайцами...

😂 «Costar un ojo de la cara» = стоить глаз с лица = очень дорого. Испанцы буквально теряют органы от цен! Испанские образы: тело, природа, животные — источник всего!`,
        exercises: [
          { q: "«Matar dos pájaros de un tiro» = ?", options: ["охотиться", "убить двух зайцев", "сделать быстро", "решить силой"], correct: 1, explain: "Убить двух птиц одним выстрелом = убить двух зайцев. Универсальная идиома! 🎯" },
          { q: "«Estar en las nubes» = ?", options: ["быть богатым", "путешествовать", "витать в облаках", "быть счастливым"], correct: 2, explain: "En las nubes = в облаках = рассеянный/мечтательный. Он снова витает! ☁️" },
          { q: "«Tomar el pelo» = ?", options: ["стричься", "дурачить кого-то", "причёсываться", "подражать"], correct: 1, explain: "Буквально «брать за волосы» = дурачить. ¿Me estás tomando el pelo? 😄" },
        ],
        test: [
          { q: "«En boca cerrada no entran moscas» = ?", options: ["Закрой холодильник", "Молчание золото", "Ешь с закрытым ртом", "Мухи опасны"], correct: 1 },
          { q: "«Costar un ojo de la cara» = ?", options: ["Больно смотреть", "Очень дорого", "Красиво выглядеть", "Потерять зрение"], correct: 1 },
          { q: "«Querer es poder» = ?", options: ["Хотеть власти", "Кто хочет, тот добьётся", "Власть хочет", "Мочь желать"], correct: 1 },
          { q: "«Hacer de tripas corazón» = ?", options: ["Приготовить блюдо", "Взять себя в руки", "Быть смелым", "Страдать"], correct: 1 },
          { q: "«Más vale tarde que nunca» = ?", options: ["Лучше никогда", "Лучше поздно, чем никогда", "Торопись медленно", "Время — деньги"], correct: 1 },
        ],
      },
      {
        title: "📺 Medios y comunicación — СМИ и общение",
        theory: `*Медиа и коммуникация* 📱

*Tipos de medios:*
la prensa escrita — печатная пресса 📰
la televisión — телевидение
la radio — радио
los medios digitales — цифровые СМИ
las redes sociales — социальные сети
el pódcast — подкаст 🎙️

*Лексика журналистики:*
el titular — заголовок
la portada — первая полоса / обложка
el reportaje — репортаж
la entrevista — интервью
el editorial — редакционная статья
la fake news — фейк-ньюс (да, они тоже говорят так 😂)
la desinformación — дезинформация
el algoritmo — алгоритм

*Важные конструкции:*
Según fuentes... — По данным источников...
Se informa que... — Сообщается, что...
Fuentes cercanas afirman... — Близкие источники утверждают...
Cabe señalar que... — Стоит отметить, что...

😂 Испанцы используют WhatsApp голосовые по 5 минут вместо текста. Навык понимать быстрый испанский на слух — буквально вопрос выживания!`,
        exercises: [
          { q: "«El titular» = ?", options: ["Читатель", "Заголовок", "Редактор", "Репортёр"], correct: 1, explain: "Titular = заголовок статьи. Los titulares = главные новости 📰" },
          { q: "«La desinformación» = ?", options: ["Информация", "Дезинформация", "Секретная информация", "Реклама"], correct: 1, explain: "Desinformación = dis- (обратное) + información. Дезинформация = фейк намеренный 🚫" },
          { q: "«Según fuentes» использую для:", options: ["выражения мнения", "ссылки на источники", "вывода", "вопроса"], correct: 1, explain: "Según = согласно/по данным. Журналистская ссылка на источник 📡" },
        ],
        test: [
          { q: "«La portada» = ?", options: ["Реклама", "Первая полоса/обложка", "Комментарий", "Заголовок"], correct: 1 },
          { q: "«Se informa que» используется для:", options: ["вопросов", "сообщений (пассив)", "команд", "пожеланий"], correct: 1 },
          { q: "«El pódcast» — это:", options: ["радиостанция", "аудиопрограмма онлайн", "телешоу", "газета"], correct: 1 },
          { q: "«Fuentes cercanas afirman» = ?", options: ["Я утверждаю", "Близкие источники утверждают", "Источник близко", "Утверждение верно"], correct: 1 },
          { q: "«Cabe señalar que» = ?", options: ["Стоит отметить", "Напротив", "В заключение", "Например"], correct: 0 },
        ],
      },
      {
        title: "🎨 Literatura y retórica — Литература и риторика",
        theory: `*Стилистические приёмы C1* ✍️

*Риторические фигуры:*
*la ironía* — ирония: говорить противоположное
*la hipérbole* — гипербола: «Te lo he dicho mil veces»
*la metáfora* — метафора: «El tiempo es oro»
*la metonimia* — метонимия: заменить целое частью
*el eufemismo* — эвфемизм: «Pasó a mejor vida» (умер)
*la perífrasis* — перифраза: «El rey de los animales» = лев
*la anáfora* — анафора: повторение в начале фраз

*Великие авторы:*
📖 Miguel de Cervantes — «Дон Кихот» (1605)
🎭 Federico García Lorca — поэт, расстрелян в 1936
🪄 Gabriel García Márquez — «Сто лет одиночества»
🧩 Jorge Luis Borges — лабиринты и философия

*Регистры речи:*
registro formal — официальный
registro coloquial — разговорный
registro culto — высокий стиль
registro vulgar — вульгарный

😂 «Дон Кихот» — самый переводимый роман мира после Библии. «Quijotesco» (донкихотский) вошло во все языки. Мельницы актуальны!`,
        exercises: [
          { q: "«Te lo he dicho mil veces» — это:", options: ["метафора", "ирония", "гипербола", "эвфемизм"], correct: 2, explain: "Тысячу раз (не буквально) = гипербола! Преувеличение для эффекта 📢" },
          { q: "«Pasó a mejor vida» (вместо «умер») — это:", options: ["метафора", "эвфемизм", "ирония", "анафора"], correct: 1, explain: "Эвфемизм = смягчение неприятного. «Перешёл к лучшей жизни» = умер (нежно) 🕊️" },
          { q: "«El rey de los animales» вместо «el león» — это:", options: ["метафора", "ирония", "перифраза", "метонимия"], correct: 2, explain: "Perífrasis = описание вместо слова. Король зверей = лев. Литературный приём 🦁" },
        ],
        test: [
          { q: "«El tiempo es oro» — это:", options: ["гипербола", "метафора", "ирония", "эвфемизм"], correct: 1 },
          { q: "García Márquez — автор:", options: ["Дон Кихота", "Ста лет одиночества", "Поэм фламенко", "Лабиринтов"], correct: 1 },
          { q: "Registro formal используется в:", options: ["дружеских чатах", "официальных документах", "сленге", "мемах"], correct: 1 },
          { q: "«La anáfora» — это:", options: ["замена целого частью", "повторение в начале фраз", "преувеличение", "смягчение"], correct: 1 },
          { q: "Cervantes — автор:", options: ["Cien años de soledad", "Don Quijote", "Laberintos", "Bodas de sangre"], correct: 1 },
        ],
      },
      {
        title: "🧠 Mentalidad española — Менталитет",
        theory: `*Как думают испанцы* 🇪🇸

*La sobremesa* ☕ — время за столом ПОСЛЕ еды. Разговор, кофе, смех — священно. Уйти сразу = невежливо.

*El cachondeo* 😂 — беззлобное веселье и подшучивание. «Estar de cachondeo» = дурачиться. Не воспринимать всё буквально.

*La queja* 😤 — жалоба как способ коммуникации. «¡Qué calor!», «¡Qué hambre!» — это разговор, не жалобы.

*El orgullo regional* 🏴 — региональная гордость. НИКОГДА не скажи каталонцу что Барселона — «испанский город».

*La familia* 👨‍👩‍👧‍👦 — основа всего. Воскресный обед у бабушки — национальная религия.

*El presentismo* ⏰ — жизнь в настоящем. «Ya veremos» (посмотрим) = национальная философия.

*Mañana* 🌅 — не только «завтра», но и «потом», «когда-нибудь», «не сейчас».

😂 «La hora española» = опоздание на 15-30 минут — норма. На вечеринку прийти вовремя = прийти слишком рано. Адаптируйся или страдай!`,
        exercises: [
          { q: "«La sobremesa» = ?", options: ["скатерть", "время после еды за разговором", "десерт", "обеденный перерыв"], correct: 1, explain: "La sobremesa — священная испанская традиция. Уйти сразу = нарушить правила! ☕" },
          { q: "«Ya veremos» в культурном контексте:", options: ["строго «посмотрим»", "«потом/неопределённо» — философия откладывания", "«никогда»", "«завтра точно»"], correct: 1, explain: "Ya veremos = может быть, посмотрим, неизвестно. Другой ритм жизни, не безответственность! 🌊" },
          { q: "«El orgullo regional» особенно силён в:", options: ["Мадриде", "Каталонии и Стране Басков", "Кастилии", "везде одинаково"], correct: 1, explain: "Каталония и Страна Басков — свой язык, культура, история. Очень серьёзно! 🏴" },
        ],
        test: [
          { q: "«El cachondeo» = ?", options: ["Серьёзность", "Беззлобное веселье", "Злой юмор", "Фестиваль"], correct: 1 },
          { q: "«La hora española» означает:", options: ["испанский часовой пояс", "опоздание как норма", "время сиесты", "время ужина"], correct: 1 },
          { q: "«Mañana» в культуре = ?", options: ["строго завтра", "утро", "потом/когда-нибудь", "никогда"], correct: 2 },
          { q: "Воскресный семейный обед в Испании:", options: ["редкость", "центральная культурная традиция", "устаревший обычай", "только в деревне"], correct: 1 },
          { q: "«La queja» в Испании — это:", options: ["официальная жалоба", "способ общения и коммуникации", "политический протест", "судебный иск"], correct: 1 },
        ],
      },
    ],
  },
};

// ─── SOFIA SYSTEM PROMPT ─────────────────────────────────────
const SOFIA_PROMPT = `Ты — Sofía, харизматичный ИИ-репетитор испанского языка 🇪🇸

ЛИЧНОСТЬ:
- Умная, ироничная, дружелюбная. Никакого академизма!
- Объясняешь сложные правила «на пальцах» через живые примеры
- Используешь юмор и эмодзи умеренно
- Короткие абзацы, легко читается
- Если вопрос глупый — отвечаешь с лёгкой подколкой, добродушно

СТИЛЬ:
- Максимум 200 слов
- Всегда пример на испанском + перевод
- Объясняешь ПОЧЕМУ, а не просто «это правило»
- Отвечаешь на РУССКОМ языке

ЗАПРЕЩЕНО:
- Длинные академические объяснения
- Таблицы без необходимости
- «Конечно!» и «Отличный вопрос!»

Отвечай ТОЛЬКО на вопросы об испанском языке. Начинай сразу с сути!`;

// ─── KEYBOARDS ───────────────────────────────────────────────
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🌱 A1 — Bebé Español", "🌿 A2 — Despegando"],
      ["🌊 B1 — Intermedio", "🔥 B2 — Avanzado"],
      ["💫 C1 — Maestro"],
      ["🤖 Спросить Sofía", "📊 Мой прогресс"],
    ],
    resize_keyboard: true,
  },
};

function levelMenu(levelKey) {
  const level = COURSE[levelKey];
  const topicButtons = level.topics.map((t, i) => [`${i + 1}. ${t.title}`]);
  topicButtons.push(["⬅️ Главное меню"]);
  return {
    reply_markup: {
      keyboard: topicButtons,
      resize_keyboard: true,
    },
  };
}

function lessonMenu() {
  return {
    reply_markup: {
      keyboard: [
        ["📖 Теория", "💪 Упражнения"],
        ["📝 Тест", "⬅️ Назад к урокам"],
      ],
      resize_keyboard: true,
    },
  };
}

function yesNoMenu() {
  return {
    reply_markup: {
      keyboard: [["✅ Да, понял!", "❓ Не совсем..."], ["⬅️ Назад к урокам"]],
      resize_keyboard: true,
    },
  };
}

function exerciseMenu(options) {
  const letters = ["A", "B", "C", "D"];
  const buttons = options.map((opt, i) => [`${letters[i]}) ${opt}`]);
  buttons.push(["⬅️ Назад к урокам"]);
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
    },
  };
}

// ─── HELPERS ─────────────────────────────────────────────────
function getLessonKey(levelKey, topicIdx) {
  return `${levelKey}_${topicIdx}`;
}

function isLessonFree(levelKey, topicIdx) {
  // First lesson of A1 is always free
  return levelKey === "A1" && topicIdx === 0;
}

function hasAccess(user, levelKey, topicIdx) {
  if (user.fullCourse) return true;
  if (isLessonFree(levelKey, topicIdx)) return true;
  return user.paid.includes(getLessonKey(levelKey, topicIdx));
}

function resetAIIfNewDay(user) {
  const today = new Date().toDateString();
  if (user.aiDate !== today) {
    user.aiCount = 0;
    user.aiDate = today;
  }
}

function getScore(correct, total) {
  const pct = Math.round((correct / total) * 100);
  let grade, emoji;
  if (pct >= 90) { grade = "⭐⭐⭐ Отлично!"; emoji = "🏆"; }
  else if (pct >= 70) { grade = "⭐⭐ Хорошо!"; emoji = "👍"; }
  else if (pct >= 50) { grade = "⭐ Неплохо!"; emoji = "😊"; }
  else { grade = "📚 Нужна практика!"; emoji = "💪"; }
  return { pct, grade, emoji };
}

// ─── SEND INVOICE ─────────────────────────────────────────────
async function sendLessonInvoice(chatId, levelKey, topicIdx) {
  const topic = COURSE[levelKey].topics[topicIdx];
  await bot.sendInvoice(
    chatId,
    `🔓 Урок: ${topic.title}`,
    `Открой урок «${topic.title}» и учи испанский с удовольствием! 🇪🇸`,
    `lesson_${levelKey}_${topicIdx}`,
    PAYMENT_TOKEN,
    "EUR",
    [{ label: "Урок", amount: PRICE_LESSON }],
    {
      photo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/320px-Flag_of_Spain.svg.png",
      need_name: false,
      need_email: false,
    }
  );
}



bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `🆘 *Помощь по боту*\n\n📚 *Как учиться:*\n1. Выбери уровень\n2. Выбери тему\n3. Читай теорию → делай упражнения → проходи тест\n4. Получи оценку и разбор ошибок\n\n🤖 *Sofía:* нажми «Спросить Sofía» и задай вопрос об испанском. 10 вопросов в день бесплатно!\n\n💳 *Оплата:* 1€ за урок / 10€ за весь курс через Telegram Payments\n\n📊 *Прогресс:* команда /progress\n🔄 *Сбросить:* /reset\n\n¡Buena suerte! 🍀`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/progress/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const total = Object.values(COURSE).reduce((a, l) => a + l.topics.length, 0);
  const unlocked = user.fullCourse ? total : user.paid.length + 1;
  await bot.sendMessage(
    chatId,
    `📊 *Твой прогресс*\n\n🔓 Разблокировано уроков: ${unlocked}/${total}\n💳 Полный курс: ${user.fullCourse ? "✅ Куплен" : "❌ Не куплен"}\n🤖 Вопросов Sofía сегодня: ${user.aiCount}/10\n\nПродолжай — ты молодец! 💪`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = null;
  getUser(chatId);
  await bot.sendMessage(chatId, "🔄 Прогресс сброшен! Начинаем с нуля! ¡Vamos! 🚀", mainMenu);
});

// ─── PRE-CHECKOUT ──────────────────────────────────────────────
bot.on("pre_checkout_query", (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

// ─── SUCCESSFUL PAYMENT ───────────────────────────────────────
bot.on("successful_payment", async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const payload = msg.successful_payment.invoice_payload;

  if (payload === "full_course") {
    user.fullCourse = true;
    await bot.sendMessage(
      chatId,
      `🎉🎊 ¡INCREÍBLE! Ты купил ВЕСЬ КУРС!\n\nТеперь все 20 уроков твои — A1 до C1! 🇪🇸🏆\n\nSofía уже ждёт тебя. ¡Vamos a aprender! 🚀`,
      mainMenu
    );
  } else if (payload.startsWith("lesson_")) {
    const [, levelKey, topicIdxStr] = payload.split("_");
    const topicIdx = parseInt(topicIdxStr);
    const key = getLessonKey(levelKey, topicIdx);
    if (!user.paid.includes(key)) user.paid.push(key);
    const topic = COURSE[levelKey].topics[topicIdx];
    await bot.sendMessage(
      chatId,
      `✅ Оплата прошла! Урок «${topic.title}» разблокирован! 🎉\n\nIda y vuelta к уровню и начинай! 🚀`,
      mainMenu
    );
  }
});

// ─── MESSAGE HANDLER ──────────────────────────────────────────
bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const user = getUser(chatId);

  // Skip commands
  if (text.startsWith("/")) return;

  // ── Sofia AI mode ──
  if (user.awaitingAI) {
    user.awaitingAI = false;
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(chatId, "😴 Sofía устала! 10 вопросов в день — лимит. Завтра я снова в строю! ¡Hasta mañana! 🌙", mainMenu);
      return;
    }
    await bot.sendMessage(chatId, "🤔 Sofía думает...");
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: SOFIA_PROMPT,
        messages: [{ role: "user", content: text }],
      });
      user.aiCount++;
      const answer = response.content.map(b => b.text || "").join("");
      await bot.sendMessage(
        chatId,
        `🤖 *Sofía:*\n\n${answer}\n\n_Осталось вопросов сегодня: ${10 - user.aiCount}_`,
        { parse_mode: "Markdown", ...mainMenu }
      );
    } catch {
      await bot.sendMessage(chatId, "😵 Sofía временно перегрелась! Попробуй через минуту 🔥", mainMenu);
    }
    return;
  }

  // ── Exercise answer ──
  if (user.currentStep === 1 && user.currentLevel && user.currentTopic !== null) {
    const level = COURSE[user.currentLevel];
    const topic = level.topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const ex = topic.exercises[user.exerciseIndex];
      const correct = idx === ex.correct;
      const emoji = correct ? "✅" : "❌";
      const msg2 = correct
        ? `${emoji} *Правильно!* 🎉\n\n💡 ${ex.explain}`
        : `${emoji} *Неверно!* Правильный ответ: *${letters[ex.correct]}) ${ex.options[ex.correct]}*\n\n💡 ${ex.explain}`;

      await bot.sendMessage(chatId, msg2, { parse_mode: "Markdown" });

      user.exerciseIndex++;
      if (user.exerciseIndex < topic.exercises.length) {
        const next = topic.exercises[user.exerciseIndex];
        await bot.sendMessage(
          chatId,
          `*Вопрос ${user.exerciseIndex + 1}/${topic.exercises.length}*\n\n${next.q}`,
          { parse_mode: "Markdown", ...exerciseMenu(next.options) }
        );
      } else {
        user.currentStep = 0;
        user.exerciseIndex = 0;
        await bot.sendMessage(
          chatId,
          `🏁 Упражнения завершены! Молодец! 💪\n\nТеперь попробуй тест или повтори теорию!`,
          lessonMenu()
        );
      }
      return;
    }
  }

  // ── Test answer ──
  if (user.currentStep === 2 && user.currentLevel && user.currentTopic !== null) {
    const level = COURSE[user.currentLevel];
    const topic = level.topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const q = topic.test[user.testIndex];
      const correct = idx === q.correct;
      user.testAnswers.push({ q: q.q, userIdx: idx, correctIdx: q.correct, options: q.options, ok: correct });
      if (correct) user.testScore++;
      user.testIndex++;

      if (user.testIndex < topic.test.length) {
        const next = topic.test[user.testIndex];
        await bot.sendMessage(
          chatId,
          `${correct ? "✅" : "❌"} ${correct ? "Верно!" : "Неверно!"}\n\n*Вопрос ${user.testIndex + 1}/${topic.test.length}*\n\n${next.q}`,
          { parse_mode: "Markdown", ...exerciseMenu(next.options) }
        );
      } else {
        // Show results
        const { pct, grade, emoji } = getScore(user.testScore, topic.test.length);
        let wrongList = "";
        user.testAnswers.filter(a => !a.ok).forEach(a => {
          wrongList += `\n❌ *${a.q}*\n   Твой: ${a.options[a.userIdx]}\n   ✅ Правильно: ${a.options[a.correctIdx]}\n`;
        });

        const resultMsg = `${emoji} *Результаты теста!*\n\n🎯 Результат: *${user.testScore}/${topic.test.length}* (${pct}%)\n${grade}\n\n${wrongList ? `*Работа над ошибками:*${wrongList}` : "🏆 Все ответы верны! Ты звезда!"}\n\nХочешь повторить урок или идём дальше?`;

        user.currentStep = 0;
        user.testIndex = 0;
        user.testScore = 0;
        user.testAnswers = [];

        await bot.sendMessage(chatId, resultMsg, {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [
              ["🔄 Повторить урок"],
              ["📖 Теория", "💪 Упражнения"],
              ["⬅️ Назад к урокам"],
            ],
            resize_keyboard: true,
          },
        });
      }
      return;
    }
  }

  // ── Navigation ──

  if (text === "⬅️ Главное меню" || text === "/menu") {
    user.currentLevel = null;
    user.currentTopic = null;
    user.currentStep = 0;
    await bot.sendMessage(chatId, "🏠 Главное меню. Выбирай уровень! 🇪🇸", mainMenu);
    return;
  }

  if (text === "⬅️ Назад к урокам" || text === "⬅️ Назад") {
    if (user.currentLevel) {
      user.currentTopic = null;
      user.currentStep = 0;
      await bot.sendMessage(
        chatId,
        `📚 Выбери тему в ${COURSE[user.currentLevel].label}:`,
        levelMenu(user.currentLevel)
      );
    } else {
      await bot.sendMessage(chatId, "🏠 Главное меню:", mainMenu);
    }
    return;
  }

  // ── Level selection ──
  const levelMap = {
    "🌱 A1 — Bebé Español": "A1",
    "🌿 A2 — Despegando": "A2",
    "🌊 B1 — Intermedio": "B1",
    "🔥 B2 — Avanzado": "B2",
    "💫 C1 — Maestro": "C1",
  };

  if (levelMap[text]) {
    user.currentLevel = levelMap[text];
    user.currentTopic = null;
    await bot.sendMessage(
      chatId,
      `${COURSE[user.currentLevel].emoji} *${COURSE[user.currentLevel].label}*\n\nВыбери тему для изучения:`,
      { parse_mode: "Markdown", ...levelMenu(user.currentLevel) }
    );
    return;
  }

  // ── Topic selection ──
  if (user.currentLevel && user.currentTopic === null) {
    const level = COURSE[user.currentLevel];
    const topicIdx = level.topics.findIndex((t, i) => text.startsWith(`${i + 1}.`));
    if (topicIdx !== -1) {
      if (!hasAccess(user, user.currentLevel, topicIdx)) {
        await bot.sendMessage(
          chatId,
          `🔒 *Этот урок платный!*\n\n💡 Варианты:\n• 1€ — открыть только этот урок\n• 10€ — весь курс A1–C1 навсегда! 🎓`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [["💳 1€ — Открыть урок", "🎓 10€ — Весь курс"], ["⬅️ Назад к урокам"]],
              resize_keyboard: true,
            },
          }
        );
        user._pendingLevel = user.currentLevel;
        user._pendingTopic = topicIdx;
        return;
      }
      user.currentTopic = topicIdx;
      user.currentStep = 0;
      user.exerciseIndex = 0;
      user.testIndex = 0;
      user.testScore = 0;
      user.testAnswers = [];
      const topic = level.topics[topicIdx];
      await bot.sendMessage(
        chatId,
        `📚 *${topic.title}*\n\nВыбери что хочешь делать:`,
        { parse_mode: "Markdown", ...lessonMenu() }
      );
      return;
    }
  }

  // ── Payment shortcuts ──
  if (text === "💳 1€ — Открыть урок") {
    if (user._pendingLevel && user._pendingTopic !== undefined) {
      await sendLessonInvoice(chatId, user._pendingLevel, user._pendingTopic);
    } else {
      await bot.sendMessage(chatId, "Сначала выбери урок, который хочешь открыть! 📚", mainMenu);
    }
    return;
  }

  if (text === "🎓 10€ — Весь курс") {
    await sendCourseInvoice(chatId);
    return;
  }

  // ── Lesson actions ──
  if (text === "📖 Теория") {
    if (!user.currentLevel || user.currentTopic === null) {
      await bot.sendMessage(chatId, "Сначала выбери урок! 📚", mainMenu);
      return;
    }
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    user.currentStep = 0;
    await bot.sendMessage(chatId, topic.theory, { parse_mode: "Markdown", ...yesNoMenu() });
    return;
  }

  if (text === "✅ Да, понял!" || text === "💪 Упражнения") {
    if (!user.currentLevel || user.currentTopic === null) {
      await bot.sendMessage(chatId, "Сначала выбери урок! 📚", mainMenu);
      return;
    }
    user.currentStep = 1;
    user.exerciseIndex = 0;
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const ex = topic.exercises[0];
    await bot.sendMessage(
      chatId,
      `💪 *Упражнения!* ${topic.exercises.length} вопроса — поехали!\n\n*Вопрос 1/${topic.exercises.length}*\n\n${ex.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(ex.options) }
    );
    return;
  }

  if (text === "❓ Не совсем...") {
    if (!user.currentLevel || user.currentTopic === null) return;
    user.awaitingAI = true;
    await bot.sendMessage(
      chatId,
      "🤖 Sofía на связи! Что непонятно? Пиши свой вопрос — объясню на пальцах! 😄",
      { reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  if (text === "📝 Тест") {
    if (!user.currentLevel || user.currentTopic === null) {
      await bot.sendMessage(chatId, "Сначала выбери урок! 📚", mainMenu);
      return;
    }
    user.currentStep = 2;
    user.testIndex = 0;
    user.testScore = 0;
    user.testAnswers = [];
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const q = topic.test[0];
    await bot.sendMessage(
      chatId,
      `📝 *ТЕСТ: ${topic.title}*\n${topic.test.length} вопросов — удачи! 🍀\n\n*Вопрос 1/${topic.test.length}*\n\n${q.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(q.options) }
    );
    return;
  }

  if (text === "🔄 Повторить урок") {
    if (!user.currentLevel || user.currentTopic === null) return;
    user.currentStep = 0;
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    await bot.sendMessage(
      chatId,
      `🔄 *Повторяем: ${topic.title}*\n\nВыбери с чего начать:`,
      { parse_mode: "Markdown", ...lessonMenu() }
    );
    return;
  }

  // ── Sofia button ──
  if (text === "🤖 Спросить Sofía") {
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(chatId, "😴 Sofía отдыхает! Лимит 10 вопросов в день исчерпан. Приходи завтра! 🌙", mainMenu);
      return;
    }
    user.awaitingAI = true;
    await bot.sendMessage(
      chatId,
      `🤖 ¡Hola! Я Sofía — твой личный репетитор испанского! 🇪🇸\n\nОсталось вопросов сегодня: *${10 - user.aiCount}*\n\nСпрашивай что угодно об испанском — грамматику, слова, произношение, культуру! 😊`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  // ── Progress button ──
  if (text === "📊 Мой прогресс") {
    const total = Object.values(COURSE).reduce((a, l) => a + l.topics.length, 0);
    const unlocked = user.fullCourse ? total : user.paid.length + 1;
    resetAIIfNewDay(user);
    await bot.sendMessage(
      chatId,
      `📊 *Твой прогресс*\n\n🔓 Уроков разблокировано: ${unlocked}/${total}\n💳 Полный курс: ${user.fullCourse ? "✅ Куплен! 🎉" : "❌ Не куплен"}\n🤖 Вопросов Sofía сегодня: ${user.aiCount}/10\n\n${user.fullCourse ? "🏆 Ты уже владеешь всем курсом — учи!" : "💡 Открой весь курс за 10€ и учи без ограничений!"}`,
      { parse_mode: "Markdown", ...mainMenu }
    );
    return;
  }

  // ── Default ──
  await bot.sendMessage(
    chatId,
    "¿Qué? 🤔 Не понял тебя! Используй кнопки меню или выбери уровень! 👇",
    mainMenu
  );
});

console.log("🇪🇸 Habla Español Bot запущен! ¡Vamos!");
