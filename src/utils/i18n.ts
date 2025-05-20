import { createI18n } from 'vue-i18n'

// Типы для переводов
export type TranslationLanguages = 'ru' | 'kg'

// Словари переводов
export const messages = {
  ru: {
    profile: 'Профиль',
    myJobs: 'Мои задания',
    myVacancies: 'Мои вакансии',
    availableJobs: 'Доступные вакансии',
    applications: 'Заявки',
    notifications: 'Уведомления',
    personalData: 'Личные данные',
    editProfile: 'Редактировать профиль',
    addJob: 'Создать новую вакансию',
    noJobs: 'Нет заданий, соответствующих выбранному фильтру',
    jobDetails: 'Подробнее',
    edit: 'Редактировать',
    delete: 'Удалить',
    apply: 'Откликнуться',
    complete: 'Завершить',
    cancelApplication: 'Отменить отклик',
    allStatuses: 'Все',
    newStatus: 'Новые',
    inProgressStatus: 'В работе',
    completedStatus: 'Завершенные',
    name: 'ФИО',
    phone: 'Телефон',
    email: 'Email',
    age: 'Возраст',
    accountType: 'Тип аккаунта',
    workerType: 'Работник',
    employerType: 'Работодатель',
    loginMethod: 'Способ входа',
    hasOtherJob: 'У меня есть другая работа',
    skills: 'Навыки',
    experience: 'Опыт работы',
    remarks: 'Примечания',
    save: 'Сохранить',
    cancel: 'Отмена',
    all: 'Все',
    search: 'Поиск по названию, описанию или локации...',
    noAvailableJobs: 'Нет доступных вакансий в данный момент',
    jobTitle: 'Название вакансии',
    description: 'Описание',
    salary: 'Зарплата',
    location: 'Локация',
    date: 'Дата',
    category: 'Категория',
    status: 'Статус',
    addRemarks: 'Добавьте примечания',
    required: '*',
    totalApplications: 'Всего заявок',
    applicants: 'Соискатели',
    appliedAt: 'Откликнулся',
    accept: 'Принять',
    reject: 'Отклонить',
    finishWork: 'Завершить работу',
    changeLanguage: 'Тилди алмаштыруу (KG)', // Переключить на кыргызский
    about: 'О нас',
    findJob: 'Найти работу',
    dashboard: 'Личный кабинет',
    logout: 'Выйти',
    login: 'Войти',
    register: 'Регистрация',
    postJob: 'Выложить работу',
    navigation: 'Навигация',
    home: 'Главная',
    contacts: 'Контакты',
    socials: 'Социальные сети',
    copyright: 'Все права защищены',
    termsOfUse: 'Правила использования',
    privacyPolicy: 'Политика конфиденциальности',
    // About page
    aboutTitle: 'О нас',
    aboutTeam: 'Наша команда',
    contactUs: 'Связаться с нами',
    // JobsView additions
    findJobOrEmployee: 'Найдите работу или исполнителя',
    jobsPlatformDescription:
      'Более 500 вакансий и 1000 исполнителей на нашей платформе, готовых приступить к работе сегодня',
    addNewJob: 'Добавить вакансию',
    jobsFound: 'Найдено вакансий',
    searchTitle: 'Поиск',
    resetFilters: 'сбросить все фильтры',
    noJobsFound: 'Вакансии не найдены',
    tryChangeSearch: 'Попробуйте изменить параметры поиска или',
    addJobTitle: 'Добавить вакансию',
    editJobTitle: 'Редактировать вакансию',
    deleteConfirmation: 'Вы уверены, что хотите удалить эту вакансию?',
    applicationCount: 'Заявок',
    details: 'Подробнее',
    modify: 'Изменить',
    // JobsView with nested structure
    jobs: {
      header: {
        title: 'Найдите работу или исполнителя',
        subtitle:
          'Более 500 вакансий и 1000 исполнителей на нашей платформе, готовых приступить к работе сегодня',
      },
      search: {
        placeholder: 'Поиск по названию, описанию или локации...',
      },
      actions: {
        addJob: 'Добавить вакансию',
      },
      filterInfo: {
        jobsCount: 'Найдено вакансий',
        searchQuery: 'Поиск',
      },
      noJobs: {
        title: 'Вакансии не найдены',
        text: 'Попробуйте изменить параметры поиска или',
        resetBtn: 'сбросить все фильтры',
      },
      modal: {
        addJobTitle: 'Добавить вакансию',
        editJobTitle: 'Редактировать вакансию',
        addJobBtn: 'Добавить',
        editJobBtn: 'Сохранить',
        cancelBtn: 'Отмена',
      },
      form: {
        title: 'Название вакансии',
        description: 'Описание',
        salary: 'Зарплата',
        location: 'Локация',
        phone: 'Телефон',
        category: 'Категория',
        date: 'Дата',
        salaryPlaceholder: 'Например: 1500 сом',
        locationPlaceholder: 'Например: Бишкек, центр',
        phonePlaceholder: '+996 XXX XXXXXX',
      },
    },
    // Categories
    categories: {
      all: 'Все',
      cleaning: 'Уборка',
      construction: 'Строительство',
      delivery: 'Доставка',
      repair: 'Ремонт',
      nanny: 'Няни',
      other: 'Разное',
    },
    // Google Auth
    loginWithGoogle: 'Войти с помощью Google',
    registerWithGoogle: 'Зарегистрироваться с помощью Google',
  },
  kg: {
    profile: 'Профиль',
    myJobs: 'Менин тапшырмаларым',
    myVacancies: 'Менин вакансияларым',
    availableJobs: 'Жеткиликтүү вакансиялар',
    applications: 'Арыздар',
    notifications: 'Билдирүүлөр',
    personalData: 'Жеке маалыматтар',
    editProfile: 'Профилди түзөтүү',
    addJob: 'Жаңы вакансия түзүү',
    noJobs: 'Тандалган чыпкага ылайык тапшырмалар жок',
    jobDetails: 'Толугураак',
    edit: 'Түзөтүү',
    delete: 'Жок кылуу',
    apply: 'Жооп берүү',
    complete: 'Аяктоо',
    cancelApplication: 'Арызды жокко чыгаруу',
    allStatuses: 'Баары',
    newStatus: 'Жаңы',
    inProgressStatus: 'Иштөөдө',
    completedStatus: 'Аякталган',
    name: 'Аты-жөнү',
    phone: 'Телефон',
    email: 'Электрондук почта',
    age: 'Жашы',
    accountType: 'Аккаунт түрү',
    workerType: 'Жумушчу',
    employerType: 'Иш берүүчү',
    loginMethod: 'Кирүү ыкмасы',
    hasOtherJob: 'Менин башка жумушум бар',
    skills: 'Көндүмдөр',
    experience: 'Иш тажрыйбасы',
    remarks: 'Эскертүүлөр',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу',
    all: 'Баары',
    search: 'Аталышы, сүрөттөмөсү же жайгашкан жери боюнча издөө...',
    noAvailableJobs: 'Учурда жеткиликтүү вакансиялар жок',
    jobTitle: 'Вакансиянын аталышы',
    description: 'Сүрөттөмө',
    salary: 'Айлык акы',
    location: 'Жайгашкан жери',
    date: 'Күнү',
    category: 'Категория',
    status: 'Статус',
    addRemarks: 'Эскертүүлөрдү кошуңуз',
    required: '*',
    totalApplications: 'Жалпы арыздар',
    applicants: 'Арыз ээлери',
    appliedAt: 'Жооп берген',
    accept: 'Кабыл алуу',
    reject: 'Четке кагуу',
    finishWork: 'Жумушту аяктоо',
    changeLanguage: 'Сменить язык (RU)', // Переключить на русский
    about: 'Биз жөнүндө',
    findJob: 'Жумуш табуу',
    dashboard: 'Жеке кабинет',
    logout: 'Чыгуу',
    login: 'Кирүү',
    register: 'Каттоо',
    postJob: 'Жумуш жарыялоо',
    navigation: 'Навигация',
    home: 'Башкы бет',
    contacts: 'Байланыштар',
    socials: 'Социалдык тармактар',
    copyright: 'Бардык укуктар корголгон',
    termsOfUse: 'Колдонуу эрежелери',
    privacyPolicy: 'Купуялуулуk саясаты',
    // About page
    aboutTitle: 'Биз жөнүндө',
    aboutTeam: 'Биздин команда',
    contactUs: 'Байланышуу',
    // JobsView additions
    findJobOrEmployee: 'Жумуш же аткаруучу табыңыз',
    jobsPlatformDescription:
      'Биздин платформада 500дөн ашык вакансия жана 1000ден ашык аткаруучулар, бүгүн эле иштөөгө даяр',
    addNewJob: 'Вакансия кошуу',
    jobsFound: 'Табылган вакансиялар',
    searchTitle: 'Издөө',
    resetFilters: 'чыпкаларды тазалоо',
    noJobsFound: 'Вакансиялар табылган жок',
    tryChangeSearch: 'Издөө параметрлерин өзгөртүп көрүңүз же',
    addJobTitle: 'Вакансия кошуу',
    editJobTitle: 'Вакансияны түзөтүү',
    deleteConfirmation: 'Бул вакансияны чындап эле жок кылгыңыз келеби?',
    applicationCount: 'Арыздар',
    details: 'Толугураак',
    modify: 'Өзгөртүү',
    // JobsView with nested structure
    jobs: {
      header: {
        title: 'Жумуш же аткаруучу табыңыз',
        subtitle:
          'Биздин платформада 500дөн ашык вакансия жана 1000ден ашык аткаруuчулар, бүгүн эле иштөөгө даяр',
      },
      search: {
        placeholder: 'Аталышы, сүрөттөмөсү же жайгашкан жери боюнча издөө...',
      },
      actions: {
        addJob: 'Вакансия кошуу',
      },
      filterInfo: {
        jobsCount: 'Табылган вакансиялар',
        searchQuery: 'Издөө',
      },
      noJobs: {
        title: 'Вакансиялар табылган жок',
        text: 'Издөө параметрлерин өзгөртүп көрүңүз же',
        resetBtn: 'чыпкаларды тазалоо',
      },
      modal: {
        addJobTitle: 'Вакансия кошуу',
        editJobTitle: 'Вакансияны түзөтүү',
        addJobBtn: 'Кошуу',
        editJobBtn: 'Сактоо',
        cancelBtn: 'Жокко чыгаруу',
      },
      form: {
        title: 'Вакансиянын аталышы',
        description: 'Сүрөттөмө',
        salary: 'Айлык акы',
        location: 'Жайгашкан жери',
        phone: 'Телефон',
        category: 'Категория',
        date: 'Күнү',
        salaryPlaceholder: 'Мисалы: 1500 сом',
        locationPlaceholder: 'Мисалы: Бишкек, борбор',
        phonePlaceholder: '+996 XXX XXXXXX',
      },
    },
    // Categories
    categories: {
      all: 'Баары',
      cleaning: 'Тазалоо',
      construction: 'Курулуш',
      delivery: 'Жеткирүү',
      repair: 'Оңдоо',
      nanny: 'Бала багуу',
      other: 'Башка',
    },
    // Google Auth
    loginWithGoogle: 'Google менен кирүү',
    registerWithGoogle: 'Google менен катталуу',
  },
}

// Получаем сохраненный язык из localStorage или используем русский по умолчанию
function getLocale(): string {
  const savedLanguage = localStorage.getItem('preferredLanguage')
  return savedLanguage === 'ru' || savedLanguage === 'kg' ? savedLanguage : 'ru'
}

// Создаем экземпляр i18n
export const i18n = createI18n({
  legacy: false, // Возвращаем обратно режим Composition API
  globalInjection: true, // Устанавливаем глобальные свойства для всех компонентов
  locale: getLocale(), // устанавливаем текущий язык
  fallbackLocale: 'ru', // запасной язык
  messages, // словари переводов
})

// Функция для переключения языка
export function switchLanguage() {
  // Приведение типов нужно из-за особенностей TypeScript
  const i18nGlobal = i18n.global as any
  const currentLocale = i18nGlobal.locale.value
  const newLocale = currentLocale === 'ru' ? 'kg' : 'ru'

  // Устанавливаем новый язык
  i18nGlobal.locale.value = newLocale
  localStorage.setItem('preferredLanguage', newLocale)
}

// Экспортируем тип ключей перевода
export type TranslationKeys = keyof typeof messages.ru
