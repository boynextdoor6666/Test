// Скрипт для создания тестового пользователя
// Запустите этот скрипт в консоли браузера

(function() {
  console.log("Создаю тестового пользователя...");
  
  // Получаем текущих демо-пользователей
  const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
  console.log(`Найдено ${demoUsers.length} демо-пользователей.`);
  
  // Создаем тестового пользователя
  const testUser = {
    id: 'test_user_' + Date.now(),
    name: 'Тестовый Пользователь',
    email: 'test@example.com',
    password: 'password123',
    phone: '+996 555 123456',
    userType: 'worker', // или 'employer'
    photo: '',
    age: 25,
    skills: ['Тестирование', 'Работа с данными'],
    experience: '2 года опыта работы',
    hasOtherJobs: false,
    authProvider: 'local',
    token: 'test_token_' + Date.now()
  };
  
  // Проверяем, существует ли пользователь с таким email
  const existingUserIndex = demoUsers.findIndex(user => user.email === testUser.email);
  
  if (existingUserIndex !== -1) {
    // Обновляем существующего пользователя
    console.log(`Пользователь с email ${testUser.email} уже существует, обновляем данные...`);
    demoUsers[existingUserIndex] = testUser;
  } else {
    // Добавляем нового пользователя
    console.log(`Добавляем нового пользователя с email ${testUser.email}...`);
    demoUsers.push(testUser);
  }
  
  // Сохраняем обновленный список пользователей
  localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
  
  // Выводим информацию для входа
  console.log("=========================================");
  console.log("Тестовый пользователь создан!");
  console.log("Используйте следующие данные для входа:");
  console.log("Email: test@example.com");
  console.log("Пароль: password123");
  console.log("=========================================");
  
  return {
    email: testUser.email,
    password: testUser.password
  };
})(); 