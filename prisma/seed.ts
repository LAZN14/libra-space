import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Классика", slug: "klassika", description: "Вечная литература, проверенная временем" },
  { name: "Фантастика", slug: "fantastika", description: "Научная фантастика и фэнтези" },
  { name: "Детектив", slug: "detektiv", description: "Детективы и триллеры" },
  { name: "Современная проза", slug: "proza", description: "Современная художественная литература" },
  { name: "Бизнес", slug: "biznes", description: "Бизнес, менеджмент и саморазвитие" },
  { name: "Научпоп", slug: "nauchpop", description: "Научно-популярные издания" },
  { name: "История", slug: "istoriya", description: "Историческая литература" },
  { name: "Поэзия", slug: "poeziya", description: "Стихи и поэтические сборники" },
];

const COVER_COLORS = [
  "#1B4332", "#2D6A4F", "#40916C", "#081C15",
  "#1D3557", "#457B9D", "#1B263B", "#0D1B2A",
  "#6D4C41", "#5D4037", "#4E342E", "#3E2723",
  "#7B2D26", "#9B2226", "#AE2012", "#BB3E03",
  "#3D405B", "#5C5470", "#2B2D42", "#212529",
  "#264653", "#2A9D8F", "#1A535C", "#0B525B",
];

type BookSeed = {
  title: string;
  author: string;
  categorySlug: string;
  year: number;
  pages: number;
  copies: number;
  description: string;
  publisher?: string;
};

