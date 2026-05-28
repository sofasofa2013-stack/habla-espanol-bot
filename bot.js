const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ADMIN_ID = process.env.ADMIN_ID;

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

// ─────────────────────────────────────────────
//  КУРС
// ─────────────────────────────────────────────
const COURSE = {

  // ══════════════════════════════
  //  A1
  // ══════════════════════════════
  A1: {
    emoji: "🌱",
    label: "A1 — Bebé Español",
    topics: [
      // ── Тема 1 ──────────────────
      {
        title: "👋 Знакомство и приветствия",
        theory: `*¡Hola! Знакомимся по-испански* 🎉

━━━━━━━━━━━━━━━━━━━━
🗣️ *ПРИВЕТСТВИЯ*
━━━━━━━━━━━━━━━━━━━━
*Hola* [óла] — Привет (в любое время суток!)
*Buenos días* [буэнос диас] — Доброе утро ☀️
*Buenas tardes* [буэнас тардэс] — Добрый день/вечер 🌤
*Buenas noches* [буэнас ночэс] — Добрый вечер/ночь 🌙
*¡Hola, qué tal!* [ола кэ таль] — Привет, как дела!

━━━━━━━━━━━━━━━━━━━━
🤝 *ЗНАКОМСТВО*
━━━━━━━━━━━━━━━━━━━━
*¿Cómo te llamas?* [комо тэ йамас] — Как тебя зовут?
*Me llamo Ana* [мэ йамо ана] — Меня зовут Ана
*¿Y tú?* [и ту] — А ты?
*Mucho gusto* [мучо густо] — Очень приятно 🤝
*Encantado/a* [энкантадо/а] — Рад/а познакомиться
*Igualmente* [игуальмэнтэ] — Взаимно!

━━━━━━━━━━━━━━━━━━━━
📚 *ГЛАГОЛ LLAMARSE*
━━━━━━━━━━━━━━━━━━━━
Me llamo — меня зовут (я)
Te llamas — тебя зовут (ты)
Se llama — его/её зовут (он/она)

😄 *Факт:* «Me llamo» буквально «я называю себя». Испанцы с рождения знают себе цену!
🎭 *Лайфхак:* «Hola» испанцы говорят даже когда берут трубку. Никакого «алло» — только страсть и темперамент!
⚠️ *Внимание:* EncantadО — мужской род, EncantadА — женский. Испанский честен с самого начала!`,

        exercises: [
          {
            q: "Как поздороваться утром? ☀️",
            options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hola qué tal"],
            correct: 1,
            explain: "Buenos días [буэнос диас] — только утром! Tardes — вторая половина дня, Noches — вечер/ночь 😎"
          },
          {
            q: "Женщина говорит «Очень рада познакомиться»:",
            options: ["Mucho gusto", "Encantado", "Encantada", "Igualmente"],
            correct: 2,
            explain: "EncantadА — женский род! -O для мужчин, -A для женщин. Испанский видит тебя насквозь 😏"
          },
          {
            q: "«_____ llamo Sofía» — заполни пропуск:",
            options: ["Te", "Se", "Me", "Le"],
            correct: 2,
            explain: "Me llamo = меня зовут (я). Запомни: ME — это Я 💁‍♀️"
          },
          {
            q: "«Mucho gusto» означает:",
            options: ["Очень вкусно", "Очень приятно", "Очень много", "Очень красиво"],
            correct: 1,
            explain: "Mucho gusto [мучо густо] = «большое удовольствие» = очень приятно. Gusto = удовольствие 🤝"
          },
        ],

        test: [
          {
            q: "Как спросить имя?",
            options: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "¿Cuántos años tienes?"],
            correct: 1
          },
          {
            q: "«Спокойной ночи» / «Добрый вечер»:",
            options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"],
            correct: 2
          },
          {
            q: "«Se llama» — это форма для:",
            options: ["Я", "Ты", "Он/Она", "Мы"],
            correct: 2
          },
          {
            q: "«Igualmente» означает:",
            options: ["Взаимно!", "Очень приятно", "Как дела?", "До свидания"],
            correct: 0
          },
        ],
      },

      // ── Тема 2 ──────────────────
      {
        title: "🌍 Страны, национальности и глагол SER",
        theory: `*¿De dónde eres? [дэ дондэ эрэс] — Откуда ты?* 🗺

━━━━━━━━━━━━━━━━━━━━
🌐 *СТРАНЫ И НАЦИОНАЛЬНОСТИ*
━━━━━━━━━━━━━━━━━━━━
🇷🇺 Rusia [русиа] → ruso/rusa [русо/руса]
🇪🇸 España [эспанья] → español/española [эспаньоль/эспаньола]
🇫🇷 Francia [франсиа] → francés/francesa [франсэс/франсэса]
🇩🇪 Alemania [алэмания] → alemán/alemana [алэман/алэмана]
🇬🇧 Inglaterra [инглатэрра] → inglés/inglesa [инглэс/инглэса]
🇮🇹 Italia [италиа] → italiano/italiana [итальяно/итальяна]
🇲🇽 México [мэхико] → mexicano/mexicana [мэхикано/мэхикана]
🇦🇷 Argentina [архэнтина] → argentino/argentina

⚠️ *ВАЖНО:* Национальности пишутся с *маленькой* буквы!
Soy ruso ✅ | Soy Ruso ❌

━━━━━━━━━━━━━━━━━━━━
📚 *ГЛАГОЛ SER [сэр] — БЫТЬ (постоянно)*
━━━━━━━━━━━━━━━━━━━━
Yo *soy* [сой] — я
Tú *eres* [эрэс] — ты
Él/Ella *es* [эс] — он/она
Nosotros *somos* [сомос] — мы
Vosotros *sois* [сойс] — вы (Испания)
Ellos *son* [сон] — они

*Soy de Moscú* [сой дэ моску] — Я из Москвы
*Soy rusa* [сой руса] — Я русская

😂 В Испании два глагола «быть»: SER (навсегда) и ESTAR (временно). Ты навсегда русский — SER. Ты временно в Москве — ESTAR. Философия, не грамматика!`,

        exercises: [
          {
            q: "«Она из Мексики» — выбери правильную форму SER:",
            options: ["Yo soy de México", "Ella eres de México", "Ella es de México", "Ella son de México"],
            correct: 2,
            explain: "Ella → es. Запомни: él/ella/usted всегда ES 🚀"
          },
          {
            q: "Женщина из Франции скажет о себе:",
            options: ["Soy francés", "Soy francesa", "Es francesa", "Somos francesas"],
            correct: 1,
            explain: "FrancesA — женский род. FrancéS — мужской. Смотри на окончание! 💁‍♀️"
          },
          {
            q: "«Мы испанцы» — как правильно?",
            options: ["Somos españoles", "Sois españoles", "Son españoles", "Somos español"],
            correct: 0,
            explain: "Nosotros → somos. Множественное число español → españoles 🇪🇸"
          },
          {
            q: "Национальности в испанском пишутся:",
            options: ["С большой буквы", "С маленькой буквы", "Заглавными", "Как угодно"],
            correct: 1,
            explain: "Soy ruso — не Ruso. В отличие от английского, испанский скромен 😌"
          },
        ],

        test: [
          {
            q: "«Nosotros _____ amigos»",
            options: ["soy", "eres", "es", "somos"],
            correct: 3
          },
          {
            q: "«Я из Германии» (женщина):",
            options: ["Soy alemán", "Soy alemana", "Eres alemana", "Es alemana"],
            correct: 1
          },
          {
            q: "«Ellos _____ de Argentina»",
            options: ["soy", "eres", "es", "son"],
            correct: 3
          },
          {
            q: "Как спросить «Откуда ты?»",
            options: ["¿Cómo te llamas?", "¿Dónde estás?", "¿De dónde eres?", "¿Qué haces?"],
            correct: 2
          },
        ],
      },

      // ── Тема 3 ──────────────────
      {
        title: "🔢 Числа, время и дни недели",
        theory: `*¿Qué hora es? [кэ ора эс] — Который час?* ⏰

━━━━━━━━━━━━━━━━━━━━
🔢 *ЧИСЛА 1–20*
━━━━━━━━━━━━━━━━━━━━
1 uno [уно] | 2 dos [дос] | 3 tres [трэс]
4 cuatro [куатро] | 5 cinco [синко] | 6 seis [сэйс]
7 siete [сиэтэ] | 8 ocho [очо] | 9 nueve [нуэвэ]
10 diez [диэс] | 11 once [онсэ] | 12 doce [досэ]
13 trece [трэсэ] | 14 catorce [каторсэ] | 15 quince [кинсэ]
16 dieciséis [диэсисэйс] | 17 diecisiete | 18 dieciocho
19 diecinueve | 20 veinte [вэйнтэ]

━━━━━━━━━━━━━━━━━━━━
⏰ *КОТОРЫЙ ЧАС?*
━━━━━━━━━━━━━━━━━━━━
*Es la una* [эс ла уна] — 1:00 (только для 1!)
*Son las dos* [сон лас дос] — 2:00
*Son las tres y media* [и мэдиа] — 3:30 (y media = и половина)
*Son las cuatro y cuarto* [и куарто] — 4:15 (y cuarto = и четверть)
*Son las cinco menos cuarto* [мэнос] — 4:45 (menos = минус)

━━━━━━━━━━━━━━━━━━━━
📅 *ДНИ НЕДЕЛИ*
━━━━━━━━━━━━━━━━━━━━
lunes [лунэс] — пн | martes [мартэс] — вт
miércoles [миэрколэс] — ср | jueves [хуэвэс] — чт
viernes [виэрнэс] — пт | sábado [сабадо] — сб
domingo [доминго] — вс

😂 *Культурный факт:* Испанцы ужинают в 22:00. Это не лень — это история! В 1940-м Франко перевёл часы под берлинский пояс для солидарности с Гитлером. Традиция осталась. Диктаторы уходят — расписание нет!
🧠 *Лайфхак:* Дни недели — от планет! Lunes = Luna (Луна), Martes = Marte (Марс), Miércoles = Mercurio (Меркурий), Jueves = Júpiter, Viernes = Venus.`,

        exercises: [
          {
            q: "«3 часа» по-испански:",
            options: ["Es la tres", "Son las tres", "Son los tres", "Es las tres"],
            correct: 1,
            explain: "Son las tres — мн.ч. для всех часов кроме одного! Только 1:00 → Es LA una ⏰"
          },
          {
            q: "«Son las seis y media» = ?",
            options: ["6:15", "6:30", "6:45", "7:00"],
            correct: 1,
            explain: "Media [мэдиа] = половина = 30 минут. ¡Muy bien! 🎉"
          },
          {
            q: "Среда по-испански:",
            options: ["martes", "jueves", "miércoles", "viernes"],
            correct: 2,
            explain: "Miércoles [миэрколэс] — от Меркурия. Самый длинный и самый сложный день! 🪐"
          },
          {
            q: "Число 15 по-испански:",
            options: ["catorce", "quince", "doce", "trece"],
            correct: 1,
            explain: "Quince [кинсэ] — 15. Catorce = 14, Trece = 13, Doce = 12 🔢"
          },
        ],

        test: [
          {
            q: "«¿Qué hora es?» = ?",
            options: ["Какой сегодня день?", "Который час?", "Сколько тебе лет?", "Как дела?"],
            correct: 1
          },
          {
            q: "«Es la una» используется для:",
            options: ["2 часов", "12 часов", "1 часа", "любого часа"],
            correct: 2
          },
          {
            q: "«Без четверти пять» = ?",
            options: ["Son las cinco y cuarto", "Son las cinco menos cuarto", "Son las cuatro y media", "Es la cinco"],
            correct: 1
          },
          {
            q: "Пятница по-испански:",
            options: ["sábado", "jueves", "viernes", "lunes"],
            correct: 2
          },
        ],
      },

      // ── Тема 4 ──────────────────
      {
        title: "🍽️ В ресторане и базовый словарь еды",
        theory: `*¡A comer! [а комэр] — Идём есть!* 🍷

━━━━━━━━━━━━━━━━━━━━
🍴 *В РЕСТОРАНЕ*
━━━━━━━━━━━━━━━━━━━━
*¿Tiene mesa para dos?* [тиэнэ мэса пара дос] — Столик на двоих?
*La carta, por favor* [ла карта, пор фавор] — Меню, пожалуйста
*¿Qué recomienda?* [кэ рэкомиэнда] — Что посоветуете?
*Quisiera...* [кисиэра] — Я бы хотел/а... (вежливо!)
*Para mí, ...* [пара ми] — Для меня...
*La cuenta, por favor* [ла куэнта] — Счёт, пожалуйста
*¿Está incluido el servicio?* — Чаевые включены?

━━━━━━━━━━━━━━━━━━━━
🥘 *ЕДА И НАПИТКИ*
━━━━━━━━━━━━━━━━━━━━
el agua [эль агуа] — вода 💧
el vino tinto [винo тинто] — красное вино 🍷
el vino blanco [бланко] — белое вино
la cerveza [сэрвэса] — пиво 🍺
la paella [паэлья] — паэлья (рис с морепродуктами/мясом)
el jamón [хамон] — хамон (вяленая свинина) 🐷
la tortilla española [тортилья эспаньола] — испанский омлет с картошкой
el bocadillo [бокадилько] — бутерброд на багете
las tapas [тапас] — закуски (система маленьких блюд)

━━━━━━━━━━━━━━━━━━━━
💡 *ВАЖНЫЕ РАЗЛИЧИЯ*
━━━━━━━━━━━━━━━━━━━━
La carta = меню 📋
La cuenta = счёт 💸
(Перепутаешь — официант уйдёт за меню вместо счёта 😅)

😂 *Культурный факт:* Jamón ibérico (иберийский хамон) стоит до 300€ за ногу. В средневековье его вешали в окнах как доказательство христианской веры. Теперь вешают ради вкуса. Прогресс!
🥚 *Tortilla española* — это НЕ мексиканская лепёшка. Это омлет с картошкой. Самая частая ошибка туристов — заказать «блинчики» и получить омлет 🤯`,

        exercises: [
          {
            q: "Как попросить счёт?",
            options: ["La carta, por favor", "La cuenta, por favor", "El menú, por favor", "La mesa, por favor"],
            correct: 1,
            explain: "La cuenta [ла куэнта] = счёт! La carta = меню. Не путай — иначе придётся ещё раз заказывать 😅"
          },
          {
            q: "«Красное вино» по-испански:",
            options: ["vino blanco", "vino rosado", "vino tinto", "vino negro"],
            correct: 2,
            explain: "Tinto [тинто] = красный (для вина). Blanco = белое, Rosado = розовое 🍷"
          },
          {
            q: "Tortilla española — это:",
            options: ["Мексиканская лепёшка", "Омлет с картошкой", "Блин с сыром", "Пицца"],
            correct: 1,
            explain: "Омлет с картофелем и луком! Не мексиканская лепёшка 🤯 Добро пожаловать в Испанию!"
          },
          {
            q: "Вежливая форма «я хочу» в ресторане:",
            options: ["Quiero", "Quisiera", "Quieres", "Queremos"],
            correct: 1,
            explain: "Quisiera [кисиэра] = «я бы хотел» — вежливо и элегантно. Quiero = хочу (по-детски прямо) 🎩"
          },
        ],

        test: [
          {
            q: "«Para mí» = ?",
            options: ["Для тебя", "Для него", "Для меня", "Для нас"],
            correct: 2
          },
          {
            q: "«¿Qué recomienda?» = ?",
            options: ["Что вы хотите?", "Что посоветуете?", "Что это?", "Сколько стоит?"],
            correct: 1
          },
          {
            q: "El jamón — это:",
            options: ["Морепродукты", "Курица в соусе", "Вяленая свинина", "Сыр"],
            correct: 2
          },
          {
            q: "Las tapas — это:",
            options: ["Крышки от посуды", "Маленькие закуски", "Вид пасты", "Десерт"],
            correct: 1
          },
        ],
      },
    ],
  },

  // ══════════════════════════════
  //  A2
  // ══════════════════════════════
  A2: {
    emoji: "🌿",
    label: "A2 — Despegando",
    topics: [
      // ── Тема 1 ──────────────────
      {
        title: "⏮️ Прошедшее время — Что ты делал вчера?",
        theory: `*Pretérito Indefinido [прэтэрито индэфинидо] — Завершённое прошедшее* 📅

━━━━━━━━━━━━━━━━━━━━
📌 *КОГДА ИСПОЛЬЗОВАТЬ*
━━━━━━━━━━━━━━━━━━━━
Однократные завершённые действия в прошлом:
✅ «Я вчера поел пиццу» (раз, и всё)
✅ «Она купила машину» (завершённый факт)
❌ Привычки и повторяющиеся действия → другое время!

━━━━━━━━━━━━━━━━━━━━
📚 *ПРАВИЛЬНЫЕ ГЛАГОЛЫ*
━━━━━━━━━━━━━━━━━━━━
*-AR* (hablar [аблар] — говорить):
yo hablé [аблэ] | tú hablaste [абластэ]
él/ella habló | nosotros hablamos | ellos hablaron

*-ER/-IR* (comer [комэр] — есть):
yo comí [коми] | tú comiste [комистэ]
él/ella comió | nosotros comimos | ellos comieron

━━━━━━━━━━━━━━━━━━━━
🔑 *МАРКЕРЫ ВРЕМЕНИ*
━━━━━━━━━━━━━━━━━━━━
ayer [айэр] — вчера
la semana pasada [сэмана пасада] — на прошлой неделе
hace dos días [асэ дос диас] — два дня назад
el año pasado [аньо пасадо] — в прошлом году
el lunes [эль лунэс] — в понедельник (прошедший)

━━━━━━━━━━━━━━━━━━━━
⚡ *НЕПРАВИЛЬНЫЕ (важнейшие!)*
━━━━━━━━━━━━━━━━━━━━
*ir* [ир] и *ser* [сэр] → одинаковые формы (!):
fui [фуи], fuiste, fue, fuimos, fueron
(Контекст подскажет — «пошёл» или «был»!)

hacer [асэр] → hice, hiciste, hizo, hicimos, hicieron
tener [тэнэр] → tuve, tuviste, tuvo, tuvimos, tuvieron

😂 *Факт:* IR и SER в прошедшем абсолютно одинаковые. Испанцы придумали это специально, чтобы иностранцы никогда не расслаблялись 🤡`,

        exercises: [
          {
            q: "«Вчера я говорил с другом» — выбери правильную форму:",
            options: ["Ayer hablo con mi amigo", "Ayer hablé con mi amigo", "Ayer hablaba con mi amigo", "Ayer hablaré con mi amigo"],
            correct: 1,
            explain: "Hablé [аблэ] — Indefinido для YO от hablar. Ayer = маркер этого времени 🎯"
          },
          {
            q: "«Она купила книгу»:",
            options: ["compró un libro", "compraba un libro", "compra un libro", "comprará un libro"],
            correct: 0,
            explain: "Compró [компро] — третье лицо ед.ч. Indefinido от comprar 💪"
          },
          {
            q: "«Hace dos días» = ?",
            options: ["Через два дня", "Два дня назад", "Каждые два дня", "Два дня подряд"],
            correct: 1,
            explain: "Hace + время = [время] НАЗАД! Hace = «тому назад» 🕐"
          },
          {
            q: "«Они пошли в кино» (ir):",
            options: ["iban al cine", "van al cine", "fueron al cine", "irán al cine"],
            correct: 2,
            explain: "Fueron [фуэрон] — мн.ч. от ir/ser в Indefinido. Контекст: «пошли» 🎬"
          },
        ],

        test: [
          {
            q: "Маркер Pretérito Indefinido:",
            options: ["siempre", "todos los días", "ayer", "cuando era niño"],
            correct: 2
          },
          {
            q: "«Ты купил книгу»:",
            options: ["compras", "comprabas", "compraste", "comprarás"],
            correct: 2
          },
          {
            q: "«Fui» — форма глагола:",
            options: ["saber", "tener", "ir/ser", "hacer"],
            correct: 2
          },
          {
            q: "«Ellos hablaron» = ?",
            options: ["они говорят сейчас", "они говорили (завершённо)", "они говорили обычно", "они будут говорить"],
            correct: 1
          },
        ],
      },

      // ── Тема 2 ──────────────────
      {
        title: "🌅 Imperfecto — Детство и воспоминания",
        theory: `*Pretérito Imperfecto [импэрфэкто] — Незавершённое прошлое* 😌

━━━━━━━━━━━━━━━━━━━━
📌 *КОГДА ИСПОЛЬЗОВАТЬ*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Привычки прошлого («я ВСЕГДА делал это»)
2️⃣ Описание фона («была ночь, шёл дождь»)
3️⃣ Возраст и состояние («мне было 10 лет»)
4️⃣ Незавершённое действие в момент другого

━━━━━━━━━━━━━━━━━━━━
📚 *ОКОНЧАНИЯ*
━━━━━━━━━━━━━━━━━━━━
*-AR* (hablar):
hablaba [аблаба], hablabas, hablaba, hablábamos, hablaban

*-ER/-IR* (comer):
comía [комиа], comías, comía, comíamos, comían

━━━━━━━━━━━━━━━━━━━━
🔑 *МАРКЕРЫ*
━━━━━━━━━━━━━━━━━━━━
siempre [сиэмпрэ] — всегда
antes [антэс] — раньше
todos los días [тодос лос диас] — каждый день
de pequeño/a [дэ пэкэньо] — в детстве
cuando era niño [куандо эра нинью] — когда был ребёнком

━━━━━━━━━━━━━━━━━━━━
⚡ *ТОЛЬКО 3 НЕПРАВИЛЬНЫХ!* 🎉
━━━━━━━━━━━━━━━━━━━━
*ser* → era, eras, era, éramos, eran [эра, эрас...]
*ir* → iba, ibas, iba, íbamos, iban [иба, ибас...]
*ver* → veía, veías, veía, veíamos, veían [вэиа...]

😄 *Сравнение:*
comí = съел (один раз, всё) → Indefinido
comía = ел (обычно, привычка) → Imperfecto

😂 Испанский Imperfecto — это машина времени в детство. «Cuando era niña, comía pizza todos los días» = «В детстве я каждый день ела пиццу». Ностальгия на грамматическом уровне!`,

        exercises: [
          {
            q: "«Я всегда ел пиццу в детстве»:",
            options: ["Siempre comí pizza de pequeño", "Siempre comía pizza de pequeño", "Siempre comeré pizza", "Siempre como pizza"],
            correct: 1,
            explain: "Siempre + привычка в прошлом = Imperfecto! Comía [комиа] 🍕"
          },
          {
            q: "«Era» — форма глагола:",
            options: ["estar", "tener", "ir", "ser"],
            correct: 3,
            explain: "Era [эра] — Imperfecto от SER. Помни: только ser, ir, ver — неправильные! 👦"
          },
          {
            q: "«Мне было 10 лет»:",
            options: ["Tengo 10 años", "Tuve 10 años", "Tenía 10 años", "Tendré 10 años"],
            correct: 2,
            explain: "Tenía [тэниа] — Imperfecto от tener. Возраст в прошлом всегда Imperfecto! 🎂"
          },
          {
            q: "Imperfecto НЕ используется для:",
            options: ["описания погоды в прошлом", "одного завершённого события", "привычек прошлого", "возраста в прошлом"],
            correct: 1,
            explain: "Одно завершённое событие = Indefinido! Для этого и нужны два прошедших времени 🎯"
          },
        ],

        test: [
          {
            q: "«Раньше я жил в Москве»:",
            options: ["Antes vivía en Moscú", "Antes viví en Moscú", "Antes vivo en Moscú", "Antes viviré en Moscú"],
            correct: 0
          },
          {
            q: "«Iba» — форма глагола:",
            options: ["hablar", "ir", "ver", "ser"],
            correct: 1
          },
          {
            q: "Маркер Imperfecto:",
            options: ["ayer", "hace dos días", "siempre", "el año pasado"],
            correct: 2
          },
          {
            q: "«Todos los días comía» = ?",
            options: ["Однажды поел", "Ел каждый день (привычка)", "Буду есть", "Ем сейчас"],
            correct: 1
          },
        ],
      },

      // ── Тема 3 ──────────────────
      {
        title: "🏥 Здоровье и у врача",
        theory: `*¿Cómo te encuentras? [комо тэ энкуэнтрас] — Как ты себя чувствуешь?* 🩺

━━━━━━━━━━━━━━━━━━━━
💊 *У ВРАЧА*
━━━━━━━━━━━━━━━━━━━━
*Me duele...* [мэ дуэлэ] — У меня болит... (ед.ч.)
*Me duelen...* [мэ дуэлэн] — У меня болят... (мн.ч.)
*Tengo fiebre* [тэнго фиэврэ] — У меня температура 🌡
*Tengo tos* [тос] — У меня кашель
*Tengo náuseas* [науcэас] — Меня тошнит
*Me siento mal* [мэ сиэнто маль] — Я плохо себя чувствую
*Me siento bien* [биэн] — Я хорошо себя чувствую
*¿Qué le pasa?* [кэ лэ паса] — Что с вами? (врач спрашивает)
*Desde hace tres días* [дэсдэ асэ трэс диас] — Уже три дня

━━━━━━━━━━━━━━━━━━━━
🦴 *ЧАСТИ ТЕЛА*
━━━━━━━━━━━━━━━━━━━━
la cabeza [кабэса] — голова
la garganta [гарганта] — горло
el estómago [эстомаго] — живот
la espalda [эспальда] — спина
el pecho [пэчо] — грудь
el brazo [брасо] — рука (от плеча)
la pierna [пиэрна] — нога
la rodilla [родилья] — колено
el oído [оидо] — ухо (внутри)
la oreja [орэха] — ухо (снаружи)

━━━━━━━━━━━━━━━━━━━━
📚 *ГРАММАТИКА: DOLER [долэр]*
━━━━━━━━━━━━━━━━━━━━
Работает как gustar — субъект ПОСЛЕ глагола!
Me *duele* la cabeza (голова — ед.ч. → duele)
Me *duelen* los pies (ноги — мн.ч. → duelen)

В аптеке: *el medicamento* [мэдикамэнто] — лекарство
*la receta* [рэсэта] — рецепт | *la farmacia* [фармасиа] — аптека

😂 *Факт:* В Испании farmacia = зелёный крест. Войдёшь с ангиной — выйдешь с витаминами C и советом «пей воду и отдыхай». Испанская медицина оптимистична!`,

        exercises: [
          {
            q: "«У меня болит голова»:",
            options: ["Me duelen la cabeza", "Me duele la cabeza", "Tengo cabeza", "Me dolor cabeza"],
            correct: 1,
            explain: "Duele [дуэлэ] — ед.ч., т.к. голова одна. Duelen — для мн.ч. 🧠"
          },
          {
            q: "«У меня кашель»:",
            options: ["Tengo tos", "Tengo gripe", "Estoy tos", "Me duele tos"],
            correct: 0,
            explain: "Tengo tos [тэнго тос] — «у меня кашель». Tos = кашель 😷"
          },
          {
            q: "«Me duelen las piernas» — почему DUELEN?",
            options: ["С me всегда duelen", "Piernas — мн.ч.", "Глагол всегда во мн.ч.", "Это ошибка"],
            correct: 1,
            explain: "Piernas [пиэрнас] = ноги (мн.ч.) → duelen. Duele/duelen согласуется с болящей частью тела! 🦵"
          },
          {
            q: "«Рецепт» по-испански:",
            options: ["la farmacia", "el médico", "la receta", "el hospital"],
            correct: 2,
            explain: "La receta [рэсэта] = рецепт. Farmacia = аптека, Médico = врач 📋"
          },
        ],

        test: [
          {
            q: "«Мне плохо»:",
            options: ["Me siento bien", "Me siento mal", "Estoy bien", "Tengo bien"],
            correct: 1
          },
          {
            q: "«¿Qué le pasa?» — кто кому говорит?",
            options: ["Пациент врачу", "Врач пациенту", "Аптекарь покупателю", "Друг другу"],
            correct: 1
          },
          {
            q: "«У меня температура»:",
            options: ["Tengo fiebre", "Me duele fiebre", "Estoy fiebre", "Tengo frío"],
            correct: 0
          },
          {
            q: "La farmacia — это:",
            options: ["Больница", "Кабинет врача", "Аптека", "Страховка"],
            correct: 2
          },
        ],
      },

      // ── Тема 4 ──────────────────
      {
        title: "🛍️ Шопинг и покупки",
        theory: `*¡Vamos de compras! [вамос дэ компрас] — Идём по магазинам!* 🏬

━━━━━━━━━━━━━━━━━━━━
💬 *ФРАЗЫ В МАГАЗИНЕ*
━━━━━━━━━━━━━━━━━━━━
*¿Cuánto cuesta?* [куанто куэста] — Сколько стоит? (ед.ч.)
*¿Cuánto cuestan?* [куэстан] — Сколько стоят? (мн.ч.)
*¿Tiene esto en otra talla?* [тенэ эсто эн отра талья] — Есть в другом размере?
*¿Puedo probármelo?* [пуэдо пробармэло] — Можно примерить?
*Me queda bien* [мэ кэда биэн] — Мне подходит / Мне идёт 👍
*Me queda mal* — Не подходит 👎
*Me lo llevo* [мэ ло йэво] — Я это возьму 🛒
*¿Aceptan tarjeta?* [асэптан тархэта] — Принимаете карту?
*En efectivo* [эн эфэктиво] — Наличными
*¿Hay rebajas?* [ай рэбахас] — Есть скидки?

━━━━━━━━━━━━━━━━━━━━
💰 *ЧИСЛА ДЛЯ ЦЕН*
━━━━━━━━━━━━━━━━━━━━
30 treinta [трэинта] | 40 cuarenta [куарэнта]
50 cincuenta [синкуэнта] | 60 sesenta [сэсэнта]
70 setenta [сэтэнта] | 80 ochenta [очэнта]
90 noventa [новэнта] | 100 cien [сиэн]
200 doscientos | 1000 mil [миль]

━━━━━━━━━━━━━━━━━━━━
👗 *ПРИЛАГАТЕЛЬНЫЕ*
━━━━━━━━━━━━━━━━━━━━
caro/a [каро] — дорогой | barato/a [барато] — дешёвый
grande [грандэ] — большой | pequeño/a [пэкэньо] — маленький
nuevo/a [нуэво] — новый | rebajado/a [рэбахадо] — со скидкой

😂 *Культурный факт:* Mercadona — супермаркет, который в Испании — не просто магазин, а образ жизни. Испанцы спорят о нём как о религии: «бренды Hacendado лучше оригиналов!» Если хочешь завоевать испанца — поддержи Mercadona в разговоре.
🛍️ *Rebajas* (январь и июль) — ГЛАВНОЕ событие года. Испанцы очереди занимают с ночи. Чёрная пятница? Не слышали!`,

        exercises: [
          {
            q: "Как спросить цену одного товара?",
            options: ["¿Cuánto cuestan?", "¿Cuánto cuesta?", "¿Cómo se llama?", "¿Dónde está?"],
            correct: 1,
            explain: "¿Cuánto cuesta? [куанто куэста] — ед.ч. Cuestan — мн.ч. (несколько товаров) 💰"
          },
          {
            q: "«Me lo llevo» = ?",
            options: ["Я смотрю", "Я примеряю", "Я это возьму", "Я ухожу"],
            correct: 2,
            explain: "Me lo llevo [мэ ло йэво] = буквально «я это несу с собой» = беру! 🛍️"
          },
          {
            q: "«Me queda mal» = ?",
            options: ["Мне нравится", "Не подходит / Не идёт", "Дорого", "Мне плохо"],
            correct: 1,
            explain: "Quedar [кэдар] = подходить об одежде. Mal = плохо → не подходит 👗"
          },
          {
            q: "100 по-испански (отдельно стоящее):",
            options: ["ciento", "cien", "cientos", "cent"],
            correct: 1,
            explain: "Cien [сиэн] — ровно 100. Ciento — в составе: 101 = ciento uno 🔢"
          },
        ],

        test: [
          {
            q: "«Naличными» = ?",
            options: ["con tarjeta", "en efectivo", "con descuento", "a crédito"],
            correct: 1
          },
          {
            q: "«¿Hay rebajas?» = ?",
            options: ["Где примерочная?", "Есть скидки?", "Какой размер?", "Можно вернуть?"],
            correct: 1
          },
          {
            q: "«Barato» = ?",
            options: ["Дорогой", "Новый", "Дешёвый", "Красивый"],
            correct: 2
          },
          {
            q: "«¿Puedo probármelo?» — просьба:",
            options: ["Посмотреть на товар", "Примерить одежду", "Купить товар", "Вернуть покупку"],
            correct: 1
          },
        ],
      },
    ],
  },

  // ══════════════════════════════
  //  B1
  // ══════════════════════════════
  B1: {
    emoji: "🌊",
    label: "B1 — Intermedio",
    topics: [
      // ── Тема 1 ──────────────────
      {
        title: "😱 Subjuntivo — Добро пожаловать в кошмар",
        theory: `*El Subjuntivo [субхунтиво] — Сослагательное наклонение* 🎭

━━━━━━━━━━━━━━━━━━━━
🤔 *ЧТО ЭТО ТАКОЕ?*
━━━━━━━━━━━━━━━━━━━━
Индикатив = реальность («он приходит»)
Субхунтиво = желания, эмоции, сомнения, рекомендации

━━━━━━━━━━━━━━━━━━━━
🎯 *ПРАВИЛО WEIRDO*
━━━━━━━━━━━━━━━━━━━━
*W* — Wishes (желания): querer que, desear que
*E* — Emotion (эмоции): alegrarse de que, tener miedo de que
*I* — Impersonal: es importante que, es necesario que
*R* — Recommendation: recomendar que, aconsejar que
*D* — Doubt/Denial: no creer que, dudar que
*O* — Ojalá [охала] (дай бог/хоть бы)

━━━━━━━━━━━━━━━━━━━━
📚 *ФОРМЫ PRESENTE SUBJUNTIVO*
━━━━━━━━━━━━━━━━━━━━
*-AR* (hablar): hable, hables, hable, hablemos, hablen
*-ER/-IR* (comer): coma, comas, coma, comamos, coman

🔑 *Лайфхак:* возьми yo-форму Presente (hablo, como), убери -o, добавь «противоположные» окончания:
AR-глагол → окончания -e (как у ER)
ER/IR-глагол → окончания -a (как у AR)

━━━━━━━━━━━━━━━━━━━━
⚡ *ГЛАВНОЕ ПРАВИЛО*
━━━━━━━━━━━━━━━━━━━━
*Два субъекта + que → Subjuntivo!*
Quiero *venir* ✅ (я хочу сам прийти — 1 субъект)
Quiero que *vengas* ✅ (я хочу, чтобы ТЫ пришёл — 2 субъекта)

😂 Испанцы используют Subjuntivo в 40% разговорной речи. Без него ты говоришь правильно, но звучишь как инструкция к холодильнику!
🎭 Ojalá [охала] — от арабского «иншалла». Испания 8 веков под арабами — следы в языке повсюду!`,

        exercises: [
          {
            q: "«Quiero que tú _____ (venir)»:",
            options: ["vienes", "vengas", "viene", "venís"],
            correct: 1,
            explain: "Два субъекта (yo quiero, tú vienes) + que → Subjuntivo! Vengas [вэнгас] ✅"
          },
          {
            q: "Где нужен Subjuntivo?",
            options: ["Creo que es verdad", "Veo que trabaja mucho", "No creo que sea verdad", "Sé que viene mañana"],
            correct: 2,
            explain: "No creer que + Subjuntivo (Doubt в WEIRDO). Sea [сэа] — Subjuntivo от ser 🔄"
          },
          {
            q: "«Es importante que _____ (estudiar)»:",
            options: ["estudias", "estudies", "estudiás", "estudia"],
            correct: 1,
            explain: "Es importante que + Subjuntivo (Impersonal = I в WEIRDO). Estudies [эстудиэс] 📚"
          },
          {
            q: "«Ojalá» требует после себя:",
            options: ["Indicativo", "Subjuntivo", "Infinitivo", "Futuro"],
            correct: 1,
            explain: "Ojalá [охала] + Subjuntivo — ВСЕГДА, без исключений! Ojalá venga = Дай бог придёт 🌙"
          },
        ],

        test: [
          {
            q: "«Te recomiendo que _____ (descansar)»:",
            options: ["descansas", "descansarás", "descanses", "descansa"],
            correct: 2
          },
          {
            q: "«Me alegra que estés aquí» — почему Subjuntivo?",
            options: ["После que всегда Subj.", "Эмоция (E в WEIRDO)", "Это желание", "Это сомнение"],
            correct: 1
          },
          {
            q: "Subjuntivo от COMER для nosotros:",
            options: ["comemos", "comamos", "comermos", "comimos"],
            correct: 1
          },
          {
            q: "«Quiero venir» vs «Quiero que vengas» — разница:",
            options: ["Нет разницы, только стиль", "Я хочу прийти сам / хочу, чтобы ты пришёл", "Разное время", "Разная вежливость"],
            correct: 1
          },
        ],
      },

      // ── Тема 2 ──────────────────
      {
        title: "💬 Мнение, спор и дискуссия",
        theory: `*¡A debatir! [а дэбатир] — Спорим по-испански!* 🗣️

━━━━━━━━━━━━━━━━━━━━
💭 *ВЫРАЖЕНИЕ МНЕНИЯ*
━━━━━━━━━━━━━━━━━━━━
*En mi opinión* [эн ми опинион] — По моему мнению
*Creo que* [крэо кэ] — Я думаю, что... (+Indicativo)
*Me parece que* [мэ парэсэ кэ] — Мне кажется, что...
*Estoy convencido/a de que* [конвэнсидо] — Я убеждён/а, что...
*Desde mi punto de vista* [дэсдэ ми пунто дэ виста] — С моей точки зрения

━━━━━━━━━━━━━━━━━━━━
✅❌ *СОГЛАСИЕ / НЕСОГЛАСИЕ*
━━━━━━━━━━━━━━━━━━━━
*Estoy de acuerdo* [эстой дэ акуэрдо] — Согласен/на
*No estoy de acuerdo* — Не согласен/на
*Tienes razón* [тиэнэс расон] — Ты прав/а
*No tienes razón* — Ты не прав/а
*Exactamente* [эксактамэнтэ] — Именно! Точно!
*En parte, sí, pero...* — Отчасти да, но...

━━━━━━━━━━━━━━━━━━━━
🔄 *СВЯЗКИ ДЛЯ ДИСКУССИИ*
━━━━━━━━━━━━━━━━━━━━
*Por un lado...* [пор ун ладо] — С одной стороны...
*Por otro lado...* — С другой стороны...
*Sin embargo* [син эмбарго] — Тем не менее / Однако
*A pesar de (que)* [а пэсар дэ] — Несмотря на (то, что)
*Además* [адэмас] — Кроме того
*Por lo tanto* [пор ло танто] — Поэтому / Следовательно

━━━━━━━━━━━━━━━━━━━━
⚠️ *ВАЖНО: Creo que + Indicativo*
━━━━━━━━━━━━━━━━━━━━
Creo que *es* verdad ✅ (я думаю, это правда — утверждение)
No creo que *sea* verdad ✅ (сомнение → Subjuntivo)

😂 *Культурный факт:* Испанское кафе — место для tertulia [тэртулиа] — беседы часами без цели и результата. Спорить о футболе, политике и еде — национальный спорт. Проигравших нет, потому что цели тоже нет!
🎯 «Sin embargo» — учи наизусть! Это слово ты будешь слышать в каждом испанском разговоре минимум 5 раз.`,

        exercises: [
          {
            q: "«Ты прав» по-испански:",
            options: ["Estás correcto", "Tienes razón", "Eres razón", "Tienes correcto"],
            correct: 1,
            explain: "Tener razón [тэнэр расон] = иметь правоту = быть правым. Razón = правота/разум 🧠"
          },
          {
            q: "«Тем не менее / Однако»:",
            options: ["Por lo tanto", "Sin embargo", "Por ejemplo", "Además"],
            correct: 1,
            explain: "Sin embargo [син эмбарго] — выучи наизусть! Одно из самых частых слов в испанском 📝"
          },
          {
            q: "«Creo que» + ?",
            options: ["Subjuntivo всегда", "Indicativo (утверждение)", "Infinitivo", "Condicional"],
            correct: 1,
            explain: "Creo que + Indicativo (я верю в реальность). НО: No creo que + Subjuntivo (сомнение) 💡"
          },
          {
            q: "«En parte, sí, pero...» выражает:",
            options: ["Полное согласие", "Полное несогласие", "Частичное согласие с возражением", "Безразличие"],
            correct: 2,
            explain: "Дипломатичный способ не согласиться, не обидев собеседника. Высший пилотаж! 🤝"
          },
        ],

        test: [
          {
            q: "«Estoy de acuerdo» = ?",
            options: ["Я согласен/на", "Я не согласен/на", "Я не понимаю", "Мне всё равно"],
            correct: 0
          },
          {
            q: "«A pesar de que» = ?",
            options: ["Из-за того что", "Несмотря на то что", "Потому что", "Если"],
            correct: 1
          },
          {
            q: "«Por un lado» = ?",
            options: ["Напротив", "С одной стороны", "Кроме того", "Например"],
            correct: 1
          },
          {
            q: "«No tienes razón» = ?",
            options: ["Ты прав", "Ты не прав", "У тебя нет разума", "Я не понимаю"],
            correct: 1
          },
        ],
      },

      // ── Тема 3 ──────────────────
      {
        title: "😎 Разговорный испанский и сленг",
        theory: `*¡Habla como un nativo! [аблa комо ун нативо] — Говори как местный!* 🏙️

━━━━━━━━━━━━━━━━━━━━
🇪🇸 *ИСПАНСКИЙ СЛЕНГ (Испания)*
━━━━━━━━━━━━━━━━━━━━
*¡Qué guay!* [кэ гуай] — Как круто! 😎
*¡Mola mazo!* [мола масо] — Очень круто! (molar = быть крутым)
*Tío / Tía* [тио/тиа] — Чувак / Чувиха (буквально «дядя/тётя»)
*Flipar* [флипар] — сойти с ума от восторга / обалдеть
*Mogollón de* [могольон дэ] — куча, очень много
*¡Venga!* [вэнга] — Давай! / Окей! / Пошли! / Пока! / Ладно!
*¡Qué rollo!* [кэ ролло] — Как скучно! / Какая тягомотина!
*Estar hecho polvo* [эстар эчо польво] — быть в хлам уставшим
*Pasarlo bien/mal* [пасарло биэн/маль] — хорошо/плохо провести время
*¡Qué fuerte!* [кэ фуэртэ] — Вот это да! / Ничего себе!

━━━━━━━━━━━━━━━━━━━━
🌎 *ЛАТИНСКАЯ АМЕРИКА*
━━━━━━━━━━━━━━━━━━━━
*¡Qué chévere!* [кэ чэвэрэ] 🇨🇴 (Колумбия) — Классно!
*¡Órale!* [оралэ] 🇲🇽 (Мексика) — Давай! / Точно!
*Güey/Wey* [вэй] 🇲🇽 (Мексика) — Чувак
*¡Buena onda!* 🇦🇷 (Аргентина) — Хорошая атмосфера/человек
*¡Qué bacano!* 🇨🇴 (Колумбия) — Круто!

━━━━━━━━━━━━━━━━━━━━
💡 *ПОЛЕЗНЫЕ РАЗГОВОРНЫЕ ФРАЗЫ*
━━━━━━━━━━━━━━━━━━━━
*¿Qué pasa?* [кэ паса] — Что происходит? / Как дела? (неформально)
*No pasa nada* [но паса нада] — Ничего страшного / Всё ок
*¡Venga va!* [вэнга ва] — Ладно, договорились!
*A ver* [а вэр] — Посмотрим / Ну-ка / Хм...

😂 «Venga» — самое универсальное слово Испании. Подсчитано: среднестатистический испанец говорит «venga» 47 раз в день. Один звук — вся палитра согласия, прощания и воодушевления!
😎 *Tío/Tía* в сленге давно потеряли родственный смысл. Скажи испанцу «¡Eres un tío genial!» — он поймёт «Ты классный чувак!», а не «Ты отличный дядя» 😄`,

        exercises: [
          {
            q: "«¡Mola mazo!» = ?",
            options: ["Как скучно", "Очень круто", "Куча народу", "Пошли!"],
            correct: 1,
            explain: "Molar [молар] = быть крутым. Mazo [масо] = очень (сленг). Вместе = мегакруто! 🔥"
          },
          {
            q: "«¡Qué rollo!» = ?",
            options: ["Как интересно!", "Как скучно / Какая тягомотина!", "Как круто!", "Сколько народу!"],
            correct: 1,
            explain: "Rollo [ролло] = скука/тягомотина в сленге. «¡Qué rollo esta reunión!» = Какое скучное собрание! 😩"
          },
          {
            q: "«Estar hecho polvo» = ?",
            options: ["Быть богатым", "Быть в хлам уставшим", "Быть модным", "Быть голодным"],
            correct: 1,
            explain: "Hecho polvo [эчо польво] = буквально «стать пылью» = выжатый как лимон 😵"
          },
          {
            q: "«Güey/Wey» — сленг из:",
            options: ["Испании", "Аргентины", "Мексики", "Колумбии"],
            correct: 2,
            explain: "Wey [вэй] — мексиканский сленг для «чувак». В Испании скажут Tío 🇲🇽"
          },
        ],

        test: [
          {
            q: "«Tío» в испанском сленге = ?",
            options: ["Дядя (родственник)", "Чувак", "Старик", "Друг детства"],
            correct: 1
          },
          {
            q: "«¡Venga!» используется как:",
            options: ["Только «пошли»", "Только «пока»", "Только «окей»", "Всё из перечисленного и ещё"],
            correct: 3
          },
          {
            q: "«No pasa nada» = ?",
            options: ["Ничего не происходит (буквально)", "Всё в порядке / Ничего страшного", "Ничего не получается", "Нечего делать"],
            correct: 1
          },
          {
            q: "«¡Qué chévere!» — выражение из:",
            options: ["Испании", "Мексики", "Колумбии / Венесуэлы", "Аргентины"],
            correct: 2
          },
        ],
      },

      // ── Тема 4 ──────────────────
      {
        title: "✈️ Путешествия и туризм",
        theory: `*¡De viaje! [дэ виахэ] — В путь!* 🌍

━━━━━━━━━━━━━━━━━━━━
✈️ *В АЭРОПОРТУ*
━━━━━━━━━━━━━━━━━━━━
el vuelo [эль буэло] — рейс
la escala [ла эскала] — пересадка
la tarjeta de embarque [тархэта дэ эмбаркэ] — посадочный талон
el equipaje [экипахэ] — багаж
la aduana [адуана] — таможня
el pasaporte [пасапортэ] — паспорт
hacer cola [асэр кола] — стоять в очереди (буквально «делать хвост»!)
la salida [салида] — выход | la llegada [йэгада] — прилёт

━━━━━━━━━━━━━━━━━━━━
🏨 *В ОТЕЛЕ*
━━━━━━━━━━━━━━━━━━━━
*¿Tiene habitaciones disponibles?* [абитасионэс диспонивлэс] — Есть свободные номера?
*una habitación doble/individual* — двухместный/одноместный номер
*con desayuno incluido* [дэсайуно инклуидо] — с завтраком включён
*¿Hay wifi?* — Есть вайфай?
*¿A qué hora es el check-out?* — В какое время выезд?

━━━━━━━━━━━━━━━━━━━━
🗺️ *КАК ДОБРАТЬСЯ*
━━━━━━━━━━━━━━━━━━━━
*¿Cómo se llega a...?* [комо сэ йэга] — Как добраться до...?
*Todo recto* [тодо рэкто] — Прямо
*A la derecha* [дэрэча] — Направо
*A la izquierda* [искиэрда] — Налево
*En la esquina* [эн ла эскина] — На углу
*A dos manzanas* [мансанас] — В двух кварталах

😂 *Культурный факт:* Туристы едут в Барселону, а испанцы отдыхают в белых деревнях Андалусии — Ронда, Михас, Фригилиана. «Не понимаем, чего все едут к Гауди, когда есть Андалусия» — типичный мадридец.
🏖️ *Лайфхак:* В Испании «playa» [плайа] = пляж, но каждый регион называет их по-разному. «Platja» в Каталонии, «hondartza» в Стране Басков. Сепаратизм начинается со слова «пляж»!`,

        exercises: [
          {
            q: "«Посадочный талон»:",
            options: ["la aduana", "el pasaporte", "la tarjeta de embarque", "el vuelo"],
            correct: 2,
            explain: "Tarjeta de embarque [тархэта дэ эмбаркэ] = boarding pass. Embarcar = садиться на борт 🛫"
          },
          {
            q: "«Стоять в очереди»:",
            options: ["hacer fila", "hacer cola", "esperar en línea", "estar en fila"],
            correct: 1,
            explain: "Hacer cola [асэр кола] — буквально «делать хвост»! Cola = очередь/хвост 🐒"
          },
          {
            q: "«Con desayuno incluido» = ?",
            options: ["Без завтрака", "С завтраком включён", "Только завтрак", "Завтрак за отдельную плату"],
            correct: 1,
            explain: "Incluido [инклуидо] = включён. Desayuno = завтрак. Мечта любого туриста! 🍳"
          },
          {
            q: "«Todo recto» = ?",
            options: ["Направо", "Налево", "Прямо", "Назад"],
            correct: 2,
            explain: "Todo recto [тодо рэкто] = всё прямо = прямо вперёд 🧭"
          },
        ],

        test: [
          {
            q: "«La escala» в авиации = ?",
            options: ["Шкала/рейтинг", "Пересадка", "Расстояние", "Время полёта"],
            correct: 1
          },
          {
            q: "«¿Cómo se llega a la plaza?»:",
            options: ["Как называется площадь?", "Как добраться до площади?", "Где находится площадь?", "Далеко ли площадь?"],
            correct: 1
          },
          {
            q: "«A la izquierda» = ?",
            options: ["Направо", "Налево", "Прямо", "Назад"],
            correct: 1
          },
          {
            q: "El equipaje — это:",
            options: ["Экипаж", "Багаж", "Снаряжение", "Оборудование"],
            correct: 1
          },
        ],
      },
    ],
  },

  // ══════════════════════════════
  //  B2
  // ══════════════════════════════
  B2: {
    emoji: "🔥",
    label: "B2 — Avanzado",
    topics: [
      // ── Тема 1 ──────────────────
      {
        title: "💭 Condicional — Мечты, гипотезы и вежливость",
        theory: `*El Condicional [кондисиональ] — Условное наклонение* ✨

━━━━━━━━━━━━━━━━━━━━
📌 *КОГДА ИСПОЛЬЗОВАТЬ*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Вежливые просьбы: *¿Podría ayudarme?* = Не могли бы помочь?
2️⃣ Желания: *Me gustaría viajar* = Хотел бы путешествовать
3️⃣ Советы: *En tu lugar, estudiaría más* = На твоём месте учил бы больше
4️⃣ Гипотезы: *Si tuviera dinero, viajaría* = Если бы были деньги, поехал бы

━━━━━━━━━━━━━━━━━━━━
📚 *ОБРАЗОВАНИЕ*
━━━━━━━━━━━━━━━━━━━━
Инфинитив + -ía, -ías, -ía, -íamos, -ían

hablar → hablaría [аблариа], hablarías, hablaría...
comer → comería [комэриа]
vivir → viviría [вивириа]

━━━━━━━━━━━━━━━━━━━━
⚡ *НЕПРАВИЛЬНЫЕ ОСНОВЫ*
━━━━━━━━━━━━━━━━━━━━
poder → podr- → *podría* [подриа]
tener → tendr- → *tendría* [тэндриа]
hacer → har- → *haría* [ариа]
decir → dir- → *diría* [дириа]
salir → saldr- → *saldría* [сальдриа]
venir → vendr- → *vendría* [вэндриа]
saber → sabr- → *sabría* [сабриа]

━━━━━━━━━━━━━━━━━━━━
🔑 *КОНСТРУКЦИЯ SI (ЕСЛИ БЫ)*
━━━━━━━━━━━━━━━━━━━━
Si + *Imperfecto Subjuntivo* + *Condicional*
Si tuviera [тувиэра] dinero, viajaría [виахариа]
(«Если бы были деньги, я бы поехал» — но денег нет 😢)

😂 *Культурный факт:* «Querría un café» vs «Quiero un café» — разница в воспитании. Испанцы в кафетерии Condicional не используют (там всё неформально), но в ресторане *sí, por favor* 🎩
🌟 Me gustaría = Хотел бы. Самая полезная фраза B2-уровня для туриста. Запомни её!`,

        exercises: [
          {
            q: "«Если бы было время, я бы учился»:",
            options: ["Si tengo tiempo, estudiaré", "Si tuviera tiempo, estudiaría", "Si tendría tiempo, estudiaría", "Si tuviera tiempo, estudiara"],
            correct: 1,
            explain: "Si + Imperfecto Subjuntivo (tuviera) + Condicional (estudiaría). Золотое правило! 🏆"
          },
          {
            q: "Condicional от HACER:",
            options: ["hacería", "haría", "harería", "hacía"],
            correct: 1,
            explain: "Hacer → har- (укороченная основа) + -ía = haría [ариа] 💪"
          },
          {
            q: "«¿Podría ayudarme?» — это:",
            options: ["Приказ", "Вежливая просьба", "Гипотеза", "Мечта"],
            correct: 1,
            explain: "Podría [подриа] = Condicional от poder = вежливое «могли бы». Элегантно! 🎩"
          },
          {
            q: "«Me gustaría» = ?",
            options: ["Мне нравится", "Хотел бы / Мне хотелось бы", "Мне нравилось", "Нравилось бы тебе?"],
            correct: 1,
            explain: "Gustar → gustaría = условный вариант «нравиться» = «хотелось бы» 🌟"
          },
        ],

        test: [
          {
            q: "«Saldría» — от глагола:",
            options: ["saber", "salvar", "salir", "saltar"],
            correct: 2
          },
          {
            q: "«En tu lugar, yo...» вводит:",
            options: ["Установленный факт", "Вопрос", "Гипотетический совет", "Приказ"],
            correct: 2
          },
          {
            q: "«Si fuera rico» — fuera от:",
            options: ["ir", "ser", "ir или ser (омоним!)", "estar"],
            correct: 2
          },
          {
            q: "Вежливый эквивалент «quiero» (хочу):",
            options: ["querría", "quería", "querré", "quiero más"],
            correct: 0
          },
        ],
      },

      // ── Тема 2 ──────────────────
      {
        title: "🗣️ Косвенная речь — Estilo indirecto",
        theory: `*Estilo indirecto [эстило индирэкто] — Косвенная речь* 📢

━━━━━━━━━━━━━━━━━━━━
📌 *ЧТО ЭТО?*
━━━━━━━━━━━━━━━━━━━━
Прямая речь: María dijo: «Estoy cansada.»
Косвенная речь: María dijo que *estaba* cansada.

Глаголы: *decir que, contar que, explicar que, preguntar si*

━━━━━━━━━━━━━━━━━━━━
⏰ *СДВИГ ВРЕМЁН*
━━━━━━━━━━━━━━━━━━━━
Presente → Imperfecto
estoy → *estaba* [эстаба]

Futuro → Condicional
vendré → *vendría* [вэндриа]

Pretérito Indefinido → Pluscuamperfecto
llegué → *había llegado* [абиа йэгадо]

Imperativo → que + Imperfecto Subjuntivo
«Ven» → me dijo que *vinieras* [виниэрас]

━━━━━━━━━━━━━━━━━━━━
📅 *ТРАНСФОРМАЦИЯ УКАЗАТЕЛЕЙ*
━━━━━━━━━━━━━━━━━━━━
aquí [акии] → allí [айи] (здесь → там)
hoy [ой] → ese día [эсэ диа] (сегодня → в тот день)
ahora [аора] → entonces [энтонсэс] (сейчас → тогда)
mañana [маньяна] → al día siguiente [сигиэнтэ] (завтра → на следующий день)
ayer [айэр] → el día anterior [антэриор] (вчера → днём ранее)

━━━━━━━━━━━━━━━━━━━━
❓ *ВОПРОСЫ В КОСВЕННОЙ РЕЧИ*
━━━━━━━━━━━━━━━━━━━━
«¿Dónde vives?» → Me preguntó *dónde vivía*
«¿Vienes?» → Me preguntó *si venía* (да/нет → si)

😂 *Факт:* После изучения Estilo indirecto испанские новости становятся понятными! «El presidente dijo que el país *estaba* creciendo» — теперь ты знаешь, что он говорил это ТОГДА. Журналистика = непрерывный Estilo indirecto!`,

        exercises: [
          {
            q: "«Estoy cansado» → él dijo que...",
            options: ["está cansado", "estará cansado", "estaba cansado", "esté cansado"],
            correct: 2,
            explain: "Presente → Imperfecto в косвенной речи. Estaba [эстаба] 📚"
          },
          {
            q: "«Hoy» в косвенной речи → становится:",
            options: ["ahora", "ese día", "entonces", "al día siguiente"],
            correct: 1,
            explain: "Hoy → ese día [эсэ диа] = в тот день. Точка отсчёта смещается! 📅"
          },
          {
            q: "«Ven» (повелительное) → me dijo que...",
            options: ["vengas", "vinieras", "vendrías", "vienes"],
            correct: 1,
            explain: "Imperativo → Imperfecto Subjuntivo: vinieras [виниэрас] ✅"
          },
          {
            q: "«¿Vienes?» (да/нет вопрос) → me preguntó...",
            options: ["qué venía", "si venía", "cuando venía", "cómo venía"],
            correct: 1,
            explain: "Да/нет вопросы в косвенной речи вводятся через SI [си] = «ли». Me preguntó si venía 🎯"
          },
        ],

        test: [
          {
            q: "«Vendré» → dijo que...",
            options: ["vendrá", "vendría", "venga", "vino"],
            correct: 1
          },
          {
            q: "«Aquí» в косвенной речи →",
            options: ["aquí остаётся", "allí", "acá", "ahí"],
            correct: 1
          },
          {
            q: "«Ha llegado» → dijo que...",
            options: ["llegó", "llegaba", "había llegado", "llegaría"],
            correct: 2
          },
          {
            q: "«Ayer» → al día...",
            options: ["siguiente", "anterior", "pasado", "presente"],
            correct: 1
          },
        ],
      },

      // ── Тема 3 ──────────────────
      {
        title: "📝 Аргументация и убеждение",
        theory: `*El arte de argumentar [артэ дэ архумэнтар] — Искусство убеждать* 🎤

━━━━━━━━━━━━━━━━━━━━
🎬 *ВВЕДЕНИЕ ТЕМЫ*
━━━━━━━━━━━━━━━━━━━━
*El tema que vamos a tratar es...* — Тема, которую мы рассмотрим...
*Quisiera plantear la cuestión de...* [кистион] — Хотел бы поднять вопрос о...
*Hoy me gustaría hablar sobre...* — Сегодня я хотел бы поговорить о...

━━━━━━━━━━━━━━━━━━━━
💪 *АРГУМЕНТЫ «ЗА»*
━━━━━━━━━━━━━━━━━━━━
*Cabe destacar que...* [кабэ дэстакар] — Стоит отметить, что...
*Es innegable que...* [эс иннэгаблэ] — Неоспоримо, что...
*Los datos muestran que...* [датос муэстран] — Данные показывают, что...
*No hay que olvidar que...* — Нельзя забывать, что...
*Hay que tener en cuenta que...* — Нужно учитывать, что...

━━━━━━━━━━━━━━━━━━━━
🔄 *КОНТРАРГУМЕНТЫ*
━━━━━━━━━━━━━━━━━━━━
*No obstante...* [но обстантэ] — Тем не менее...
*Por el contrario...* [по эль контрарио] — Напротив...
*Si bien es cierto que..., también lo es que...* — Хотя верно, что..., верно и то, что...
*Sin embargo...* — Однако... (уже знакомое!)

━━━━━━━━━━━━━━━━━━━━
🏁 *ЗАКЛЮЧЕНИЕ*
━━━━━━━━━━━━━━━━━━━━
*En conclusión / En definitiva* [кончлусион/дэфинитива] — В заключение
*Todo ello nos lleva a concluir que...* — Всё это приводит нас к выводу...
*En resumen* [рэсумэн] — Подводя итог

━━━━━━━━━━━━━━━━━━━━
📊 *ССЫЛКИ НА ИСТОЧНИКИ*
━━━━━━━━━━━━━━━━━━━━
*Según los expertos...* [сэгун] — По мнению экспертов...
*De acuerdo con los estudios...* — Согласно исследованиям...
*Como afirma [название]...* — Как утверждает [источник]...

😂 *Культурный факт:* Испанские дебаты — все говорят одновременно. Норма! Побеждает не тот, кто логичнее, а тот, кто громче и с большим количеством «es que, es que, es que». Это тоже аргументация по-испански!`,

        exercises: [
          {
            q: "«Es innegable que» = ?",
            options: ["Невозможно, что", "Неоспоримо, что", "Невероятно, что", "Непонятно, что"],
            correct: 1,
            explain: "Innegable [иннэгаблэ] = неотрицаемое = неоспоримое. In- = отрицание + negable = отрицаемое 💪"
          },
          {
            q: "«En conclusión» используется:",
            options: ["Во введении", "При аргументах", "В заключении", "При примерах"],
            correct: 2,
            explain: "En conclusión [эн кончлусион] = в заключение. Сигнализирует об окончании речи! 🎯"
          },
          {
            q: "«Cabe destacar que» = ?",
            options: ["Стоит отметить, что", "Напротив", "Несмотря на", "Кроме того"],
            correct: 0,
            explain: "Caber [кабэр] = уместиться. Cabe = уместно. Cabe destacar = стоит/уместно отметить 🎓"
          },
          {
            q: "«Si bien es cierto que A..., también lo es que B» выражает:",
            options: ["Полное отрицание A", "Признание A + добавление B", "Простое сравнение", "Только A"],
            correct: 1,
            explain: "Признаём A (да, это правда), но добавляем B (и вот ещё). Дипломатичный контраргумент! ⚖️"
          },
        ],

        test: [
          {
            q: "«Por el contrario» = ?",
            options: ["Кроме того", "Напротив", "Потому что", "Например"],
            correct: 1
          },
          {
            q: "«No obstante» = ?",
            options: ["Тем не менее", "Потому что", "Например", "Кроме того"],
            correct: 0
          },
          {
            q: "«Según los expertos» вводит:",
            options: ["Личное мнение", "Ссылку на источник", "Вывод", "Вопрос"],
            correct: 1
          },
          {
            q: "«Quisiera plantear» — во:",
            options: ["Заключении", "Введении", "Контраргументе", "Примере"],
            correct: 1
          },
        ],
      },

      // ── Тема 4 ──────────────────
      {
        title: "🎭 Идиомы и устойчивые выражения",
        theory: `*Modismos y frases hechas [модисмос и фрасэс эчас] — Идиомы* 🌶️

━━━━━━━━━━━━━━━━━━━━
🎯 *ТОПОВЫЕ ИСПАНСКИЕ ИДИОМЫ*
━━━━━━━━━━━━━━━━━━━━
🐦 *Matar dos pájaros de un tiro* [матар дос пахарос дэ ун тиро]
= убить двух зайцев одним выстрелом

💸 *Costar un ojo de la cara* [костар ун охо дэ ла кара]
= стоить целое состояние (буквально «стоить глаз с лица»!)

✂️ *Tomar el pelo* [томар эль пэло]
= дурачить, водить за нос (буквально «брать за волосы»)

☁️ *Estar en las nubes* [эстар эн лас нубэс]
= витать в облаках, рассеянность

🎭 *Hacer de tripas corazón* [асэр дэ трипас корасон]
= взять себя в руки (буквально «сделать сердце из кишок» 😳)

💪 *No hay mal que por bien no venga* [но ай маль кэ пор биэн но вэнга]
= нет худа без добра

🐌 *Más vale tarde que nunca* [мас валэ тардэ кэ нунка]
= лучше поздно, чем никогда

🪰 *En boca cerrada no entran moscas* [эн бока сэррада]
= молчание — золото (буквально «в закрытый рот мухи не летят»)

━━━━━━━━━━━━━━━━━━━━
🔥 *ЕЩЁ ПОЛЕЗНЫЕ*
━━━━━━━━━━━━━━━━━━━━
*Dar en el clavo* [клаво] = попасть в точку (попасть в гвоздь)
*Estar al loro* [лоро] = быть в курсе, следить (буквально «быть попугаем»!)
*Ponerse las pilas* [пилас] = взяться за ум (буквально «вставить батарейки» 🔋)
*Ser pan comido* [пан комидо] = проще простого (буквально «съеденный хлеб»)

😂 *Испанцы буквально теряют органы от цен:* «Me costó un ojo de la cara» = «Это стоило мне глаза». Экспрессивность — национальная черта!
🌶️ *Факт:* Идиомы — финальный тест настоящего знания языка. Скажи «me han tomado el pelo» вместо «me han engañado» — и испанцы поймут: свой!`,

        exercises: [
          {
            q: "«Matar dos pájaros de un tiro» = ?",
            options: ["Быть жестоким", "Убить двух зайцев одним выстрелом", "Быстро решить проблему силой", "Охотиться"],
            correct: 1,
            explain: "Pájaros [пахарос] = птицы, tiro [тиро] = выстрел. Два дела одним действием! 🎯"
          },
          {
            q: "«Estar en las nubes» = ?",
            options: ["Быть богатым и успешным", "Путешествовать на самолёте", "Витать в облаках / быть рассеянным", "Быть счастливым"],
            correct: 2,
            explain: "В облаках = мысли где-то далеко = рассеянный. «¡Estás en las nubes!» = Ты не в теме! ☁️"
          },
          {
            q: "«Ponerse las pilas» = ?",
            options: ["Зарядить телефон", "Взяться за ум / активизироваться", "Устать", "Заболеть"],
            correct: 1,
            explain: "Pilas [пилас] = батарейки. Вставить батарейки = зарядиться энергией = взяться за ум 🔋"
          },
          {
            q: "«Ser pan comido» = ?",
            options: ["Быть голодным", "Проще простого / раз плюнуть", "Хорошо готовить", "Быть щедрым"],
            correct: 1,
            explain: "Pan comido [пан комидо] = съеденный хлеб = уже сделано = проще простого! 🍞"
          },
        ],

        test: [
          {
            q: "«En boca cerrada no entran moscas» = ?",
            options: ["Закрой холодильник", "Молчание — золото", "Ешь с закрытым ртом", "Мухи опасны"],
            correct: 1
          },
          {
            q: "«Costar un ojo de la cara» = ?",
            options: ["Больно смотреть на это", "Стоить очень дорого", "Выглядеть красиво", "Потерять зрение"],
            correct: 1
          },
          {
            q: "«Tomar el pelo» = ?",
            options: ["Причёсываться", "Стричься у парикмахера", "Дурачить / водить за нос", "Дразнить"],
            correct: 2
          },
          {
            q: "«Dar en el clavo» = ?",
            options: ["Ударить молотком", "Попасть в точку", "Сделать больно", "Быть точным по времени"],
            correct: 1
          },
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
//  PROMPT ДЛЯ SOFÍA
// ─────────────────────────────────────────────
const SOFIA_PROMPT = `Ты — Sofía, харизматичный и весёлый репетитор испанского языка и просто классный собеседник 🇪🇸

ПРАВИЛА:
- Отвечай на русском языке, кратко (до 250 слов)
- Будь с юмором, тепло, как умный друг — не как учебник
- На вопросы об испанском: всегда давай пример на испанском + транскрипция на русском + перевод
- Объясняй ПОЧЕМУ работает правило, а не просто «это правило»
- Отвечай на ЛЮБЫЕ вопросы — не только об испанском! Ты умная и разносторонняя
- Никаких «Конечно!», «Отличный вопрос!» — сразу к делу
- Используй эмодзи умеренно
- Если вопрос не об испанском — ответь как умный собеседник, можешь добавить испанский оборот к теме
- Никогда не отказывай в ответе`;

// ─────────────────────────────────────────────
//  МЕНЮ
// ─────────────────────────────────────────────
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🌱 A1 — Bebé Español", "🌿 A2 — Despegando"],
      ["🌊 B1 — Intermedio", "🔥 B2 — Avanzado"],
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
      keyboard: [["✅ Понял(а), вперёд!", "❓ Есть вопрос..."], ["⬅️ Назад к урокам"]],
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

// ─────────────────────────────────────────────
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ─────────────────────────────────────────────
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
  let grade, emoji, comment;
  if (pct === 100) {
    grade = "⭐⭐⭐ ИДЕАЛЬНО!";
    emoji = "🏆";
    comment = "Ты просто монстр испанского! ¡Increíble!";
  } else if (pct >= 75) {
    grade = "⭐⭐ Отлично!";
    emoji = "🎉";
    comment = "¡Muy bien! Так держать!";
  } else if (pct >= 50) {
    grade = "⭐ Неплохо!";
    emoji = "👍";
    comment = "Есть над чем поработать. ¡Tú puedes!";
  } else {
    grade = "📚 Повтори материал!";
    emoji = "💪";
    comment = "Ошибки — это ступени к знанию. ¡Ánimo!";
  }
  return { pct, grade, emoji, comment };
}

// ─────────────────────────────────────────────
//  ОПЛАТА
// ─────────────────────────────────────────────
async function sendPaymentInfo(chatId, levelKey, topicIdx) {
  const topic = COURSE[levelKey].topics[topicIdx];
  await bot.sendMessage(
    chatId,
    `🔒 *Урок закрыт: ${topic.title}*\n\n` +
    `Хочешь открыть? Два варианта:\n\n` +
    `💳 *1€ — только этот урок:*\n${TRIBUTE_LESSON}\n\n` +
    `🎓 *10€ — весь курс A1–B2 навсегда:*\n${TRIBUTE_COURSE}\n\n` +
    `📩 После оплаты напиши: ${ADMIN_CONTACT}\n` +
    `Отправь свой Telegram ID — активируем за час! ⚡\n\n` +
    `_Твой ID: можно узнать у @userinfobot_`,
    {
      parse_mode: "Markdown",
      reply_markup: { keyboard: [["⬅️ Назад к урокам"]], resize_keyboard: true },
    }
  );
}

async function sendCoursePaymentInfo(chatId) {
  await bot.sendMessage(
    chatId,
    `🎓 *Весь курс A1–B2 — 10€*\n\n` +
    `Все 16 уроков навсегда! 🇪🇸🔥\n` +
    `Теория + упражнения + тесты + Sofía 24/7\n\n` +
    `👉 ${TRIBUTE_COURSE}\n\n` +
    `📩 После оплаты напиши: ${ADMIN_CONTACT}\n` +
    `Пришли Telegram ID — активируем за час! ⚡`,
    {
      parse_mode: "Markdown",
      reply_markup: { keyboard: [["⬅️ Назад к урокам"]], resize_keyboard: true },
    }
  );
}

// ─────────────────────────────────────────────
//  КОМАНДЫ
// ─────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  getUser(chatId);
  const name = msg.from.first_name || "друг";
  await bot.sendMessage(
    chatId,
    `¡Hola, ${name}! 🇪🇸🎉\n\n` +
    `Добро пожаловать в *Habla Español* — курс испанского, который не даст заскучать!\n\n` +
    `🧠 *Что тебя ждёт:*\n` +
    `• 4 уровня — A1 до B2\n` +
    `• 16 тем: теория с юмором + упражнения + тесты\n` +
    `• 🤖 Sofía — твой репетитор 24/7 (10 вопросов/день БЕСПЛАТНО)\n` +
    `• Транскрипции всех слов на русском\n\n` +
    `💡 *Первый урок — БЕСПЛАТНО!*\n` +
    `Остальные — 1€/урок или 10€ весь курс 🎓\n\n` +
    `¡Vamos a aprender! 🚀`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `🆘 *Помощь*\n\n` +
    `📚 *Как учиться:*\nТеория → Упражнения → Тест → Результат\n\n` +
    `🤖 *Sofía:* 10 вопросов/день бесплатно — спрашивай всё что угодно!\n\n` +
    `💳 *Оплата:*\n1€ за урок или 10€ весь курс\nЧерез Tribute — ссылки в боте\n\n` +
    `📊 /progress — прогресс\n🔄 /reset — сбросить прогресс`,
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
    `📊 *Твой прогресс*\n\n` +
    `🔓 Уроков открыто: ${unlocked}/${total}\n` +
    `💳 Полный курс: ${user.fullCourse ? "✅ Активирован" : "❌ Не активирован"}\n` +
    `🤖 Sofía сегодня: ${user.aiCount}/10 вопросов`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = null;
  getUser(chatId);
  await bot.sendMessage(chatId, "🔄 Прогресс сброшен! Начинаем с чистого листа!\n¡Vamos! 🚀", mainMenu);
});

bot.onText(/\/give_course (.+)/, async (msg, match) => {
  if (String(msg.from.id) !== String(ADMIN_ID)) return;
  const targetId = match[1].trim();
  getUser(targetId).fullCourse = true;
  await bot.sendMessage(msg.chat.id, `✅ Полный курс открыт для ${targetId}`);
  try {
    await bot.sendMessage(
      targetId,
      `🎉 *Доступ активирован!*\n\nВесь курс A1–B2 твой! ¡A estudiar con pasión! 📚🔥`,
      { parse_mode: "Markdown", ...mainMenu }
    );
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
    await bot.sendMessage(
      targetId,
      `🎉 *Урок разблокирован!* ¡A estudiar! 📚`,
      { parse_mode: "Markdown", ...mainMenu }
    );
  } catch (e) {
    await bot.sendMessage(msg.chat.id, `⚠️ Не удалось написать пользователю ${targetId}`);
  }
});

// ─────────────────────────────────────────────
//  ОСНОВНОЙ ОБРАБОТЧИК СООБЩЕНИЙ
// ─────────────────────────────────────────────
bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const user = getUser(chatId);

  if (text.startsWith("/")) return;

  // ── ИИ-репетитор Sofía ──
  if (user.awaitingAI) {
    user.awaitingAI = false;
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(
        chatId,
        "😴 Sofía ушла на сиесту! Лимит 10 вопросов в день исчерпан.\n¡Hasta mañana! 🌙",
        mainMenu
      );
      return;
    }
    const typingMsg = await bot.sendMessage(chatId, "🤖 Sofía думает... 💭");
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: SOFIA_PROMPT,
        messages: [{ role: "user", content: text }],
      });
      user.aiCount++;
      const answer = response.content.map(b => b.text || "").join("");
      try { await bot.deleteMessage(chatId, typingMsg.message_id); } catch {}
      await bot.sendMessage(
        chatId,
        `🤖 *Sofía:*\n\n${answer}\n\n─────────────────\n_Осталось вопросов сегодня: ${10 - user.aiCount}_`,
        { parse_mode: "Markdown", ...mainMenu }
      );
    } catch (e) {
      console.error("Anthropic error:", e.message);
      try { await bot.deleteMessage(chatId, typingMsg.message_id); } catch {}
      await bot.sendMessage(
        chatId,
        "😵 Sofía перегрелась! Попробуй через минуту 🔥",
        mainMenu
      );
    }
    return;
  }

  // ── Упражнения ──
  if (user.currentStep === 1 && user.currentLevel && user.currentTopic !== null) {
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const ex = topic.exercises[user.exerciseIndex];
      const isCorrect = idx === ex.correct;
      const replyText = isCorrect
        ? `✅ *Правильно!* 🎉\n\n💡 *Объяснение:* ${ex.explain}`
        : `❌ *Неверно!*\nПравильный ответ: *${letters[ex.correct]}) ${ex.options[ex.correct]}*\n\n💡 *Объяснение:* ${ex.explain}`;
      await bot.sendMessage(chatId, replyText, { parse_mode: "Markdown" });
      user.exerciseIndex++;
      if (user.exerciseIndex < topic.exercises.length) {
        const next = topic.exercises[user.exerciseIndex];
        await bot.sendMessage(
          chatId,
          `*Вопрос ${user.exerciseIndex + 1} из ${topic.exercises.length}* 💪\n\n${next.q}`,
          { parse_mode: "Markdown", ...exerciseMenu(next.options) }
        );
      } else {
        user.currentStep = 0;
        user.exerciseIndex = 0;
        await bot.sendMessage(
          chatId,
          `🏁 *Упражнения завершены!*\n\nМолодец, справился! 💪\nТеперь проверь себя в тесте → жми 📝 Тест`,
          { parse_mode: "Markdown", ...lessonMenu() }
        );
      }
      return;
    }
  }

  // ── Тест ──
  if (user.currentStep === 2 && user.currentLevel && user.currentTopic !== null) {
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    const letters = ["A", "B", "C", "D"];
    const idx = letters.findIndex(l => text.startsWith(l + ")"));
    if (idx !== -1) {
      const q = topic.test[user.testIndex];
      const isCorrect = idx === q.correct;
      user.testAnswers.push({
        q: q.q,
        userIdx: idx,
        correctIdx: q.correct,
        options: q.options,
        ok: isCorrect,
      });
      if (isCorrect) user.testScore++;
      user.testIndex++;

      if (user.testIndex < topic.test.length) {
        const next = topic.test[user.testIndex];
        await bot.sendMessage(
          chatId,
          `${isCorrect ? "✅ Верно!" : "❌ Неверно!"}\n\n*Вопрос ${user.testIndex + 1} из ${topic.test.length}*\n\n${next.q}`,
          { parse_mode: "Markdown", ...exerciseMenu(next.options) }
        );
      } else {
        const { pct, grade, emoji, comment } = getScore(user.testScore, topic.test.length);

        let wrongList = "";
        user.testAnswers.filter(a => !a.ok).forEach(a => {
          wrongList += `\n❌ *${a.q}*\n   Ты ответил: ${a.options[a.userIdx]}\n   ✅ Правильно: ${a.options[a.correctIdx]}\n`;
        });

        const resultMsg =
          `${emoji} *Результаты теста!*\n` +
          `📚 *${topic.title}*\n\n` +
          `🎯 Результат: *${user.testScore}/${topic.test.length}* (${pct}%)\n` +
          `${grade}\n` +
          `_${comment}_\n\n` +
          `${wrongList ? `*Разбор ошибок:*${wrongList}` : "🏆 *Все ответы верны! ¡Perfecto!* 🌟"}`;

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

  // ── Навигация ──
  if (text === "⬅️ Главное меню" || text === "/menu") {
    user.currentLevel = null;
    user.currentTopic = null;
    user.currentStep = 0;
    await bot.sendMessage(chatId, "🏠 Главное меню! ¡Bienvenido! 🇪🇸", mainMenu);
    return;
  }

  if (text === "⬅️ Назад к урокам" || text === "⬅️ Назад") {
    user.currentTopic = null;
    user.currentStep = 0;
    if (user.currentLevel) {
      await bot.sendMessage(
        chatId,
        `📚 Выбери тему — *${COURSE[user.currentLevel].label}*:`,
        { parse_mode: "Markdown", ...levelMenu(user.currentLevel) }
      );
    } else {
      await bot.sendMessage(chatId, "🏠 Главное меню:", mainMenu);
    }
    return;
  }

  // ── Выбор уровня ──
  const levelMap = {
    "🌱 A1 — Bebé Español": "A1",
    "🌿 A2 — Despegando": "A2",
    "🌊 B1 — Intermedio": "B1",
    "🔥 B2 — Avanzado": "B2",
  };

  if (levelMap[text]) {
    user.currentLevel = levelMap[text];
    user.currentTopic = null;
    const level = COURSE[user.currentLevel];
    await bot.sendMessage(
      chatId,
      `${level.emoji} *${level.label}*\n\nВыбери тему для изучения:`,
      { parse_mode: "Markdown", ...levelMenu(user.currentLevel) }
    );
    return;
  }

  // ── Выбор темы ──
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
      const isFree = isLessonFree(user.currentLevel, topicIdx);
      await bot.sendMessage(
        chatId,
        `📚 *${topic.title}*\n\n${isFree ? "🆓 _Бесплатный урок!_\n\n" : ""}Что будем делать?`,
        { parse_mode: "Markdown", ...lessonMenu() }
      );
      return;
    }
  }

  // ── Теория ──
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

  // ── После теории ──
  if (text === "✅ Понял(а), вперёд!" || text === "💪 Упражнения") {
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
      `💪 *Упражнения!* ${topic.exercises.length} вопроса\n\n*Вопрос 1 из ${topic.exercises.length}*\n\n${ex.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(ex.options) }
    );
    return;
  }

  if (text === "❓ Есть вопрос...") {
    user.awaitingAI = true;
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(chatId, "😴 Sofía отдыхает! Лимит 10 вопросов/день. Приходи завтра! 🌙", mainMenu);
      return;
    }
    await bot.sendMessage(
      chatId,
      `🤖 *Sofía слушает!* 🇪🇸\nОсталось вопросов: *${10 - user.aiCount}*\n\nСпрашивай — отвечу на всё! 😊`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  // ── Тест ──
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
      `📝 *ТЕСТ: ${topic.title}*\n${topic.test.length} вопроса 🍀\n\n*Вопрос 1 из ${topic.test.length}*\n\n${q.q}`,
      { parse_mode: "Markdown", ...exerciseMenu(q.options) }
    );
    return;
  }

  // ── Повторить урок ──
  if (text === "🔄 Повторить урок") {
    if (!user.currentLevel || user.currentTopic === null) return;
    user.currentStep = 0;
    const topic = COURSE[user.currentLevel].topics[user.currentTopic];
    await bot.sendMessage(
      chatId,
      `🔄 *Повторяем: ${topic.title}*\n\nС чего начнём?`,
      { parse_mode: "Markdown", ...lessonMenu() }
    );
    return;
  }

  // ── Sofía ──
  if (text === "🤖 Спросить Sofía") {
    resetAIIfNewDay(user);
    if (user.aiCount >= 10) {
      await bot.sendMessage(
        chatId,
        "😴 Sofía на сиесте! Лимит 10 вопросов в день. ¡Hasta mañana! 🌙",
        mainMenu
      );
      return;
    }
    user.awaitingAI = true;
    await bot.sendMessage(
      chatId,
      `🤖 *¡Hola!* Я Sofía 🇪🇸\nОсталось вопросов: *${10 - user.aiCount}*\n\nСпрашивай всё что угодно — об испанском и не только! 😊`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  // ── Прогресс ──
  if (text === "📊 Мой прогресс") {
    const total = Object.values(COURSE).reduce((a, l) => a + l.topics.length, 0);
    const unlocked = user.fullCourse ? total : user.paid.length + 1;
    resetAIIfNewDay(user);
    await bot.sendMessage(
      chatId,
      `📊 *Твой прогресс*\n\n` +
      `🔓 Уроков открыто: ${unlocked}/${total}\n` +
      `💳 Полный курс: ${user.fullCourse ? "✅ Активирован" : "❌ Не куплен"}\n` +
      `🤖 Sofía сегодня: ${user.aiCount}/10 вопросов\n\n` +
      `${user.fullCourse ? "¡Tienes acceso completo! 🎉" : `Хочешь весь курс? 10€ → ${TRIBUTE_COURSE}`}`,
      { parse_mode: "Markdown", ...mainMenu }
    );
    return;
  }

  // ── Заглушка ──
  await bot.sendMessage(
    chatId,
    `¿Qué? 🤔 Используй кнопки меню!\nЕсли хочешь спросить Sofía — жми *🤖 Спросить Sofía* 👇`,
    { parse_mode: "Markdown", ...mainMenu }
  );
});

// ─────────────────────────────────────────────
//  ОБРАБОТКА ОШИБОК
// ─────────────────────────────────────────────
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

bot.on("error", (error) => {
  console.error("Bot error:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

console.log("🇪🇸 Habla Español Bot запущен! ¡Vamos a aprender! 🚀");
