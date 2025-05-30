// Скрипт для отладки авторизации
// Запустите этот скрипт в консоли браузера

(function() {
  console.log("Начинаю отладку авторизации...");
  
  // Проверяем наличие данных о пользователях
  const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
  console.log(`Найдено ${demoUsers.length} демо-пользователей.`);
  
  if (demoUsers.length === 0) {
    console.error("Демо-пользователи не найдены! Создайте тестового пользователя с помощью скрипта create-demo-user.js");
    return;
  }
  
  // Выводим список доступных пользователей
  console.log("Доступные пользователи для входа:");
  demoUsers.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}, Пароль: ${user.password || 'не указан'}, Тип: ${user.userType}`);
  });
  
  // Проверяем функцию demoLogin
  function testDemoLogin(email, password) {
    try {
      // Ищем пользователя с указанными учетными данными
      const user = demoUsers.find(
        (u) => u.email === email && u.password === password
      );
      
      if (user) {
        console.log("✅ Успешный вход для пользователя:", email);
        return true;
      } else {
        // Пробуем найти пользователя только по email для диагностики
        const userByEmail = demoUsers.find((u) => u.email === email);
        
        if (userByEmail) {
          console.error(`❌ Пользователь с email ${email} найден, но пароль не совпадает.`);
          console.log("Ожидаемый пароль:", userByEmail.password);
          console.log("Введенный пароль:", password);
        } else {
          console.error(`❌ Пользователь с email ${email} не найден.`);
        }
        
        return false;
      }
    } catch (e) {
      console.error("❌ Ошибка при попытке входа:", e);
      return false;
    }
  }
  
  // Создаем тестового пользователя, если не найдено ни одного с паролем
  const hasUsableUsers = demoUsers.some(user => user.password);
  
  if (!hasUsableUsers) {
    console.log("Не найдено пользователей с установленными паролями. Создаю тестового пользователя...");
    
    const testUser = {
      id: 'test_user_' + Date.now(),
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      password: 'password123',
      phone: '+996 555 123456',
      userType: 'worker',
      photo: '',
      age: 25,
      skills: ['Тестирование', 'Работа с данными'],
      experience: '2 года опыта работы',
      hasOtherJobs: false,
      authProvider: 'local',
      token: 'test_token_' + Date.now()
    };
    
    demoUsers.push(testUser);
    localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
    
    console.log("=========================================");
    console.log("Тестовый пользователь создан!");
    console.log("Используйте следующие данные для входа:");
    console.log("Email: test@example.com");
    console.log("Пароль: password123");
    console.log("=========================================");
    
    // Тестируем вход с созданным пользователем
    testDemoLogin('test@example.com', 'password123');
  } else {
    // Тестируем вход с первым найденным пользователем, у которого есть пароль
    const testUser = demoUsers.find(user => user.password);
    if (testUser) {
      console.log("Тестирую вход с существующим пользователем:");
      console.log(`Email: ${testUser.email}, Пароль: ${testUser.password}`);
      testDemoLogin(testUser.email, testUser.password);
    }
  }
  
  // Возвращаем инструкции для пользователя
  return {
    message: "Проверьте консоль для деталей отладки авторизации. Используйте учетные данные из списка для входа."
  };
})(); 