const BOOKS: BookSeed[] = [
  { title: "Война и мир", author: "Лев Толстой", categorySlug: "klassika", year: 1869, pages: 1274, copies: 5, description: "Эпический роман о русском обществе эпохи Наполеоновских войн.", publisher: "АСТ" },
  { title: "Преступление и наказание", author: "Фёдор Достоевский", categorySlug: "klassika", year: 1866, pages: 671, copies: 4, description: "Психологический роман о студенте Раскольникове и моральной цене преступления.", publisher: "Эксмо" },
  { title: "Анна Каренина", author: "Лев Толстой", categorySlug: "klassika", year: 1877, pages: 864, copies: 3, description: "История трагической любви на фоне светского общества XIX века.", publisher: "Азбука" },
  { title: "Мастер и Маргарита", author: "Михаил Булгаков", categorySlug: "klassika", year: 1967, pages: 480, copies: 6, description: "Сатирический роман о визите дьявола в Москву и истории Понтия Пилата.", publisher: "АСТ" },
  { title: "Евгений Онегин", author: "Александр Пушкин", categorySlug: "klassika", year: 1833, pages: 240, copies: 4, description: "Роман в стихах — энциклопедия русской жизни.", publisher: "Детская литература" },
  { title: "Отцы и дети", author: "Иван Тургенев", categorySlug: "klassika", year: 1862, pages: 288, copies: 3, description: "Конфликт поколений и нигилизм Базарова.", publisher: "Азбука" },
  { title: "Мёртвые души", author: "Николай Гоголь", categorySlug: "klassika", year: 1842, pages: 352, copies: 3, description: "Поэма о похождениях Чичикова и портретах губернского общества.", publisher: "Эксмо" },
  { title: "Герой нашего времени", author: "Михаил Лермонтов", categorySlug: "klassika", year: 1840, pages: 224, copies: 3, description: "Психологический портрет Печорина — «лишнего человека» эпохи.", publisher: "АСТ" },
  { title: "Обломов", author: "Иван Гончаров", categorySlug: "klassika", year: 1859, pages: 560, copies: 2, description: "История Ильи Ильича Обломова и знаменитого обломовства.", publisher: "Азбука" },
  { title: "Идиот", author: "Фёдор Достоевский", categorySlug: "klassika", year: 1869, pages: 640, copies: 3, description: "Роман о князе Мышкине — «положительно прекрасном человеке».", publisher: "Эксмо" },
  { title: "Братья Карамазовы", author: "Фёдор Достоевский", categorySlug: "klassika", year: 1880, pages: 824, copies: 3, description: "Философский роман о вере, свободе и семейной драме.", publisher: "АСТ" },
  { title: "Тихий Дон", author: "Михаил Шолохов", categorySlug: "klassika", year: 1940, pages: 1200, copies: 2, description: "Эпопея о судьбе донского казачества в годы революции и Гражданской войны.", publisher: "Эксмо" },
  { title: "Доктор Живаго", author: "Борис Пастернак", categorySlug: "klassika", year: 1957, pages: 592, copies: 2, description: "Роман о судьбе интеллигента на фоне революции и Гражданской войны.", publisher: "Азбука" },
  { title: "Белая гвардия", author: "Михаил Булгаков", categorySlug: "klassika", year: 1925, pages: 320, copies: 2, description: "Киев 1918 года глазами семьи Турбиных.", publisher: "АСТ" },
  { title: "Двенадцать стульев", author: "Илья Ильф, Евгений Петров", categorySlug: "klassika", year: 1928, pages: 416, copies: 4, description: "Сатирические приключения Остапа Бендера в поисках сокровищ.", publisher: "Эксмо" },

  { title: "1984", author: "Джордж Оруэлл", categorySlug: "fantastika", year: 1949, pages: 328, copies: 5, description: "Антиутопия о тоталитарном обществе и Большом Брате.", publisher: "АСТ" },
  { title: "О дивный новый мир", author: "Олдос Хаксли", categorySlug: "fantastika", year: 1932, pages: 288, copies: 3, description: "Классическая антиутопия о мире потребления и контроля.", publisher: "Азбука" },
  { title: "Дюна", author: "Фрэнк Герберт", categorySlug: "fantastika", year: 1965, pages: 704, copies: 4, description: "Эпическая сага о пустынной планете Арракис и специях.", publisher: "АСТ" },
  { title: "Солярис", author: "Станислав Лем", categorySlug: "fantastika", year: 1961, pages: 296, copies: 3, description: "Философский роман о контакте с мыслящим океаном.", publisher: "Азбука" },
  { title: "Пикник на обочине", author: "Аркадий и Борис Стругацкие", categorySlug: "fantastika", year: 1972, pages: 224, copies: 4, description: "Зона, сталкеры и артефакты — классика советской фантастики.", publisher: "АСТ" },
  { title: "Трудно быть богом", author: "Аркадий и Борис Стругацкие", categorySlug: "fantastika", year: 1964, pages: 256, copies: 3, description: "Землянин на средневековой планете и этика вмешательства.", publisher: "АСТ" },
  { title: "Властелин колец: Братство Кольца", author: "Дж. Р. Р. Толкин", categorySlug: "fantastika", year: 1954, pages: 576, copies: 4, description: "Начало легендарного путешествия Фродо и братства.", publisher: "АСТ" },
  { title: "Властелин колец: Две крепости", author: "Дж. Р. Р. Толкин", categorySlug: "fantastika", year: 1954, pages: 480, copies: 3, description: "Война за Средиземье продолжается.", publisher: "АСТ" },
  { title: "Властелин колец: Возвращение короля", author: "Дж. Р. Р. Толкин", categorySlug: "fantastika", year: 1955, pages: 512, copies: 3, description: "Финал эпопеи о Кольце Всевластья.", publisher: "АСТ" },
  { title: "Гарри Поттер и философский камень", author: "Дж. К. Роулинг", categorySlug: "fantastika", year: 1997, pages: 399, copies: 6, description: "Начало истории юного волшебника Хогвартса.", publisher: "Махаон" },
  { title: "Гарри Поттер и Тайная комната", author: "Дж. К. Роулинг", categorySlug: "fantastika", year: 1998, pages: 480, copies: 4, description: "Второй год в Хогвартсе и тайны замка.", publisher: "Махаон" },
  { title: "Игра престолов", author: "Джордж Р. Р. Мартин", categorySlug: "fantastika", year: 1996, pages: 864, copies: 3, description: "Первая книга саги «Песнь льда и пламени».", publisher: "АСТ" },
  { title: "Автостопом по Галактике", author: "Дуглас Адамс", categorySlug: "fantastika", year: 1979, pages: 288, copies: 3, description: "Абсурдно-весёлое космическое путешествие.", publisher: "АСТ" },
  { title: "Нейромант", author: "Уильям Гибсон", categorySlug: "fantastika", year: 1984, pages: 352, copies: 2, description: "Классика киберпанка о хакере Кейсе.", publisher: "Азбука" },
  { title: "Марсианин", author: "Энди Вейер", categorySlug: "fantastika", year: 2011, pages: 448, copies: 4, description: "Инженер выживает в одиночку на Марсе.", publisher: "Эксмо" },

  { title: "Убийство в Восточном экспрессе", author: "Агата Кристи", categorySlug: "detektiv", year: 1934, pages: 256, copies: 4, description: "Эркюль Пуаро расследует убийство в заснеженном поезде.", publisher: "Эксмо" },
  { title: "Десять негритят", author: "Агата Кристи", categorySlug: "detektiv", year: 1939, pages: 288, copies: 4, description: "Десять гостей на острове — и никто не уйдёт безнаказанным.", publisher: "Эксмо" },
  { title: "Собака Баскервилей", author: "Артур Конан Дойл", categorySlug: "detektiv", year: 1902, pages: 256, copies: 3, description: "Шерлок Холмс против легендарного пса Дартмура.", publisher: "АСТ" },
  { title: "Приключения Шерлока Холмса", author: "Артур Конан Дойл", categorySlug: "detektiv", year: 1892, pages: 320, copies: 3, description: "Сборник классических рассказов о великом сыщике.", publisher: "Азбука" },
  { title: "Девушка с татуировкой дракона", author: "Стиг Ларссон", categorySlug: "detektiv", year: 2005, pages: 672, copies: 3, description: "Журналист и хакерша расследуют дело сорокалетней давности.", publisher: "Эксмо" },
  { title: "Шерлок Холмс: Этюд в багровых тонах", author: "Артур Конан Дойл", categorySlug: "detektiv", year: 1887, pages: 192, copies: 2, description: "Первое появление Шерлока Холмса и доктора Ватсона.", publisher: "АСТ" },
  { title: "Имя розы", author: "Умберто Эко", categorySlug: "detektiv", year: 1980, pages: 672, copies: 2, description: "Детектив в средневековом монастыре и лабиринт смыслов.", publisher: "АСТ" },
  { title: "Молчание ягнят", author: "Томас Харрис", categorySlug: "detektiv", year: 1988, pages: 416, copies: 2, description: "Кларисса Старлинг и Ганнибал Лектер.", publisher: "Азбука" },
  { title: "Исчезнувшая", author: "Гиллиан Флинн", categorySlug: "detektiv", year: 2012, pages: 480, copies: 3, description: "Психологический триллер о пропавшей жене.", publisher: "АСТ" },
  { title: "Код да Винчи", author: "Дэн Браун", categorySlug: "detektiv", year: 2003, pages: 544, copies: 4, description: "Символы, тайны и погоня по Европе.", publisher: "АСТ" },
  { title: "Ангелы и демоны", author: "Дэн Браун", categorySlug: "detektiv", year: 2000, pages: 576, copies: 3, description: "Роберт Лэнгдон против иллюминатов в Ватикане.", publisher: "АСТ" },
  { title: "Золотой телёнок", author: "Илья Ильф, Евгений Петров", categorySlug: "klassika", year: 1931, pages: 384, copies: 3, description: "Продолжение приключений великого комбинатора.", publisher: "Эксмо" },

  { title: "Норвежский лес", author: "Харуки Мураками", categorySlug: "proza", year: 1987, pages: 384, copies: 3, description: "История любви и взросления в Японии 1960-х.", publisher: "Эксмо" },
  { title: "Кафка на пляже", author: "Харуки Мураками", categorySlug: "proza", year: 2002, pages: 640, copies: 2, description: "Сюрреалистическое путешествие мальчика по имени Кафка.", publisher: "Эксмо" },
  { title: "Убить пересмешника", author: "Харпер Ли", categorySlug: "proza", year: 1960, pages: 384, copies: 3, description: "История о расизме и справедливости глазами ребёнка.", publisher: "АСТ" },
  { title: "Над пропастью во ржи", author: "Джером Сэлинджер", categorySlug: "proza", year: 1951, pages: 240, copies: 3, description: "Классика о подростковом бунте и одиночестве.", publisher: "Эксмо" },
  { title: "Маленький принц", author: "Антуан де Сент-Экзюпери", categorySlug: "proza", year: 1943, pages: 96, copies: 5, description: "Философская сказка о дружбе, любви и ответственности.", publisher: "Эксмо" },
  { title: "Сто лет одиночества", author: "Габриэль Гарсиа Маркес", categorySlug: "proza", year: 1967, pages: 448, copies: 3, description: "Сага семьи Буэндиа в городе Макондо.", publisher: "АСТ" },
  { title: "Алхимик", author: "Пауло Коэльо", categorySlug: "proza", year: 1988, pages: 224, copies: 4, description: "Притча о следовании за своей мечтой.", publisher: "АСТ" },
  { title: "Тень ветра", author: "Карлос Руис Сафон", categorySlug: "proza", year: 2001, pages: 576, copies: 2, description: "Мистика Барселоны и Кладбище забытых книг.", publisher: "АСТ" },
  { title: "Жизнь Пи", author: "Янн Мартел", categorySlug: "proza", year: 2001, pages: 352, copies: 2, description: "Выживание на плоту с бенгальским тигром.", publisher: "Азбука" },
  { title: "Облачный атлас", author: "Дэвид Митчелл", categorySlug: "proza", year: 2004, pages: 704, copies: 2, description: "Шесть связанных историй сквозь эпохи.", publisher: "АСТ" },
  { title: "Шантарам", author: "Грегори Дэвид Робертс", categorySlug: "proza", year: 2003, pages: 960, copies: 2, description: "Эпическая история беглеца в трущобах Бомбея.", publisher: "АСТ" },
  { title: "Зулейха открывает глаза", author: "Гузель Яхина", categorySlug: "proza", year: 2015, pages: 512, copies: 3, description: "Судьба татарской женщины в годы раскулачивания.", publisher: "АСТ" },
  { title: "Лавр", author: "Евгений Водолазкин", categorySlug: "proza", year: 2012, pages: 448, copies: 2, description: "Средневековый роман о целителе и пути искупления.", publisher: "АСТ" },
  { title: "Авиатор", author: "Евгений Водолазкин", categorySlug: "proza", year: 2016, pages: 416, copies: 2, description: "Человек из прошлого просыпается в современном мире.", publisher: "АСТ" },

  { title: "Думай медленно... решай быстро", author: "Даниэль Канеман", categorySlug: "biznes", year: 2011, pages: 653, copies: 3, description: "Как устроено мышление и где нас подстерегают ошибки.", publisher: "АСТ" },
  { title: "Богатый папа, бедный папа", author: "Роберт Кийосаки", categorySlug: "biznes", year: 1997, pages: 272, copies: 4, description: "Финансовая грамотность и мышление инвестора.", publisher: "Попурри" },
  { title: "Семь навыков высокоэффективных людей", author: "Стивен Кови", categorySlug: "biznes", year: 1989, pages: 396, copies: 3, description: "Классика личного и профессионального развития.", publisher: "Альпина" },
  { title: "Атомные привычки", author: "Джеймс Клир", categorySlug: "biznes", year: 2018, pages: 320, copies: 5, description: "Как маленькие изменения дают огромный результат.", publisher: "Альпина" },
  { title: "От хорошего к великому", author: "Джим Коллинз", categorySlug: "biznes", year: 2001, pages: 320, copies: 2, description: "Исследование компаний, которые совершили прорыв.", publisher: "Манн, Иванов и Фербер" },
  { title: "Стартап без бюджета", author: "Майк Микаловиц", categorySlug: "biznes", year: 2011, pages: 256, copies: 2, description: "Как запускать бизнес с минимальными ресурсами.", publisher: "Манн, Иванов и Фербер" },
  { title: "Lean Startup", author: "Эрик Рис", categorySlug: "biznes", year: 2011, pages: 336, copies: 3, description: "Методология бережливого стартапа.", publisher: "Альпина" },
  { title: "Как завоёвывать друзей", author: "Дейл Карнеги", categorySlug: "biznes", year: 1936, pages: 352, copies: 4, description: "Вечная классика общения и влияния.", publisher: "Попурри" },
  { title: "Гемба кайдзен", author: "Масааки Имаи", categorySlug: "biznes", year: 1997, pages: 368, copies: 2, description: "Японская философия непрерывных улучшений.", publisher: "Альпина" },
  { title: "Сила момента сейчас", author: "Экхарт Толле", categorySlug: "biznes", year: 1997, pages: 256, copies: 3, description: "О присутствии в настоящем и внутренней свободе.", publisher: "София" },

  { title: "Краткая история времени", author: "Стивен Хокинг", categorySlug: "nauchpop", year: 1988, pages: 256, copies: 3, description: "Чёрные дыры, Большой взрыв и устройство Вселенной.", publisher: "АСТ" },
  { title: "Sapiens", author: "Юваль Ной Харари", categorySlug: "nauchpop", year: 2011, pages: 512, copies: 4, description: "Краткая история человечества от охотников до империй.", publisher: "Синдбад" },
  { title: "Homo Deus", author: "Юваль Ной Харари", categorySlug: "nauchpop", year: 2015, pages: 448, copies: 2, description: "Будущее человечества в эпоху технологий.", publisher: "Синдбад" },
  { title: "Геном", author: "Мэтт Ридли", categorySlug: "nauchpop", year: 1999, pages: 416, copies: 2, description: "Автобиография вида в 23 главах.", publisher: "АСТ" },
  { title: "Чёрный лебедь", author: "Нассим Талеб", categorySlug: "nauchpop", year: 2007, pages: 736, copies: 2, description: "О непредсказуемых событиях, меняющих мир.", publisher: "КоЛибри" },
  { title: "Антихрупкость", author: "Нассим Талеб", categorySlug: "nauchpop", year: 2012, pages: 768, copies: 2, description: "Как выигрывать от хаоса и неопределённости.", publisher: "КоЛибри" },
  { title: "Космос", author: "Карл Саган", categorySlug: "nauchpop", year: 1980, pages: 432, copies: 2, description: "Путешествие по Вселенной глазами великого популяризатора.", publisher: "АСТ" },
  { title: "Заразительный", author: "Джона Бергер", categorySlug: "nauchpop", year: 2013, pages: 256, copies: 2, description: "Почему одни идеи распространяются, а другие — нет.", publisher: "Альпина" },
  { title: "Фактологичность", author: "Ханс Рослинг", categorySlug: "nauchpop", year: 2018, pages: 352, copies: 3, description: "Десять причин, почему мы ошибаемся о мире — и почему всё лучше, чем кажется.", publisher: "Альпина" },
  { title: "Думай как математик", author: "Барбара Оакли", categorySlug: "nauchpop", year: 2014, pages: 288, copies: 2, description: "Как эффективно учиться сложным вещам.", publisher: "Манн, Иванов и Фербер" },

  { title: "История государства Российского", author: "Н. М. Карамзин", categorySlug: "istoriya", year: 1818, pages: 800, copies: 2, description: "Классический труд по истории России.", publisher: "Эксмо" },
  { title: "Россия. Путь к современности", author: "Джеффри Хоскинг", categorySlug: "istoriya", year: 2001, pages: 640, copies: 2, description: "Обзор российской истории XIX–XX веков.", publisher: "Весь Мир" },
  { title: "Вторая мировая война", author: "Энтони Бивор", categorySlug: "istoriya", year: 2012, pages: 992, copies: 2, description: "Всеобъемлющая история глобального конфликта.", publisher: "КоЛибри" },
  { title: "Сталинград", author: "Энтони Бивор", categorySlug: "istoriya", year: 1998, pages: 512, copies: 2, description: "Хроника одной из решающих битв войны.", publisher: "КоЛибри" },
  { title: "Екатерина Великая", author: "Роберт Мэсси", categorySlug: "istoriya", year: 2011, pages: 656, copies: 2, description: "Биография императрицы, изменившей империю.", publisher: "АСТ" },
  { title: "Пётр Великий", author: "Роберт Мэсси", categorySlug: "istoriya", year: 1980, pages: 960, copies: 2, description: "Жизнь реформатора, построившего новую Россию.", publisher: "АСТ" },
  { title: "Чингисхан и рождение современного мира", author: "Джек Уэзерфорд", categorySlug: "istoriya", year: 2004, pages: 384, copies: 2, description: "Как империя монголов изменила мир.", publisher: "АСТ" },
  { title: "Краткая история почти всего на свете", author: "Билл Брайсон", categorySlug: "nauchpop", year: 2003, pages: 672, copies: 3, description: "Увлекательный рассказ о науке от Большого взрыва до нас.", publisher: "АСТ" },
  { title: "Guns, Germs, and Steel", author: "Джаред Даймонд", categorySlug: "istoriya", year: 1997, pages: 528, copies: 2, description: "Почему одни цивилизации развивались быстрее других.", publisher: "АСТ" },
  { title: "История искусства", author: "Эрнст Гомбрих", categorySlug: "istoriya", year: 1950, pages: 688, copies: 2, description: "Классическое введение в историю мирового искусства.", publisher: "АСТ" },

  { title: "Евгений Онегин (иллюстрированное)", author: "Александр Пушкин", categorySlug: "poeziya", year: 1833, pages: 280, copies: 2, description: "Иллюстрированное издание романа в стихах.", publisher: "Азбука" },
  { title: "Стихотворения и поэмы", author: "Александр Блок", categorySlug: "poeziya", year: 1921, pages: 320, copies: 2, description: "Сборник ключевых произведений Серебряного века.", publisher: "Азбука" },
  { title: "Избранное", author: "Анна Ахматова", categorySlug: "poeziya", year: 1965, pages: 288, copies: 3, description: "Лучшие стихи великой поэтессы XX века.", publisher: "Эксмо" },
  { title: "Стихотворения", author: "Борис Пастернак", categorySlug: "poeziya", year: 1957, pages: 256, copies: 2, description: "Лирика Пастернака — от ранних стихов до «Зимней ночи».", publisher: "АСТ" },
  { title: "Облако в штанах", author: "Владимир Маяковский", categorySlug: "poeziya", year: 1915, pages: 96, copies: 2, description: "Тетраптих футуриста — «Долой вашу любовь».", publisher: "Азбука" },
  { title: "Стихотворения и поэмы", author: "Сергей Есенин", categorySlug: "poeziya", year: 1925, pages: 352, copies: 3, description: "Лирика русской деревни и мятежной души.", publisher: "Эксмо" },
  { title: "Цветы зла", author: "Шарль Бодлер", categorySlug: "poeziya", year: 1857, pages: 320, copies: 2, description: "Книга, изменившая европейскую поэзию.", publisher: "Азбука" },
  { title: "Божественная комедия", author: "Данте Алигьери", categorySlug: "poeziya", year: 1320, pages: 704, copies: 2, description: "Путешествие по Аду, Чистилищу и Раю.", publisher: "АСТ" },
  { title: "Илиада", author: "Гомер", categorySlug: "poeziya", year: -750, pages: 560, copies: 2, description: "Эпос о Троянской войне и гневе Ахилла.", publisher: "Азбука" },
  { title: "Одиссея", author: "Гомер", categorySlug: "poeziya", year: -720, pages: 496, copies: 2, description: "Странствия Одиссея на пути домой.", publisher: "Азбука" },
  { title: "Рубайат", author: "Омар Хайям", categorySlug: "poeziya", year: 1120, pages: 160, copies: 3, description: "Мудрость, вино и бренность бытия в четверостишиях.", publisher: "Эксмо" },
  { title: "Избранные стихи", author: "Иосиф Бродский", categorySlug: "poeziya", year: 1987, pages: 384, copies: 2, description: "Поэзия нобелевского лауреата.", publisher: "Азбука" },
  { title: "Гамлет", author: "Уильям Шекспир", categorySlug: "klassika", year: 1601, pages: 224, copies: 3, description: "Трагедия датского принца о мести и сомнении.", publisher: "АСТ" },
  { title: "Ромео и Джульетта", author: "Уильям Шекспир", categorySlug: "klassika", year: 1597, pages: 192, copies: 3, description: "Вечная история любви и вражды семейств.", publisher: "АСТ" },
  { title: "Фауст", author: "Иоганн Вольфганг Гёте", categorySlug: "klassika", year: 1808, pages: 544, copies: 2, description: "Сделка с Мефистофелем и поиск смысла.", publisher: "Азбука" },
];

