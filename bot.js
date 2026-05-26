const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ADMIN_ID = 2144577313;

if (!BOT_TOKEN) { console.error("❌ BOT_TOKEN не задан!"); process.exit(1); }
if (!ANTHROPIC_KEY) { console.error("❌ ANTHROPIC_API_KEY не задан!"); process.exit(1); }

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const TRIBUTE_LESSON = "https://web.tribute.tg/p/wB5";
const TRIBUTE_COURSE = "https://web.tribute.tg/p/wB6";
const ADMIN_CONTACT = "@Sofia\\_morena";

const users = {};

function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      paid: [],
      fullCourse: false,
      currentLevel: null,
      currentTopic: null,
      currentStep: 0,
      exerciseIndex: 0,
      testIndex: 0,
      testScore: 0,
      testAnswers: [],
      aiCount: 0,
      aiDate: null,
      awaitingAI: false,
      _pendingLevel: null,
      _pendingTopic: null,
    };
  }
  return users[chatId];
}

const COURSE = {
  A1: {
    emoji: "🌱",
    label: "A1 — Bebé Español",
    topics: [
      {
        title: "👋 Hola, mundo! Знакомство",
        theory: `*Базовые приветствия* 🎉

*Hola* — Привет (в любое время суток!)
*Buenos días* — Доброе утро ☀️
*Buenas tardes* — Добрый день/вечер 🌤
*Buenas noches* — Спокойной ночи 🌙
*¿Cómo te llamas?* — Как тебя зовут?
*Me llamo...* — Меня зовут...
*Mucho gusto* — Очень приятно 🤝
*Encantado/a* — Рад/а познакомиться

🧠 *Лайфхак:* Испанцы говорят «Hola» даже когда берут трубку. Никакого «алло» — только страсть! 🔥

*Глагол LLAMARSE:*
Me llamo — я называюсь
Te llamas — ты называешься
Se llama — он/она называется

😄 «Me llamo» буквально «я называю себя». Какая самооценка!`,
        exercises: [
          { q: "Как сказать «Добрый день»?", options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"], correct: 1, explain: "Tardes = вторая половина дня. Días = утро. Не путай! 😂" },
          { q: "Женщина говорит «Я очень рада». Что скажет?", options: ["Encantado", "Mucho gusto", "Encantada", "Me llamo"], correct: 2, explain: "EncantadA — женский род! Испанский честен насчёт пола 😏" },
          { q: "Заполни: «_____ llamo Sofia»", options: ["Te", "Me", "Se", "Le"], correct: 1, explain: "Me llamo = меня зовут 💁‍♀️" },
        ],
        test: [
          { q: "Как спросить имя?", options: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "¿Cuántos años?"], correct: 1 },
          { q: "«Спокойной ночи»:", options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"], correct: 2 },
          { q: "«Mucho gusto» означает:", options: ["Очень вкусно", "Очень приятно", "Очень много", "Привет"], correct: 1 },
          { q: "Мужчина скажет:", options: ["Encantada", "Encantado", "Encantados", "Encantadas"], correct: 1 },
          { q: "«Me llamo» = ?", options: ["Ты называешься", "Он называется", "Я называюсь", "Мы называемся"], correct: 2 },
        ],
      },
      {
        title: "🌍 ¿De dónde eres? Страны и национальности",
        theory: `*Откуда ты родом?* 🗺

*¿De dónde eres?* — Откуда ты?
*Soy de Rusia* — Я из России
*Soy ruso/rusa* — Я русский/русская

🇪🇸 España → español/española
🇫🇷 Francia → francés/francesa
🇩🇪 Alemania → alemán/alemana
🇲🇽 México → mexicano/mexicana
🇦🇷 Argentina → argentino/argentina

*Глагол SER:*
Yo soy | Tú eres | Él/Ella es
Nosotros somos | Ellos son

⚠️ *Важно:* национальности пишутся с *маленькой* буквы!`,
        exercises: [
          { q: "«Ella _____ de México»", options: ["soy", "eres", "es", "son"], correct: 2, explain: "Ella → es 🚀" },
          { q: "Женщина из Франции скажет:", options: ["Soy francés", "Soy francesa", "Es francesa", "Eres francesa"], correct: 1, explain: "Francesa — женский род 💁‍♀️" },
          { q: "Национальности пишутся...", options: ["С большой буквы", "С маленькой буквы", "Как угодно", "Капсом"], correct: 1, explain: "Soy ruso — не Ruso 😌" },
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
*Es la una* — Час (только для 1!)
*Son las dos* — Два часа
*Son las tres y media* — 3:30
*Son las cuatro menos cuarto* — 3:45

*Дни недели:*
lunes, martes, miércoles, jueves, viernes, sábado, domingo

😂 Испанцы ужинают в 22:00 — Франко перевёл часы под Берлин в 1940-м. Традиция!`,
        exercises: [
          { q: "«3 часа» по-испански:", options: ["Es la tres", "Son las tres", "Son los tres", "Es las tres"], correct: 1, explain: "Son las tres — мн.ч. Только час — es la una ⏰" },
          { q: "«Son las seis y media» = ?", options: ["6:15", "6:30", "6:45", "7:30"], correct: 1, explain: "Media = половина = 30 минут 🎉" },
          { q: "Среда по-испански:", options: ["martes", "jueves", "miércoles", "viernes"], correct: 2, explain: "Miércoles — от планеты Меркурий 🪐" },
        ],
        test: [
          { q: "«¿Qué hora es?» = ?", options: ["Какой день?", "Который час?", "Сколько лет?", "Как дела?"], correct: 1 },
          { q: "Число 15:", options: ["quince", "doce", "trece", "catorce"], correct: 0 },
          { q: "«Es la una» для:", options: ["2 часов", "3 часов", "1 часа", "12 часов"], correct: 2 },
          { q: "Пятница:", options: ["sábado", "viernes", "jueves", "lunes"], correct: 1 },
          { q: "«Без четверти пять»:", options: ["Son las cinco y cuarto", "Son las cinco menos cuarto", "Son las cuatro y media", "Es la cinco"], correct: 1 },
        ],
      },
      {
        title: "🍽️ En el restaurante — В ресторане",
        theory: `*В ресторане* 🍷

*La carta, por favor* — Меню, пожалуйста
*¿Qué recomienda?* — Что посоветуете?
*Quisiera...* — Я бы хотел/а...
*Para mí, ...* — Для меня...
*La cuenta, por favor* — Счёт, пожалуйста

*Еда:*
el agua — вода
el vino tinto/blanco — красное/белое вино
la cerveza — пиво
la paella — паэлья
el jamón — хамон 😄
la tortilla — омлет с картошкой

😂 Jamón ibérico до €300 за ногу. В средневековье вешали в окнах как доказательство религии!`,
        exercises: [
          { q: "Как попросить меню?", options: ["La cuenta, por favor", "La carta, por favor", "El agua, por favor", "La mesa, por favor"], correct: 1, explain: "La carta = меню! La cuenta = счёт 😅" },
          { q: "«Красное вино»:", options: ["vino blanco", "vino rosado", "vino tinto", "vino negro"], correct: 2, explain: "Tinto = красный для вина 🍷" },
          { q: "Tortilla española — это:", options: ["Мексиканская лепёшка", "Омлет с картошкой", "Блин", "Пицца"], correct: 1, explain: "Омлет с картофелем! Не мексиканская лепёшка 🤯" },
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

*Правильные (-AR):*
hablar → hablé, hablaste, habló, hablamos, hablaron

*Правильные (-ER/-IR):*
comer → comí, comiste, comió, comimos, comieron

*Маркеры:*
ayer — вчера
la semana pasada — на прошлой неделе
hace dos días — два дня назад
el año pasado — в прошлом году

*Неправильные:*
ir/ser → fui, fuiste, fue, fuimos, fueron

😂 IR и SER в прошедшем одинаковые! Испанский любит загадки!`,
        exercises: [
          { q: "«Вчера я говорил»:", options: ["Ayer hablo", "Ayer hablé", "Ayer hablaba", "Ayer hablaré"], correct: 1, explain: "Hablé — Indefinido для yo 🎯" },
          { q: "«Она ела пиццу»:", options: ["comía pizza", "come pizza", "comió pizza", "comerá pizza"], correct: 2, explain: "Comió — третье лицо Indefinido 💪" },
          { q: "«Hace dos días» = ?", options: ["Через два дня", "Два дня назад", "Каждые два дня", "Два дня подряд"], correct: 1, explain: "Hace + время = [время] НАЗАД 🕐" },
        ],
        test: [
          { q: "«Fui» — форма глагола:", options: ["saber", "tener", "ir/ser", "hacer"], correct: 2 },
          { q: "«Мы жили в Испании»:", options: ["Vivimos en España", "Vivíamos", "Viviremos", "Vivían"], correct: 0 },
          { q: "Маркер Indefinido:", options: ["siempre", "todos los días", "ayer", "cuando era niño"], correct: 2 },
          { q: "«Ты купил книгу»:", options: ["compras", "comprabas", "compraste", "comprarás"], correct: 2 },
          { q: "«Ellos hablaron» = ?", options: ["говорят", "говорили (завершённо)", "говорили обычно", "будут говорить"], correct: 1 },
        ],
      },
      {
        title: "🌅 Pretérito Imperfecto — Детство и воспоминания",
        theory: `*Незавершённое прошедшее* 😌

*Когда использовать:*
• Привычки в прошлом («я ВСЕГДА делал»)
• Описание фона («была ночь»)
• Возраст («мне было 10 лет»)

*Окончания -AR:* -aba, -abas, -aba, -ábamos, -aban
*Окончания -ER/-IR:* -ía, -ías, -ía, -íamos, -ían

*Маркеры:* siempre, antes, todos los días, de pequeño/a

*Только 3 неправильных:* 🎉
ser → era | ir → iba | ver → veía

😄 comí = поел (раз) | comía = ел (всегда)`,
        exercises: [
          { q: "«Я всегда ел пиццу в детстве»:", options: ["Siempre comí pizza", "Siempre comía pizza", "Siempre comeré pizza", "Siempre como pizza"], correct: 1, explain: "Siempre + привычка = Imperfecto 🍕" },
          { q: "«Era» — форма глагола:", options: ["estar", "tener", "ir", "ser"], correct: 3, explain: "Era — Imperfecto от SER 👦" },
          { q: "Imperfecto НЕ для:", options: ["описания погоды", "единственного завершённого действия", "привычек", "возраста"], correct: 1, explain: "Одно завершённое = Indefinido! 🎯" },
        ],
        test: [
          { q: "«Раньше я жил в Москве»:", options: ["Antes vivía en Moscú", "Antes viví", "Antes vivo", "Antes viviré"], correct: 0 },
          { q: "«Iba» — форма глагола:", options: ["hablar", "ir", "ver", "ser"], correct: 1 },
          { q: "«Мне было 10 лет»:", options: ["Tengo 10 años", "Tuve 10 años", "Tenía 10 años", "Tendré 10 años"], correct: 2 },
          { q: "Маркер Imperfecto:", options: ["ayer", "hace dos días", "siempre", "el año pasado"], correct: 2 },
          { q: "«Todos los días comía» = ?", options: ["Однажды поел", "Ел каждый день", "Буду есть", "Ем сейчас"], correct: 1 },
        ],
      },
      {
        title: "🏥 La salud — Здоровье и у врача",
        theory: `*У врача* 🩺

*Me duele...* — У меня болит... (ед.ч.)
*Me duelen...* — У меня болят... (мн.ч.)
*Tengo fiebre* — Температура 🌡
*Tengo tos* — Кашель
*Me siento mal* — Плохо себя чувствую

*Части тела:*
la cabeza — голова | la garganta — горло
el estómago — живот | la espalda — спина
el brazo — рука | la pierna — нога

*Грамматика DOLER:*
Me duele la cabeza (ед.ч.)
Me duelen las piernas (мн.ч.)

😂 Работает как GUSTAR — субъект после глагола!`,
        exercises: [
          { q: "«У меня болит голова»:", options: ["Me duelen la cabeza", "Me duele la cabeza", "Tengo cabeza", "Me dolor cabeza"], correct: 1, explain: "Duele — ед.ч. 🧠" },
          { q: "«У меня кашель»:", options: ["Tengo tos", "Tengo gripe", "Estoy tos", "Me duele tos"], correct: 0, explain: "Tengo tos 😷" },
          { q: "«Me duelen las piernas» — почему DUELEN?", options: ["Всегда duelen", "Piernas — мн.ч.", "С me всегда duelen", "Ошибка"], correct: 1, explain: "Мн.ч. → duelen 🦵" },
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
*¿Tiene esto en otra talla?* — Другой размер?
*¿Puedo probármelo?* — Можно примерить?
*Me queda bien/mal* — Подходит/не подходит
*Me lo llevo* — Я это возьму 🛒
*¿Aceptan tarjeta?* — Принимаете карту?

*Числа:*
30 treinta, 50 cincuenta, 100 cien, 1000 mil

*Прилагательные:*
caro/a — дорогой | barato/a — дешёвый

😂 Mercadona — национальная религия Испании!`,
        exercises: [
          { q: "Как спросить цену?", options: ["¿Cómo se llama?", "¿Cuánto cuesta?", "¿Dónde está?", "¿Qué es esto?"], correct: 1, explain: "¿Cuánto cuesta? 💰" },
          { q: "«Me lo llevo» = ?", options: ["Я смотрю", "Я примеряю", "Я это возьму", "Я ухожу"], correct: 2, explain: "Буквально «я это несу с собой» 🛍️" },
          { q: "«Me queda mal» = ?", options: ["Мне нравится", "Не подходит", "Дорого", "Мне плохо"], correct: 1, explain: "Quedar = подходить об одежде 👗" },
        ],
        test: [
          { q: "«Esto es barato» = ?", options: ["Дорого", "Дёшево", "Красиво", "Новое"], correct: 1 },
          { q: "«¿Puedo probármelo?» = просьба:", options: ["посмотреть", "примерить", "купить", "вернуть"], correct: 1 },
          { q: "«Efectivo» = ?", options: ["Карта", "Наличные", "Чек", "Скидка"], correct: 1 },
          { q: "100 по-испански:", options: ["ciento", "cien", "cientos", "cent"], correct: 1 },
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

*Правило WEIRDO:*
W — Wishes: querer, desear
E — Emotion: alegrarse, tener miedo
I — Impersonal: es importante que
R — Recommendation: recomendar
D — Doubt/Denial: no creer, dudar
O — Ojalá

*Формы (-AR):* hable, hables, hable, hablemos, hablen
*Формы (-ER/-IR):* coma, comas, coma, comamos, coman

🎯 *Главное:* Два субъекта + que → Subjuntivo!
Quiero que tú vengas ✅
Quiero venir (один субъект) → Infinitivo ✅`,
        exercises: [
          { q: "«Quiero que tú _____ (venir)»:", options: ["vienes", "vengas", "viene", "venís"], correct: 1, explain: "Два субъекта + que → Subjuntivo! 🎯" },
          { q: "Где Subjuntivo нужен?", options: ["Creo que es verdad", "No creo que sea verdad", "Sé que viene", "Veo que trabaja"], correct: 1, explain: "No creo que + Subjuntivo 🔄" },
          { q: "«Ojalá» требует:", options: ["Indicativo", "Subjuntivo", "Infinitivo", "Futuro"], correct: 1, explain: "Ojalá + Subjuntivo — ВСЕГДА! 🌙" },
        ],
        test: [
          { q: "«Es importante que _____ (estudiar)»:", options: ["estudias", "estudies", "estudiás", "estudia"], correct: 1 },
          { q: "«Me alegra que estés aquí» — почему Subjuntivo?", options: ["после que всегда", "эмоция (E)", "желание", "сомнение"], correct: 1 },
          { q: "Subjuntivo от COMER для nosotros:", options: ["comemos", "comamos", "comermos", "comimos"], correct: 1 },
          { q: "«Te recomiendo que _____ (descansar)»:", options: ["descansas", "descansarás", "descanses", "descansa"], correct: 2 },
          { q: "«Quiero venir» vs «Quiero que vengas»:", options: ["нет разницы", "я хочу прийти / ты пришёл", "только стиль", "время"], correct: 1 },
        ],
      },
      {
        title: "💬 Opinión y debate — Выражение мнения",
        theory: `*Как спорить по-испански* 🗣️

*Мнение:*
En mi opinión... | Creo que | Me parece que
Estoy convencido/a de que | Desde mi punto de vista

*Согласие/несогласие:*
Estoy de acuerdo ✅ | No estoy de acuerdo ❌
Tienes razón | En parte, sí, pero...

*Для дискуссии:*
Por un lado... por otro lado
Sin embargo — Тем не менее
A pesar de (que) — Несмотря на

😂 Испанские кафе — место для tertulia: беседы часами без цели. Культура!`,
        exercises: [
          { q: "«Ты прав»:", options: ["Estás correcto", "Tienes razón", "Eres razón", "Tienes correcto"], correct: 1, explain: "Tener razón = быть правым 🧠" },
          { q: "«Тем не менее»:", options: ["Por lo tanto", "Sin embargo", "Por ejemplo", "Además"], correct: 1, explain: "Sin embargo — учи наизусть! 📝" },
          { q: "«En parte, sí, pero...» выражает:", options: ["полное согласие", "полное несогласие", "частичное согласие", "безразличие"], correct: 2, explain: "Дипломатичный способ не согласиться 🤝" },
        ],
        test: [
          { q: "«Estoy de acuerdo» = ?", options: ["Я согласен", "Не согласен", "Не понимаю", "Всё равно"], correct: 0 },
          { q: "«A pesar de que» = ?", options: ["из-за того что", "несмотря на то что", "потому что", "если"], correct: 1 },
          { q: "«Por un lado» = ?", options: ["Напротив", "С одной стороны", "Кроме того", "Например"], correct: 1 },
          { q: "«Me parece que» + ?", options: ["Subjuntivo всегда", "Indicativo", "Infinitivo", "ничего"], correct: 1 },
          { q: "«No tienes razón» = ?", options: ["Ты прав", "Ты не прав", "Нет разума", "Не понимаю"], correct: 1 },
        ],
      },
      {
        title: "😎 Slengo — Разговорный испанский",
        theory: `*Язык улицы* 🏙️

*Испанский сленг:*
¡Qué guay! — Как круто!
¡Mola mazo! — Очень круто!
Tío/Tía — Чувак/Чувиха
Flipar — сойти с ума от восторга
Mogollón de — куча
¡Venga! — Давай/Ок/Пошли/Пока
¡Qué rollo! — Как скучно!
Estar hecho polvo — быть в хлам уставшим

*Латинская Америка:*
¡Qué chévere! (Колумбия) | ¡Órale! (Мексика)
Güey/Wey (Мексика) | ¡Buena onda! (Аргентина)

😂 «Venga» — 47 раз в день. Один звук — вся палитра согласия!`,
        exercises: [
          { q: "«¡Mola mazo!» = ?", options: ["Скучно", "Очень круто", "Много людей", "Пошли!"], correct: 1, explain: "Molar = быть крутым. Mazo = очень 🔥" },
          { q: "«¡Qué rollo!» = ?", options: ["Интересно!", "Скучно!", "Круто!", "Сколько народу!"], correct: 1, explain: "Rollo = скука/тягомотина 😩" },
          { q: "«Estar hecho polvo» = ?", options: ["Быть богатым", "Быть уставшим", "Быть модным", "Быть голодным"], correct: 1, explain: "Буквально «стать пылью» 😵" },
        ],
        test: [
          { q: "«Tío» в сленге = ?", options: ["Дядя", "Чувак", "Старик", "Друг"], correct: 1 },
          { q: "«¡Venga!» используется как:", options: ["только «пошли»", "только «пока»", "только «ок»", "всё и больше"], correct: 3 },
          { q: "«Flipar» = ?", options: ["скучать", "потерять голову от восторга", "уставать", "спорить"], correct: 1 },
          { q: "«Güey/Wey» — из:", options: ["Испании", "Аргентины", "Мексики", "Колумбии"], correct: 2 },
          { q: "«Pasarlo bien» = ?", options: ["плохо провести время", "хорошо провести время", "пройти мимо", "не обращать внимания"], correct: 1 },
        ],
      },
      {
        title: "✈️ Viajes y turismo — Путешествия",
        theory: `*В аэропорту и отеле* 🏨

el vuelo — рейс | la escala — пересадка
la tarjeta de embarque — посадочный талон
la aduana — таможня | hacer cola — очередь

*В отеле:*
¿Tiene habitaciones disponibles? — Свободные номера?
con desayuno incluido — с завтраком
¿Hay wifi? — Есть вайфай?

*Ориентация:*
¿Cómo se llega a...? — Как добраться?
Todo recto — Прямо
a la derecha — направо | a la izquierda — налево
en la esquina — на углу

😂 Туристы едут в Барселону, местные — в белые деревни Андалусии!`,
        exercises: [
          { q: "«Посадочный талон»:", options: ["la aduana", "el pasaporte", "la tarjeta de embarque", "el vuelo"], correct: 2, explain: "Tarjeta de embarque = boarding pass 🛫" },
          { q: "«Стоять в очереди»:", options: ["hacer cola", "hacer fila", "esperar tiempo", "estar fila"], correct: 0, explain: "Hacer cola — буквально «делать хвост» 🐒" },
          { q: "«Todo recto» = ?", options: ["Направо", "Налево", "Прямо", "Назад"], correct: 2, explain: "Todo recto = прямо 🧭" },
        ],
        test: [
          { q: "«Con desayuno incluido» = ?", options: ["Без завтрака", "С завтраком", "Только завтрак", "Завтрак отдельно"], correct: 1 },
          { q: "«¿Cómo se llega a...?» — о:", options: ["названии", "истории", "как добраться", "стоимости"], correct: 2 },
          { q: "«La escala» = ?", options: ["шкала", "пересадка", "расстояние", "время"], correct: 1 },
          { q: "«A la izquierda» = ?", options: ["Направо", "Налево", "Прямо", "Назад"], correct: 1 },
          { q: "«¿Hay habitaciones disponibles?»:", options: ["Свободные номера?", "Сколько стоит?", "Когда выезд?", "Вайфай?"], correct: 0 },
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
        theory: `*Condicional Simple* ✨

*Образование:* Инфинитив + -ía, -ías, -ía, -íamos, -ían

*Когда использовать:*
1. Вежливые просьбы: ¿Podría ayudarme?
2. Желания: Me gustaría viajar
3. Советы: En tu lugar, estudiaría más
4. Si + Imperfecto Subj. + Condicional:
   Si tuviera dinero, viajaría

*Неправильные основы:*
poder→podr- | tener→tendr- | hacer→har-
decir→dir- | salir→saldr- | venir→vendr-

😂 «Querría un café» = воспитанный человек 🎩`,
        exercises: [
          { q: "«Если бы было время, учился бы»:", options: ["Si tengo tiempo, estudiaré", "Si tuviera tiempo, estudiaría", "Si tendría tiempo, estudiaría", "Si tuviera tiempo, estudiara"], correct: 1, explain: "Si + Imperfecto Subj. + Condicional 🏆" },
          { q: "Condicional от HACER:", options: ["hacería", "haría", "harería", "hacía"], correct: 1, explain: "Hacer → har- + -ía = haría 💪" },
          { q: "«¿Podría ayudarme?» — это:", options: ["приказ", "вежливая просьба", "гипотеза", "мечта"], correct: 1, explain: "Podría = вежливая просьба 🎩" },
        ],
        test: [
          { q: "«Me gustaría» = ?", options: ["Мне нравится", "Хотелось бы", "Не нравится", "Нравилось бы?"], correct: 1 },
          { q: "«Saldría» — от:", options: ["saber", "salvar", "salir", "saltar"], correct: 2 },
          { q: "«En tu lugar, yo...» вводит:", options: ["факт", "вопрос", "гипотетический совет", "приказ"], correct: 2 },
          { q: "«Si fuera rico» — fuera от:", options: ["ir", "ser", "ir или ser", "estar"], correct: 2 },
          { q: "Вежливый эквивалент «quiero»:", options: ["querría", "quería", "querré", "quiero más"], correct: 0 },
        ],
      },
      {
        title: "🗣️ Estilo indirecto — Косвенная речь",
        theory: `*Косвенная речь* 📢

María dijo: «Estoy cansada.»
→ María dijo que *estaba* cansada.

*Трансформация времён:*
Presente → Imperfecto
Futuro → Condicional
Indefinido → Pluscuamperfecto
Imperativo → que + Subjuntivo Imperfecto

*Трансформация наречий:*
aquí→allí | hoy→ese día | ahora→entonces
mañana→al día siguiente | ayer→el día anterior

😂 Теперь понимаешь испанские новости! 📺`,
        exercises: [
          { q: "«Estoy cansado» → dijo que...", options: ["está", "estará", "estaba", "esté"], correct: 2, explain: "Presente → Imperfecto 📚" },
          { q: "«Hoy» → становится:", options: ["ahora", "ese día", "entonces", "al día siguiente"], correct: 1, explain: "Hoy → ese día 📅" },
          { q: "«Ven» → me dijo que...", options: ["vengas", "vinieras", "vendrías", "vienes"], correct: 1, explain: "Imperativo → Imperfecto Subjuntivo ✅" },
        ],
        test: [
          { q: "«Vendré» → dijo que...", options: ["vendrá", "vendría", "venga", "vino"], correct: 1 },
          { q: "«Aquí» →", options: ["aquí", "allí", "acá", "ahí"], correct: 1 },
          { q: "«Preguntar si» для:", options: ["утверждений", "закрытых вопросов", "приказов", "пожеланий"], correct: 1 },
          { q: "«Ha llegado» → dijo que...", options: ["llegó", "llegaba", "había llegado", "llegaría"], correct: 2 },
          { q: "«Ayer» → al día...", options: ["siguiente", "anterior", "pasado", "presente"], correct: 1 },
        ],
      },
      {
        title: "📝 Argumentación — Искусство убеждать",
        theory: `*Аргументированная речь* 🎤

*Введение:*
El tema que vamos a tratar es...
Quisiera plantear la cuestión de...

*Аргументы «за»:*
Cabe destacar que... | Es innegable que...
Los datos muestran que... | No hay que olvidar que...

*Контраргументы:*
No obstante... | Por el contrario...
Si bien es cierto que..., también lo es que...

*Заключение:*
En conclusión / En definitiva
Todo ello nos lleva a concluir que...

😂 Испанские дебаты — все кричат одновременно. Норма!`,
        exercises: [
          { q: "«Es innegable que» = ?", options: ["невозможно", "неоспоримо", "невероятно", "непонятно"], correct: 1, explain: "Innegable = неоспоримый 💪" },
          { q: "«En conclusión» для:", options: ["введения", "аргументов", "заключения", "примеров"], correct: 2, explain: "В заключение 🎯" },
          { q: "«Cabe destacar que» = ?", options: ["Стоит отметить", "Напротив", "Несмотря на", "Кроме того"], correct: 0, explain: "Стоит выделить 🎓" },
        ],
        test: [
          { q: "«Por el contrario» = ?", options: ["Кроме того", "Напротив", "Потому что", "Например"], correct: 1 },
          { q: "«Los datos muestran que» вводит:", options: ["вывод", "факт", "контраргумент", "вопрос"], correct: 1 },
          { q: "«No obstante» = ?", options: ["Тем не менее", "Потому что", "Например", "Кроме того"], correct: 0 },
          { q: "«Si bien es cierto que A...»:", options: ["отрицание A", "признание A + B", "сравнение", "простое A"], correct: 1 },
          { q: "«Quisiera plantear» — во:", options: ["заключении", "введении", "контраргументе", "примере"], correct: 1 },
        ],
      },
      {
        title: "🏛️ Política española — Политика Испании",
        theory: `*Политическая система* 👑

la monarquía parlamentaria | el Rey Felipe VI
el Congreso de los Diputados | el Senado
el presidente del Gobierno

*Партии:*
🔴 PSOE (левые) | 🔵 PP (правые)
🟢 Sumar/Podemos | ⚫ Vox (ультраправые)

*Ключевые темы:*
la Constitución de 1978
la Transición — переход от диктатуры
el independentismo catalán
la corrupción | la vivienda

😂 Монархию ВОССТАНОВИЛ Франко, который сам её отменил! История-сериал!`,
        exercises: [
          { q: "«La Transición» — это:", options: ["переход к евро", "переход от диктатуры", "вступление в ЕС", "реформа"], correct: 1, explain: "Мирный переход от Франко 🕊️" },
          { q: "PSOE — партия:", options: ["ультраправая", "левоцентристская", "либеральная", "сепаратистская"], correct: 1, explain: "Partido Socialista Obrero Español 🔴" },
          { q: "«La vivienda» = проблема:", options: ["еды", "здоровья", "жилья", "образования"], correct: 2, explain: "Жилищный кризис Испании 🏠" },
        ],
        test: [
          { q: "Председатель правительства =", options: ["Король", "Премьер-министр", "Президент", "Мэр"], correct: 1 },
          { q: "«La corrupción» = ?", options: ["Коррупция", "Конкуренция", "Конституция", "Конфедерация"], correct: 0 },
          { q: "Испания — это:", options: ["президентская республика", "федерация", "парламентская монархия", "конфедерация"], correct: 2 },
          { q: "«El independentismo catalán» — за:", options: ["объединение с Францией", "независимость", "НАТО", "слияние с Басками"], correct: 1 },
          { q: "Конституция 1978 — после:", options: ["Первой мировой", "Второй мировой", "смерти Франко", "ЕС"], correct: 2 },
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
        theory: `*Испанские идиомы* 🌶️

🎯 Matar dos pájaros de un tiro — убить двух зайцев
🌟 No hay mal que por bien no venga — нет худа без добра
🌧️ Más vale tarde que nunca — лучше поздно, чем никогда
👄 En boca cerrada no entran moscas — молчание золото
💪 Querer es poder — кто хочет, тот добьётся
☁️ Estar en las nubes — витать в облаках
💸 Costar un ojo de la cara — стоить целое состояние
✂️ Tomar el pelo — дурачить кого-то
🎭 Hacer de tripas corazón — взять себя в руки

😂 Испанцы буквально теряют органы от цен!`,
        exercises: [
          { q: "«Matar dos pájaros de un tiro» = ?", options: ["охотиться", "убить двух зайцев", "сделать быстро", "решить силой"], correct: 1, explain: "Убить двух птиц = убить двух зайцев 🎯" },
          { q: "«Estar en las nubes» = ?", options: ["быть богатым", "путешествовать", "витать в облаках", "быть счастливым"], correct: 2, explain: "В облаках = рассеянный ☁️" },
          { q: "«Tomar el pelo» = ?", options: ["стричься", "дурачить", "причёсываться", "подражать"], correct: 1, explain: "Брать за волосы = дурачить 😄" },
        ],
        test: [
          { q: "«En boca cerrada no entran moscas» = ?", options: ["Закрой холодильник", "Молчание золото", "Ешь закрытым ртом", "Мухи опасны"], correct: 1 },
          { q: "«Costar un ojo de la cara» = ?", options: ["Больно смотреть", "Очень дорого", "Красиво", "Потерять зрение"], correct: 1 },
          { q: "«Querer es poder» = ?", options: ["Хотеть власти", "Кто хочет добьётся", "Власть хочет", "Мочь желать"], correct: 1 },
          { q: "«Hacer de tripas corazón» = ?", options: ["Приготовить блюдо", "Взять себя в руки", "Быть смелым", "Страдать"], correct: 1 },
          { q: "«Más vale tarde que nunca» = ?", options: ["Лучше никогда", "Лучше поздно чем никогда", "Торопись медленно", "Время — деньги"], correct: 1 },
        ],
      },
      {
        title: "📺 Medios y comunicación — СМИ",
        theory: `*Медиа* 📱

la prensa escrita | la televisión | la radio
los medios digitales | las redes sociales | el pódcast

*Журналистика:*
el titular — заголовок | la portada — первая полоса
el reportaje | la entrevista | la fake news
la desinformación | el algoritmo

*Конструкции:*
Según fuentes... — По данным источников...
Se informa que... — Сообщается, что...
Cabe señalar que... — Стоит отметить...

😂 Испанцы шлют голосовые WhatsApp по 5 минут!`,
        exercises: [
          { q: "«El titular» = ?", options: ["Читатель", "Заголовок", "Редактор", "Репортёр"], correct: 1, explain: "Titular = заголовок 📰" },
          { q: "«La desinformación» = ?", options: ["Информация", "Дезинформация", "Секретная", "Реклама"], correct: 1, explain: "Фейк намеренный 🚫" },
          { q: "«Según fuentes» для:", options: ["мнения", "ссылки на источники", "вывода", "вопроса"], correct: 1, explain: "Согласно источникам 📡" },
        ],
        test: [
          { q: "«La portada» = ?", options: ["Реклама", "Первая полоса", "Комментарий", "Заголовок"], correct: 1 },
          { q: "«Se informa que» для:", options: ["вопросов", "сообщений (пассив)", "команд", "пожеланий"], correct: 1 },
          { q: "«El pódcast» — это:", options: ["радиостанция", "аудиопрограмма онлайн", "телешоу", "газета"], correct: 1 },
          { q: "«Fuentes cercanas afirman» = ?", options: ["Я утверждаю", "Источники утверждают", "Источник близко", "Верно"], correct: 1 },
          { q: "«Cabe señalar que» = ?", options: ["Стоит отметить", "Напротив", "В заключение", "Например"], correct: 0 },
        ],
      },
      {
        title: "🎨 Literatura y retórica — Литература",
        theory: `*Стилистические приёмы* ✍️

la ironía — ирония
la hipérbole — «Te lo he dicho mil veces»
la metáfora — «El tiempo es oro»
el eufemismo — «Pasó a mejor vida» (умер)
la perífrasis — «El rey de los animales» = лев
la anáfora — повторение в начале фраз

*Авторы:*
📖 Cervantes — «Дон Кихот» (1605)
🎭 García Lorca — поэт, расстрелян 1936
🪄 García Márquez — «Сто лет одиночества»
🧩 Borges — лабиринты и философия

*Регистры:* formal | coloquial | culto | vulgar`,
        exercises: [
          { q: "«Te lo he dicho mil veces» — это:", options: ["метафора", "ирония", "гипербола", "эвфемизм"], correct: 2, explain: "Тысячу раз (не буквально) = гипербола 📢" },
          { q: "«Pasó a mejor vida» — это:", options: ["метафора", "эвфемизм", "ирония", "анафора"], correct: 1, explain: "Перешёл к лучшей жизни = умер (нежно) 🕊️" },
          { q: "«El rey de los animales» — это:", options: ["метафора", "ирония", "перифраза", "метонимия"], correct: 2, explain: "Perífrasis = описание вместо слова 🦁" },
        ],
        test: [
          { q: "«El tiempo es oro» — это:", options: ["гипербола", "метафора", "ирония", "эвфемизм"], correct: 1 },
          { q: "García Márquez — автор:", options: ["Дон Кихота", "Ста лет одиночества", "Поэм", "Лабиринтов"], correct: 1 },
          { q: "Registro formal — в:", options: ["чатах", "официальных документах", "сленге", "мемах"], correct: 1 },
          { q: "«La anáfora» — это:", options: ["замена частью", "повторение в начале", "преувеличение", "смягчение"], correct: 1 },
          { q: "Cervantes — автор:", options: ["Cien años", "Don Quijote", "Laberintos", "Bodas de sangre"], correct: 1 },
        ],
      },
      {
        title: "🧠 Mentalidad española — Менталитет",
        theory: `*Как думают испанцы* 🇪🇸

*La sobremesa* ☕ — время разговора ПОСЛЕ еды. Уйти сразу = невежливо.

*El cachondeo* 😂 — беззлобное веселье. Не воспринимать всё буквально.

*La queja* 😤 — жалоба как коммуникация. «¡Qué calor!» = разговор.

*El orgullo regional* 🏴 — НИКОГДА не скажи каталонцу что Барселона «испанский город».

*La familia* 👨‍👩‍👧‍👦 — воскресный обед у бабушки — национальная религия.

*Mañana* 🌅 — не только «завтра», но и «потом», «когда-нибудь».

😂 «La hora española» = опоздание на 15-30 минут — норма!`,
        exercises: [
          { q: "«La sobremesa» = ?", options: ["скатерть", "время после еды за разговором", "десерт", "обед"], correct: 1, explain: "Уйти сразу = нарушить правила ☕" },
          { q: "«Ya veremos» в культуре:", options: ["строго «посмотрим»", "потом/неопределённо", "никогда", "завтра точно"], correct: 1, explain: "Другой ритм жизни 🌊" },
          { q: "«El orgullo regional» особенно в:", options: ["Мадриде", "Каталонии и Стране Басков", "Кастилии", "везде одинаково"], correct: 1, explain: "Свой язык, культура, история 🏴" },
        ],
        test: [
          { q: "«El cachondeo» = ?", options: ["Серьёзность", "Беззлобное веселье", "Злой юмор", "Фестиваль"], correct: 1 },
          { q: "«La hora española» = ?", options: ["часовой пояс", "опоздание как норма", "сиеста", "ужин"], correct: 1 },
          { q: "«Mañana» в культуре = ?", options: ["строго завтра", "утро", "потом/когда-нибудь", "никогда"], correct: 2 },
          { q: "Воскресный обед в Испании:", options: ["редкость", "центральная традиция", "устарело", "деревня"], correct: 1 },
          { q: "«La queja» = ?", options: ["официальная жалоба", "способ общения", "протест", "иск"], correct: 1 },
        ],
      },
    ],
  },
};

const SOFIA_PROMPT = `Ты — Sofía, харизматичный ИИ-репетитор испанского 🇪🇸
Отвечай кратко (до 200 слов), с юмором, на русском языке.
Всегда давай пример на испанском + перевод.
Объясняй ПОЧЕМУ, а не просто «это правило».
Отвечай ТОЛЬКО на вопросы об испанском языке.
Начинай сразу с сути — без «конечно!» и «отличный вопрос!».`;

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
  return { reply_markup: { keyboard: topicButtons, resize_keyboard: true } };
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
  return { reply_markup: { keyboard: buttons, resize_keyboard: true } };
}

function getLessonKey(levelKey, topicIdx) {
  return `${levelKey}_${topicIdx}`;
}

function isLessonFree(levelKey, topicIdx) {
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

async function sendPaymentInfo(chatId, levelKey, topicIdx) {
  const topic = COURSE[levelKey].topics[topicIdx];
  await bot.sendMessage(
    chatId,
    `🔒 *Урок: ${topic.title}*\n\n` +
    `💳 *1€ — открыть этот урок:*\n${TRIBUTE_LESSON}\n\n` +
    `🎓 *10€ — весь курс A1–C1:*\n${TRIBUTE_COURSE}\n\n` +
    `📩 После оплаты напиши: ${ADMIN_CONTACT}\n` +
    `Пришли свой Telegram ID — активируем за час! ⚡`,
    {
      parse_mode: "Markdown",
      reply_markup: { keyboard: [["⬅️ Назад к урокам"]], resize_keyboard: true },
    }
  );
}

async function sendCoursePaymentInfo(chatId) {
  await bot.sendMessage(
    chatId,
    `🎓 *Весь курс A1–C1 — 10€*\n\n` +
    `Все 20 уроков навсегда! 🇪🇸🔥\n\n` +
    `👉 ${TRIBUTE_COURSE}\n\n` +
    `📩 После оплаты напиши: ${ADMIN_CONTACT}\n` +
    `Пришли Telegram ID — активируем за час! ⚡`,
    {
      parse_mode: "Markdown",
      reply_markup: { keyboard: [["⬅️ Назад к урокам"]], resize_keyboard: true },
    }
  );
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  getUser(chatId);
  const name = msg.from.first_name || "друг";
  await bot.sendMessage(
    chatId,
    `¡Hola, ${name}! 🇪🇸🎉\n\nДобро пожаловать в *Habla Español*!\n\n😎 Здесь есть:\n• 5 уровней от A1 до C1\n• 20 тем с теорией и упражнениями\n• Тесты с разбором ошибок\n• 🤖 Sofía — репетитор 24/7 (10 вопросов/день)\n\n💡 Первый урок — *БЕСПЛАТНО!*\nОстальные — 1€ за урок или 10€ за весь курс 🎓\n\n¡Vamos! 🚀`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `🆘 *Помощь*\n\n📚 Теория → Упражнения → Тест → Результат\n\n🤖 *Sofía:* 10 вопросов в день бесплатно!\n\n💳 *Оплата:* 1€/урок или 10€/весь курс\nЧерез Tribute — ссылки в боте\n\n📊 /progress | 🔄 /reset`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/progress/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const total = Object.values(COURSE).reduce((a, l) => a + l.topics.length, 0);
  const unlocked = user.fullCourse ? total : user.paid.length + 1;
  resetAIIfNewDay(user);
  await bot.sendMessage(
    chatId,
    `📊 *Твой прогресс*\n\n🔓 Уроков: ${unlocked}/${total}\n💳 Полный курс: ${user.fullCourse ? "✅ Куплен" : "❌ Не куплен"}\n🤖 Sofía сегодня: ${user.aiCount}/10`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = null;
  getUser(chatId);
  await bot.sendMessage(chatId, "🔄 Прогресс сброшен! ¡Vamos! 🚀", mainMenu);
});

bot.onText(/\/give_course (.+)/, async (msg, match) => {
  await bot.sendMessage(msg.chat.id, `Твой ID: ${msg.from.id} | ADMIN_ID: ${ADMIN_ID}`);
  if (String(msg.from.id) !== String(ADMIN_ID)) return;
  const targetId = match[1].trim();
  getUser(targetId).fullCourse = true;
  await bot.sendMessage(msg.chat.id, `✅ Полный курс открыт для ${targetId}`);
  try {
    await bot.sendMessage(targetId, `🎉 *Твой доступ активирован!*\n\nВесь курс твой! ¡A estudiar! 📚`, { parse_mode: "Markdown", ...mainMenu });
  } catch (e) {
    await bot.sendMessage(msg.chat.id, `⚠️ Не удалось написать пользователю ${targetId}`);
  }
});

bot.onText(/\/give_lesson (.+) (.+) (.+)/, async (msg, match) => {
  if (String(msg.from.id) !== String(ADMIN_ID)) return;
  const targetId = match[1].trim();
  const levelKey = match[2].trim().toUpperCase();
  const topicIdx = parseInt(match[3].trim());
  const user = getUser(targetId);
  const key = getLessonKey(levelKey, topicIdx);
  if (!user.paid.includes(key)) user.paid.push(key);
  await bot.sendMessage(msg.chat.id, `✅ Урок ${levelKey}_${topicIdx} открыт для ${targetId}`);
  try {
    await bot.sendMessage(targetId, `🎉 *Урок разблокирован!* ¡A estudiar! 📚`, { parse_mode: "Markdown", ...mainMenu });
  } catch (e) {
    await bot.sendMessage(msg.chat.id, `⚠️ Не удалось написать пользователю ${targetId}`);
  }
});

bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const user = getUser(chatId);

  if (text.startsWith("/")) return;

  if (user.awaitingAI) {
    user.awaitingAI = false;
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(chatId, "😴 Мои нейроны хотят сиесту! Лимит 10 вопросов. ¡Hasta mañana! 🌙", mainMenu);
      return;
    }
    await bot.sendMessage(chatId, "🤔 Sofía думает...");
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system: SOFIA_PROMPT,
        messages: [{ role: "user", content: text }],
      });
      user.aiCount++;
      const answer = response.content.map(b => b.text || "").join("");
      await bot.sendMessage(
        chatId,
        `🤖 *Sofía:*\n\n${answer}\n\n_Осталось: ${10 - user.aiCount} вопросов_`,
        { parse_mode: "Markdown", ...mainMenu }
      );
    } catch (e) {
      console.error("Anthropic error:", e.message);
      await bot.sendMessage(chatId, "😵 Sofía перегрелась! Попробуй через минуту 🔥", mainMenu);
    }
    return;
  }

  if (user.currentStep === 1 && user.currentLevel && user.currentTopic !== null) {
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const ex = topic.exercises[user.exerciseIndex];
      const isCorrect = idx === ex.correct;
      const replyText = isCorrect
        ? `✅ *Правильно!* 🎉\n\n💡 ${ex.explain}`
        : `❌ *Неверно!* Правильно: *${letters[ex.correct]}) ${ex.options[ex.correct]}*\n\n💡 ${ex.explain}`;
      await bot.sendMessage(chatId, replyText, { parse_mode: "Markdown" });
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
        await bot.sendMessage(chatId, "🏁 Упражнения завершены! Молодец! 💪\nТеперь попробуй тест!", lessonMenu());
      }
      return;
    }
  }

  if (user.currentStep === 2 && user.currentLevel && user.currentTopic !== null) {
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const q = topic.test[user.testIndex];
      const isCorrect = idx === q.correct;
      user.testAnswers.push({ q: q.q, userIdx: idx, correctIdx: q.correct, options: q.options, ok: isCorrect });
      if (isCorrect) user.testScore++;
      user.testIndex++;
      if (user.testIndex < topic.test.length) {
        const next = topic.test[user.testIndex];
        await bot.sendMessage(
          chatId,
          `${isCorrect ? "✅" : "❌"} ${isCorrect ? "Верно!" : "Неверно!"}\n\n*Вопрос ${user.testIndex + 1}/${topic.test.length}*\n\n${next.q}`,
          { parse_mode: "Markdown", ...exerciseMenu(next.options) }
        );
      } else {
        const { pct, grade, emoji } = getScore(user.testScore, topic.test.length);
        let wrongList = "";
        user.testAnswers.filter(a => !a.ok).forEach(a => {
          wrongList += `\n❌ *${a.q}*\n   Твой: ${a.options[a.userIdx]}\n   ✅ Правильно: ${a.options[a.correctIdx]}\n`;
        });
        const resultMsg =
          `${emoji} *Результаты теста!*\n\n` +
          `🎯 *${user.testScore}/${topic.test.length}* (${pct}%)\n${grade}\n\n` +
          `${wrongList ? `*Работа над ошибками:*${wrongList}` : "🏆 Все ответы верны! Ты звезда!"}`;
        user.currentStep = 0;
        user.testIndex = 0;
        user.testScore = 0;
        user.testAnswers = [];
        await bot.sendMessage(chatId, resultMsg, {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [["🔄 Повторить урок"], ["📖 Теория", "💪 Упражнения"], ["⬅️ Назад к урокам"]],
            resize_keyboard: true,
          },
        });
      }
      return;
    }
  }

  if (text === "⬅️ Главное меню" || text === "/menu") {
    user.currentLevel = null;
    user.currentTopic = null;
    user.currentStep = 0;
    await bot.sendMessage(chatId, "🏠 Главное меню! 🇪🇸", mainMenu);
    return;
  }

  if (text === "⬅️ Назад к урокам" || text === "⬅️ Назад") {
    user.currentTopic = null;
    user.currentStep = 0;
    if (user.currentLevel) {
      await bot.sendMessage(chatId, `📚 Выбери тему в ${COURSE[user.currentLevel].label}:`, levelMenu(user.currentLevel));
    } else {
      await bot.sendMessage(chatId, "🏠 Главное меню:", mainMenu);
    }
    return;
  }

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
      `${COURSE[user.currentLevel].emoji} *${COURSE[user.currentLevel].label}*\n\nВыбери тему:`,
      { parse_mode: "Markdown", ...levelMenu(user.currentLevel) }
    );
    return;
  }

  if (user.currentLevel && user.currentTopic === null) {
    const level = COURSE[user.currentLevel];
    const topicIdx = level.topics.findIndex((t, i) => text.startsWith(`${i + 1}.`));
    if (topicIdx !== -1) {
      if (!hasAccess(user, user.currentLevel, topicIdx)) {
        user._pendingLevel = user.currentLevel;
        user._pendingTopic = topicIdx;
        await sendPaymentInfo(chatId, user.currentLevel, topicIdx);
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
        `📚 *${topic.title}*\n\nВыбери что делать:`,
        { parse_mode: "Markdown", ...lessonMenu() }
      );
      return;
    }
  }

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
      `💪 *Упражнения!* ${topic.exercises.length} вопроса\n\n*Вопрос 1/${topic.exercises.length}*\n\n${ex.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(ex.options) }
    );
    return;
  }

  if (text === "❓ Не совсем...") {
    user.awaitingAI = true;
    await bot.sendMessage(chatId, "🤖 Sofía на связи! Что непонятно? 😄", { reply_markup: { remove_keyboard: true } });
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
      `📝 *ТЕСТ: ${topic.title}*\n${topic.test.length} вопросов 🍀\n\n*Вопрос 1/${topic.test.length}*\n\n${q.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(q.options) }
    );
    return;
  }

  if (text === "🔄 Повторить урок") {
    if (!user.currentLevel || user.currentTopic === null) return;
    user.currentStep = 0;
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    await bot.sendMessage(chatId, `🔄 *Повторяем: ${topic.title}*`, { parse_mode: "Markdown", ...lessonMenu() });
    return;
  }

  if (text === "🤖 Спросить Sofía") {
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(chatId, "😴 Sofía отдыхает! Лимит 10 вопросов. Приходи завтра! 🌙", mainMenu);
      return;
    }
    user.awaitingAI = true;
    await bot.sendMessage(
      chatId,
      `🤖 ¡Hola! Я Sofía 🇪🇸\nОсталось вопросов: *${10 - user.aiCount}*\n\nСпрашивай всё об испанском! 😊`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
    );
    return;
  }
