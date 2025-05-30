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
    companyName: 'Название компании',
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
    skillsTitle: 'Навыки',
    noSkillsYet: 'Навыки еще не указаны',
    experienceTitle: 'Опыт работы',
    noExperienceYet: 'Опыт работы еще не указан',
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
    dashboardSection: {
      title: 'Панель управления',
      welcome: 'Добро пожаловать',
      stats: {
        totalJobs: 'Всего вакансий',
        activeJobs: 'Активные вакансии',
        totalApplications: 'Всего заявок',
        pendingApplications: 'Ожидающие заявки'
      },
      recentJobs: 'Недавние вакансии',
      recentApplications: 'Недавние заявки',
      noJobs: 'У вас пока нет вакансий',
      noApplications: 'У вас пока нет заявок',
      viewAll: 'Просмотреть все',
      createJob: 'Создать вакансию',
      editJob: 'Редактировать вакансию',
      deleteJob: 'Удалить вакансию',
      status: {
        active: 'Активная',
        closed: 'Закрытая',
        draft: 'Черновик'
      }
    },
    logout: 'Выйти',
    login: 'Войти',
    register: 'Регистрация',
    postJob: 'Выложить работу',
    navigation: 'Навигация',
    homePage: 'Главная',
    contacts: 'Контакты',
    socials: 'Социальные сети',
    copyright: 'Все права защищены',
    termsOfUse: 'Правила использования',
    privacyPolicy: 'Политика конфиденциальности',
    footerDescription: 'Площадка для быстрого поиска работы и сотрудников в Кыргызстане. Удобный сервис для работодателей и соискателей.',
    socialTelegram: 'Телеграм',
    socialInstagram: 'Инстаграм',
    home: 'Главная',
    // Login page translations
    loginPage: {
      title: 'Вход в систему',
      subtitle: 'Войдите в свой аккаунт чтобы получить доступ к вакансиям',
      emailLabel: 'Email адрес',
      emailPlaceholder: 'Введите ваш email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите ваш пароль',
      loginButton: 'Войти',
      registerButton: 'Зарегистрироваться',
      loggingIn: 'Вход...',
      or: 'или',
      onlineMode: 'Онлайн режим',
      demoMode: 'Демо режим',
      testAccounts: 'Тестовые аккаунты',
      worker: 'Работник',
      employer: 'Работодатель',
      password: 'Пароль',
      errors: {
        connectionError: 'Ошибка соединения',
        invalidCredentials: 'Неверный email или пароль',
        fillAllFields: 'Заполните все поля',
        loginError: 'Ошибка входа'
      }
    },
    // Register page translations
    registerPage: {
      title: 'Регистрация',
      subtitle: 'Создайте аккаунт для поиска работы или сотрудников',
      iAmLookingForJob: 'Я ищу работу',
      iAmLookingForWorkers: 'Я ищу сотрудников',
      profilePhoto: 'Фото профиля',
      uploadPhoto: 'Загрузить фото',
      photoRequirements: 'JPEG или PNG, макс. 5MB',
      enterYourName: 'Введите ваше имя',
      enterCompanyName: 'Введите название компании',
      enterYourEmail: 'Введите ваш email',
      password: 'Пароль',
      enterPassword: 'Введите пароль',
      confirmPassword: 'Подтверждение пароля',
      repeatPassword: 'Повторите пароль',
      iAgree: 'Я согласен с',
      and: 'и',
      registerButton: 'Зарегистрироваться',
      registering: 'Регистрация...',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      loginLink: 'Войти',
      changePhoto: 'Изменить фото',
      minSixChars: 'Минимум 6 символов',
      errors: {
        registrationError: 'Ошибка при регистрации. Пожалуйста, попробуйте позже.',
        enterEmail: 'Введите email',
        enterValidEmail: 'Введите корректный email',
        enterPassword: 'Введите пароль',
        passwordMinLength: 'Пароль должен содержать минимум 6 символов',
        passwordsDoNotMatch: 'Пароли не совпадают',
        acceptTerms: 'Необходимо принять условия',
        enterValidPhone: 'Введите корректный номер телефона',
        demoModeRegistrationUnavailable: 'В демо режиме регистрация недоступна. Используйте тестовые аккаунты.',
        invalidResponse: 'Некорректный ответ от сервера. Пожалуйста, попробуйте позже.'
      },
      googleOAuth: {
        errorTitle: 'Ошибка авторизации Google'
      }
    },
    // About page
    aboutTitle: 'О нас',
    aboutTeam: 'Наша команда',
    contactUs: 'Связаться с нами',
    aboutWhatIs: 'Что такое Tez Jumush?',
    aboutDescription: 'Tez Jumush — это онлайн платформа для быстрого поиска работы и сотрудников в Кыргызстане. Мы соединяем работодателей и соискателей, упрощая процесс найма и поиска работы.',
    aboutSimplify: 'Наша цель — сделать рынок труда более доступным и эффективным для всех участников.',
    aboutMission: 'Наша миссия',
    aboutMissionDescription: 'Помочь людям найти подходящую работу и дать возможность компаниям нанимать лучших сотрудников быстро и эффективно.',
    aboutHowWorks: 'Как это работает',
    aboutSteps: {
      step1: 'Работодатели размещают вакансии на нашей платформе',
      step2: 'Соискатели находят интересующие их предложения',
      step3: 'Соискатели могут откликнуться на вакансию через платформу',
      step4: 'Работодатель получает уведомление и может связаться с соискателем'
    },
    aboutAdvantages: 'Преимущества платформы',
    aboutAdvantagesList: {
      adv1: 'Удобный и простой интерфейс',
      adv2: 'Быстрый поиск вакансий и сотрудников',
      adv3: 'Возможность работать без интернета (оффлайн режим)',
      adv4: 'Платформа оптимизирована для мобильных устройств',
      adv5: 'Бесплатное использование основных функций'
    },
    aboutContactText: 'Если у вас есть вопросы или предложения, свяжитесь с нами через Telegram канал:',
    telegramChannel: 'Наш Telegram канал',
    aboutTeamDescription: 'Наша команда состоит из опытных разработчиков и специалистов по трудоустройству, объединенных общей целью — упростить процесс поиска работы в Кыргызстане.',
    
    // Home page
    homeContent: {
      hero: {
        title: 'Найдите работу мечты',
        titleSpan: 'в один клик',
        subtitle: 'Самая быстрая платформа для поиска работы и сотрудников в Кыргызстане',
        findJobBtn: 'Найти работу',
        postJobBtn: 'Разместить вакансию',
        authNotice: 'Для полного доступа ко всем функциям, пожалуйста,',
        login: 'войдите',
        or: 'или',
        register: 'зарегистрируйтесь',
        stats: {
          jobs: 'вакансий',
          workers: 'соискателей',
          companies: 'компаний'
        }
      },
      logoFallback: {
        title: 'Tez Jumush',
        subtitle: 'Быстрый поиск работы'
      },
      about: {
        title: 'О платформе',
        text1: 'Tez Jumush — это инновационная платформа для быстрого и удобного поиска работы и сотрудников в Кыргызстане.',
        text2: 'Мы стремимся упростить процесс найма и трудоустройства, предлагая современное решение для соискателей и работодателей.',
        text3: 'Благодаря интуитивно понятному интерфейсу и продвинутым функциям поиска, найти подходящую вакансию или кандидата стало проще, чем когда-либо.'
      },
      recentJobs: {
        title: 'Последние вакансии',
        loading: 'Загрузка вакансий...',
        retry: 'Повторить',
        viewAll: 'Смотреть все вакансии',
        errorMessage: 'Ошибка при загрузке вакансий',
        demoJobs: {
          job1: {
            title: 'Помощник по дому',
            description: 'Требуется помощник по дому для уборки и готовки',
            category: 'Уборка'
          },
          job2: {
            title: 'Курьер на своем авто',
            description: 'Доставка еды и товаров по городу',
            category: 'Доставка'
          },
          job3: {
            title: 'Разнорабочий',
            description: 'Требуется разнорабочий для ремонта квартиры',
            category: 'Ремонт'
          }
        }
      },
      cta: {
        title: 'Начните использовать',
        titleSpan: 'Tez Jumush сегодня!',
        text: 'Создайте учетную запись прямо сейчас и получите доступ ко всем возможностям нашей платформы',
        registerBtn: 'Зарегистрироваться',
        postJobBtn: 'Разместить вакансию',
        button: 'Начать сейчас',
        guarantee: 'Никаких скрытых платежей. Базовые функции всегда бесплатны.'
      },
      features: {
        title: 'Почему выбирают нас',
        feature1: {
          title: 'Быстро и просто',
          text: 'Интуитивно понятный интерфейс позволяет разместить вакансию или найти работу в считанные минуты'
        },
        feature2: {
          title: 'Работает везде',
          text: 'Платформа доступна на всех устройствах, включая мобильные телефоны и планшеты'
        },
        feature3: {
          title: 'Оффлайн режим',
          text: 'Работайте с приложением даже при отсутствии подключения к интернету'
        }
      }
    },
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
    loginWithGoogle: 'Google менен кирүү',
    registerWithGoogle: 'Google менен катталуу',
    // Add Google Auth error messages and UI text
    googleAuth: {
      missingClientId: 'Google Client ID не настроен. Пожалуйста, свяжитесь с администратором.',
      tryAgain: 'Попробовать снова',
      authError: 'Ошибка авторизации Google',
      loadError: 'Не удалось загрузить Google Sign-In',
      initError: 'Ошибка инициализации Google Sign-In',
      retryAttempt: 'Попытка {current} из {max}',
      retryFailed: 'Не удалось повторить. Попытка {current} из {max}',
      maxRetriesExceeded: 'Превышено максимальное количество попыток',
      cannotReadAuthData: 'Не удалось прочитать данные аутентификации',
      demoUser: 'Демо пользователь Google',
      demoAuthError: 'Ошибка демо-авторизации'
    },
    // Error messages
    errors: {
      enterName: 'Введите ФИО',
      enterPhone: 'Введите номер телефона',
      enterEmail: 'Введите email',
      enterAge: 'Введите возраст',
      enterValidAge: 'Введите корректный возраст (от 16 до 100)',
      photoRequired: 'Пожалуйста, выберите изображение',
      photoSizeLimit: 'Размер файла не должен превышать 5МБ',
      fillAllFields: 'Пожалуйста, заполните все обязательные поля',
      alreadyApplied: 'Вы уже откликнулись на эту вакансию',
      deleteConfirm: 'Вы уверены, что хотите удалить?',
      invalidPhoneFormat: 'Некорректный формат телефона',
      invalidEmailFormat: 'Некорректный формат email'
    },
    offline: {
      message: 'Нет подключения к интернету. Работаем в оффлайн режиме.'
    },
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
    companyName: 'Компаниянын аталышы',
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
    skillsTitle: 'Көндүмдөр',
    noSkillsYet: 'Көндүмдөр көрсөтүлө элек',
    experienceTitle: 'Иш тажрыйбасы',
    noExperienceYet: 'Иш тажрыйбасы көрсөтүлө элек',
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
    dashboardSection: {
      title: 'Башкаруу панели',
      welcome: 'Кош келиңиз',
      stats: {
        totalJobs: 'Бардык вакансиялар',
        activeJobs: 'Активдүү вакансиялар',
        totalApplications: 'Бардык арыздар',
        pendingApplications: 'Күтүүдөгү арыздар'
      },
      recentJobs: 'Акыркы вакансиялар',
      recentApplications: 'Акыркы арыздар',
      noJobs: 'Сизде азырынча вакансиялар жок',
      noApplications: 'Сизде азырынча арыздар жок',
      viewAll: 'Баарын көрүү',
      createJob: 'Вакансия түзүү',
      editJob: 'Вакансияны түзөтүү',
      deleteJob: 'Вакансияны жок кылуу',
      status: {
        active: 'Активдүү',
        closed: 'Жабык',
        draft: 'Черновик'
      }
    },
    logout: 'Чыгуу',
    login: 'Кирүү',
    register: 'Каттоо',
    postJob: 'Жумуш жарыялоо',
    navigation: 'Навигация',
    homePage: 'Башкы бет',
    contacts: 'Байланыштар',
    socials: 'Социалдык тармактар',
    copyright: 'Бардык укуктар корголгон',
    termsOfUse: 'Колдонуу эрежелери',
    privacyPolicy: 'Купуялуулуk саясаты',
    footerDescription: 'Кыргызстандагы жумуш жана кызматкерлерди тез табуу үчүн аянтча. Жумуш берүүчүлөр жана жумуш издөөчүлөр үчүн ыңгайлуу кызмат.',
    socialTelegram: 'Телеграм',
    socialInstagram: 'Инстаграм',
    home: 'Башкы бет',
    // Login page translations
    loginPage: {
      title: 'Системага кирүү',
      subtitle: 'Вакансияларды көрүү үчүн аккаунтуңузга кириңиз',
      emailLabel: 'Email дарек',
      emailPlaceholder: 'Email дарегиңизди киргизиңиз',
      passwordLabel: 'Сырсөз',
      passwordPlaceholder: 'Сырсөзүңүздү киргизиңиз',
      loginButton: 'Кирүү',
      registerButton: 'Катталуу',
      loggingIn: 'Кирүүдө...',
      or: 'же',
      onlineMode: 'Онлайн режим',
      demoMode: 'Демо режим',
      testAccounts: 'Тесттик аккаунттар',
      worker: 'Жумушчу',
      employer: 'Иш берүүчү',
      password: 'Сырсөз',
      errors: {
        connectionError: 'Туташуу катасы',
        invalidCredentials: 'Туура эмес email же сырсөз',
        fillAllFields: 'Бардык талааларды толтуруңуз',
        loginError: 'Кирүү катасы'
      }
    },
    // Register page translations
    registerPage: {
      title: 'Катталуу',
      subtitle: 'Жумуш же кызматкерлерди табуу үчүн аккаунт түзүңүз',
      iAmLookingForJob: 'Мен жумуш издеп жатам',
      iAmLookingForWorkers: 'Мен кызматкерлерди издеп жатам',
      profilePhoto: 'Профиль сүрөтү',
      uploadPhoto: 'Сүрөт жүктөө',
      photoRequirements: 'JPEG же PNG, макс. 5MB',
      enterYourName: 'Атыңызды киргизиңиз',
      enterCompanyName: 'Компаниянын аталышын киргизиңиз',
      enterYourEmail: 'Email киргизиңиз',
      password: 'Сырсөз',
      enterPassword: 'Сырсөз киргизиңиз',
      confirmPassword: 'Сырсөздү ырастоо',
      repeatPassword: 'Сырсөздү кайталаңыз',
      iAgree: 'Мен макулмун',
      and: 'жана',
      registerButton: 'Катталуу',
      registering: 'Катталууда...',
      alreadyHaveAccount: 'Аккаунтуңуз барбы?',
      loginLink: 'Кирүү',
      changePhoto: 'Сүрөттү өзгөртүү',
      minSixChars: 'Эң аз 6 символ',
      errors: {
        registrationError: 'Каттоодо ката кетти. Кайрадан аракет кылыңыз.',
        enterEmail: 'Email киргизиңиз',
        enterValidEmail: 'Туура email киргизиңиз',
        enterPassword: 'Сырсөз киргизиңиз',
        passwordMinLength: 'Сырсөз эң аз 6 символдон турушу керек',
        passwordsDoNotMatch: 'Сырсөздөр дал келбейт',
        acceptTerms: 'Шарттарды кабыл алуу керек',
        enterValidPhone: 'Туура телефон номерин киргизиңиз',
        demoModeRegistrationUnavailable: 'Демо режимде каттоо жеткиликтүү эмес. Тесттик аккаунттарды колдонуңуз.',
        invalidResponse: 'Серверден туура эмес жооп. Кайрадан аракет кылыңыз.'
      },
      googleOAuth: {
        errorTitle: 'Google аутентификация катасы'
      }
    },
    // About page
    aboutTitle: 'Биз жөнүндө',
    aboutTeam: 'Биздин команда',
    contactUs: 'Байланышуу',
    aboutWhatIs: 'Tez Jumush деген эмне?',
    aboutDescription: 'Tez Jumush — Кыргызстанда тез жумуш жана кызматкерлерди табуу үчүн онлайн платформа. Биз жумуш берүүчүлөрдү жана жумуш издөөчүлөрдү байланыштырып, жумушка алуу жана жумуш издөө процессин жөнөкөйлөштүрөбүз.',
    aboutSimplify: 'Биздин максат — эмгек рыногун бардык катышуучулар үчүн жеткиликтүү жана натыйжалуу кылуу.',
    aboutMission: 'Биздин миссия',
    aboutMissionDescription: 'Адамдарга ылайыктуу жумуш табууга жардам берүү жана компанияларга мыкты кызматкерлерди тез жана натыйжалуу жалдоого мүмкүнчүлүк берүү.',
    aboutHowWorks: 'Бул кандай иштейт',
    aboutSteps: {
      step1: 'Жумуш берүүчүлөр биздин платформада вакансияларды жайгаштырышат',
      step2: 'Жумуш издөөчүлөр өздөрүн кызыктырган сунуштарды табышат',
      step3: 'Жумуш издөөчүлөр платформа аркылуу вакансияга жооп бере алышат',
      step4: 'Жумуш берүүчү билдирүү алат жана жумуш издөөчү менен байланыша алат'
    },
    aboutAdvantages: 'Платформанын артыкчылыктары',
    aboutAdvantagesList: {
      adv1: 'Ыңгайлуу жана жөнөкөй интерфейс',
      adv2: 'Вакансияларды жана кызматкерлерди тез издөө',
      adv3: 'Интернетсиз иштөө мүмкүнчүлүгү (оффлайн режим)',
      adv4: 'Мобилдик түзмөктөр үчүн оптималдаштырылган платформа',
      adv5: 'Негизги функцияларды акысыз колдонуу'
    },
    aboutContactText: 'Эгер сизде суроолор же сунуштар болсо, Telegram канал аркылуу биз менен байланышыңыз:',
    telegramChannel: 'Биздин Telegram канал',
    aboutTeamDescription: 'Биздин команда тажрыйбалуу өнүктүрүүчүлөрдөн жана жумушка орноштуруу адистеринен турат, алар Кыргызстанда жумуш издөө процессин жөнөкөйлөштүрүү деген жалпы максат менен бириктирилген.',
    
    // Home page
    homeContent: {
      hero: {
        title: 'Кыялыңыздагы жумушту',
        titleSpan: 'бир чыкылдатуу менен табыңыз',
        subtitle: 'Кыргызстандагы жумуш жана кызматкерлерди издөө үчүн эң тез платформа',
        findJobBtn: 'Жумуш табуу',
        postJobBtn: 'Вакансия жайгаштыруу',
        authNotice: 'Бардык функцияларга толук кирүү үчүн сураныч,',
        login: 'кириңиз',
        or: 'же',
        register: 'катталыңыз',
        stats: {
          jobs: 'вакансиялар',
          workers: 'жумуш издөөчүлөр',
          companies: 'компаниялар'
        }
      },
      logoFallback: {
        title: 'Tez Jumush',
        subtitle: 'Жумуш тез табуу'
      },
      about: {
        title: 'Платформа жөнүндө',
        text1: 'Tez Jumush — Кыргызстанда жумуш жана кызматкерлерди тез жана ыңгайлуу издөө үчүн инновациялык платформа.',
        text2: 'Биз жалдоо жана жумушка орноштуруу процессин жумуш издөөчүлөр жана жумуш берүүчүлөр үчүн заманбап чечим сунуштап жөнөкөйлөтүүгө умтулабыз.',
        text3: 'Интуитивдик интерфейс жана өркүндөтүлгөн издөө функцияларынын аркасында, ылайыктуу вакансияны же талапкерди табуу мурдагыдан да жеңил болуп калды.'
      },
      recentJobs: {
        title: 'Акыркы вакансиялар',
        loading: 'Вакансиялар жүктөлүүдө...',
        retry: 'Кайталоо',
        viewAll: 'Бардык вакансияларды көрүү',
        errorMessage: 'Вакансияларды жүктөөдө ката',
        demoJobs: {
          job1: {
            title: 'Үй жардамчысы',
            description: 'Тазалоо жана тамак жасоо үчүн үй жардамчысы керек',
            category: 'Тазалоо'
          },
          job2: {
            title: 'Өз унаасы менен курьер',
            description: 'Шаар боюнча тамак-аш жана товарларды жеткирүү',
            category: 'Жеткирүү'
          },
          job3: {
            title: 'Жумушчу',
            description: 'Квартира оңдоо үчүн жумушчу керек',
            category: 'Оңдоо'
          }
        }
      },
      cta: {
        title: 'Бүгүн Tez Jumush',
        titleSpan: 'колдоно баштаңыз!',
        text: 'Азыр эсеп түзүп, биздин платформабыздын бардык мүмкүнчүлүктөрүнө жетиңиз',
        registerBtn: 'Катталуу',
        postJobBtn: 'Вакансия жайгаштыруу',
        button: 'Баштаңыз',
        guarantee: 'Жашыруун төлөмдөр жок. Негизги функциялар дайыма акысыз.'
      },
      features: {
        title: 'Эмне үчүн бизди тандашат',
        feature1: {
          title: 'Тез жана жөнөкөй',
          text: 'Интуитивдик интерфейс бир нече мүнөттүн ичинде вакансияны жайгаштырууга же жумуш табууга мүмкүндүк берет'
        },
        feature2: {
          title: 'Бардык жерде иштейт',
          text: 'Платформа бардык түзмөктөрдө, анын ичинде мобилдик телефондордо жана планшеттерде жеткиликтүү'
        },
        feature3: {
          title: 'Оффлайн режим',
          text: 'Интернет байланышы жок болсо да тиркеме менен иштөө'
        }
      }
    },
    // JobsView additions
    findJobOrEmployee: 'Жумуш же аткаруuчу табыңыз',
    jobsPlatformDescription:
      'Биздин платформада 500дөн ашыk вакансия жана 1000ден ашыk аткаруuчулар, бүгүн эле иштөөгө даяр',
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
        title: 'Жумуш же аткаруuчу табыңыз',
        subtitle:
          'Биздин платформада 500дөн ашыk вакансия жана 1000ден ашыk аткаруuчулар, бүгүн эле иштөөгө даяр',
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
        salary: 'Айлыk акы',
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
    // Add Google Auth error messages and UI text in Kyrgyz
    googleAuth: {
      missingClientId: 'Google Client ID жөндөлгөн эмес. Администратор менен байланышыңыз.',
      tryAgain: 'Кайра аракет кылуу',
      authError: 'Google аутентификация катасы',
      loadError: 'Google Sign-In жүктөө мүмкүн болбоду',
      initError: 'Google Sign-In демилгелөө катасы',
      retryAttempt: 'Аракет {current} / {max}',
      retryFailed: 'Кайталоо мүмкүн болбоду. Аракет {current} / {max}',
      maxRetriesExceeded: 'Максималдуу аракеттер саны ашып кетти',
      cannotReadAuthData: 'Аутентификация маалыматтарын окуу мүмкүн эмес',
      demoUser: 'Google демо колдонуучу',
      demoAuthError: 'Демо-авторизация катасы'
    },
    // Error messages
    errors: {
      enterName: 'Аты-жөнүңүздү киргизиңиз',
      enterPhone: 'Телефон номериңизди киргизиңиз',
      enterEmail: 'Email киргизиңиз',
      enterAge: 'Жашыңызды киргизиңиз',
      enterValidAge: 'Туура жашты киргизиңиз (16дан 100гө чейин)',
      photoRequired: 'Сүрөт тандаңыз',
      photoSizeLimit: 'Файлдын өлчөмү 5МБдан ашпашы керек',
      fillAllFields: 'Бардык милдеттүү талааларды толтуруңуз',
      alreadyApplied: 'Сиз бул вакансияга мурун кайрылгансыз',
      deleteConfirm: 'Чындап эле жок кылгыңыз келеби?',
      invalidPhoneFormat: 'Телефон туура эмес форматта',
      invalidEmailFormat: 'Email туура эмес форматта'
    },
    offline: {
      message: 'Интернетке туташуу жок. Оффлайн режимде иштейбиз.'
    },
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
export function switchLanguage(locale?: TranslationLanguages) {
  // Приведение типов нужно из-за особенностей TypeScript
  const i18nGlobal = i18n.global as any
  const currentLocale = i18nGlobal.locale.value
  const newLocale = locale || (currentLocale === 'ru' ? 'kg' : 'ru')

  // Устанавливаем новый язык
  i18nGlobal.locale.value = newLocale
  localStorage.setItem('preferredLanguage', newLocale)
}

// Экспортируем тип ключей перевода
export type TranslationKeys = keyof typeof messages.ru