function isbnFor(index: number) {
  const base = 9785000000000 + index;
  return String(base);
}

async function main() {
  console.log("🌱 Seeding LibraSpace...");

  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.librarySettings.deleteMany();

  await prisma.librarySettings.create({
    data: {
      id: "default",
      loanDays: 14,
      maxLoansPerUser: 5,
      maxRenewals: 2,
      finePerDay: 10,
      reservationHoldDays: 3,
      libraryName: "LibraSpace",
    },
  });

  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("reader123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@libraspace.ru",
      passwordHash: adminHash,
      name: "Администратор",
      phone: "+7 (900) 000-00-01",
      role: "ADMIN",
      notes: "Главный администратор библиотеки",
    },
  });

  const reader = await prisma.user.create({
    data: {
      email: "reader@libraspace.ru",
      passwordHash: userHash,
      name: "Анна Читателева",
      phone: "+7 (900) 111-22-33",
      role: "USER",
    },
  });

  const demoReaders = await Promise.all(
    [
      { email: "ivan@mail.ru", name: "Иван Петров", phone: "+7 (900) 222-33-44" },
      { email: "maria@mail.ru", name: "Мария Сидорова", phone: "+7 (900) 333-44-55" },
      { email: "alex@mail.ru", name: "Алексей Козлов", phone: "+7 (900) 444-55-66" },
    ].map(async (u) =>
      prisma.user.create({
        data: {
          ...u,
          passwordHash: userHash,
          role: "USER",
        },
      })
    )
  );

  if (BOOKS.length < 100) {
    throw new Error(`Need 100 books, got ${BOOKS.length}`);
  }

  const books = [];
  for (let i = 0; i < BOOKS.length; i++) {
    const b = BOOKS[i];
    const categoryId = categoryMap.get(b.categorySlug)!;
    const book = await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        isbn: isbnFor(i + 1),
        description: b.description,
        coverColor: COVER_COLORS[i % COVER_COLORS.length],
        publishedYear: Math.max(b.year, 1),
        pages: b.pages,
        publisher: b.publisher,
        totalCopies: b.copies,
        availableCopies: b.copies,
        location: `Зал ${String.fromCharCode(65 + (i % 5))}-${String(100 + (i % 50)).padStart(3, "0")}`,
        categoryId,
      },
    });
    books.push(book);
  }

  // Demo loans for CRM history
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await prisma.loan.create({
    data: {
      userId: reader.id,
      bookId: books[0].id,
      status: "ACTIVE",
      borrowedAt: new Date(now.getTime() - 3 * day),
      dueDate: new Date(now.getTime() + 11 * day),
    },
  });
  await prisma.book.update({
    where: { id: books[0].id },
    data: { availableCopies: { decrement: 1 } },
  });

  await prisma.loan.create({
    data: {
      userId: reader.id,
      bookId: books[15].id,
      status: "RETURNED",
      borrowedAt: new Date(now.getTime() - 40 * day),
      dueDate: new Date(now.getTime() - 26 * day),
      returnedAt: new Date(now.getTime() - 28 * day),
    },
  });

  await prisma.loan.create({
    data: {
      userId: demoReaders[0].id,
      bookId: books[3].id,
      status: "OVERDUE",
      borrowedAt: new Date(now.getTime() - 25 * day),
      dueDate: new Date(now.getTime() - 11 * day),
      fineAmount: 110,
    },
  });
  await prisma.book.update({
    where: { id: books[3].id },
    data: { availableCopies: { decrement: 1 } },
  });

  await prisma.loan.create({
    data: {
      userId: demoReaders[1].id,
      bookId: books[30].id,
      status: "ACTIVE",
      borrowedAt: new Date(now.getTime() - 5 * day),
      dueDate: new Date(now.getTime() + 9 * day),
    },
  });
  await prisma.book.update({
    where: { id: books[30].id },
    data: { availableCopies: { decrement: 1 } },
  });

  await prisma.reservation.create({
    data: {
      userId: demoReaders[2].id,
      bookId: books[0].id,
      status: "WAITING",
      position: 1,
    },
  });

  await prisma.review.createMany({
    data: [
      { userId: reader.id, bookId: books[15].id, rating: 5, comment: "Потрясающе! Обязательно к прочтению." },
      { userId: demoReaders[0].id, bookId: books[3].id, rating: 5, comment: "Булгаков — гений." },
      { userId: demoReaders[1].id, bookId: books[46].id, rating: 4, comment: "Трогательная и мудрая сказка." },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: "LOGIN", entity: "User", entityId: admin.id, details: "Вход администратора" },
      { userId: reader.id, action: "REGISTER", entity: "User", entityId: reader.id, details: "Регистрация читателя" },
      { userId: reader.id, action: "BORROW", entity: "Loan", details: `Взята книга «${books[0].title}»` },
      { userId: reader.id, action: "RETURN", entity: "Loan", details: `Возвращена книга «${books[15].title}»` },
      { userId: demoReaders[0].id, action: "BORROW", entity: "Loan", details: `Взята книга «${books[3].title}»` },
    ],
  });

  console.log(`✅ Seeded ${books.length} books, ${CATEGORIES.length} categories`);
  console.log("👤 Admin: admin@libraspace.ru / admin123");
  console.log("👤 Reader: reader@libraspace.ru / reader123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