if (text.startsWith("!give ")) {
    const parts = text.split(" ");
    const targetId = parts[1];
    getUser(targetId).fullCourse = true;
    await bot.sendMessage(chatId, `✅ Курс открыт для ${targetId}`);
    try {
      await bot.sendMessage(targetId, `🎉 *Доступ активирован!* ¡A estudiar! 📚`, { parse_mode: "Markdown", ...mainMenu });
    } catch(e) {}
    return;
  }
  if (text === "📊 Мой прогресс") {
    const total = Object.values(COURSE).reduce((a, l) => a + l.topics.length, 0);
    const unlocked = user.fullCourse ? total : user.paid.length + 1;
    resetAIIfNewDay(user);
    await bot.sendMessage(
      chatId,
      `📊 *Прогресс*\n\n🔓 Уроков: ${unlocked}/${total}\n💳 Курс: ${user.fullCourse ? "✅ Куплен" : "❌ Не куплен"}\n🤖 Sofía: ${user.aiCount}/10`,
      { parse_mode: "Markdown", ...mainMenu }
    );
    return;
  }

  await bot.sendMessage(chatId, "¿Qué? 🤔 Используй кнопки меню! 👇", mainMenu);
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

bot.on("error", (error) => {
  console.error("Bot error:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

console.log("🇪🇸 Habla Español Bot запущен! ¡Vamos!");
