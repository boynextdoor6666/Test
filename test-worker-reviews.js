// Тестирование системы отзывов о работниках
// Запустите этот скрипт в консоли браузера для создания тестовых данных

(function() {
  console.log('Запуск теста системы отзывов о работниках...');
  
  // Проверка наличия необходимых данных в localStorage
  const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
  console.log('Количество демо-пользователей:', demoUsers.length);
  
  // Находим работников
  const workers = demoUsers.filter(user => user.userType === 'worker');
  console.log('Количество работников:', workers.length);
  
  if (workers.length === 0) {
    console.log('Не найдено работников для тестирования');
    return;
  }
  
  // Выбираем первого работника
  const workerId = workers[0].id;
  console.log('ID выбранного работника:', workerId);
  
  // Создаем тестовые отзывы
  const testReviews = [
    {
      id: Date.now(),
      user_id: 9999,
      worker_id: workerId,
      job_id: 1,
      rating: 5,
      content: 'Отличный работник! Быстро и качественно выполнил работу.',
      created_at: new Date().toISOString(),
      user: {
        id: 9999,
        name: 'Тестовый работодатель'
      }
    },
    {
      id: Date.now() + 1,
      user_id: 9998,
      worker_id: workerId,
      job_id: 2,
      rating: 4,
      content: 'Хороший специалист, но можно было выполнить работу быстрее.',
      created_at: new Date().toISOString(),
      user: {
        id: 9998,
        name: 'Другой работодатель'
      }
    }
  ];
  
  // Сохраняем отзывы в localStorage
  const savedReviews = JSON.parse(localStorage.getItem('demoWorkerReviews') || '[]');
  const updatedReviews = [...savedReviews, ...testReviews];
  localStorage.setItem('demoWorkerReviews', JSON.stringify(updatedReviews));
  
  console.log('Созданы тестовые отзывы для работника с ID:', workerId);
  console.log('Всего отзывов о работниках в системе:', updatedReviews.length);
  
  // Обновляем рейтинг работника
  function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
  
  // Получаем все отзывы для конкретного работника
  const workerReviews = updatedReviews.filter(review => review.worker_id === workerId);
  const averageRating = calculateAverageRating(workerReviews);
  
  // Обновляем информацию о работнике
  const updatedUsers = demoUsers.map(user => {
    if (user.id === workerId) {
      return {
        ...user,
        rating: averageRating,
        reviewCount: workerReviews.length
      };
    }
    return user;
  });
  
  localStorage.setItem('demoUsers', JSON.stringify(updatedUsers));
  console.log('Обновлен рейтинг для работника:', workerId);
  console.log('Новый средний рейтинг:', averageRating);
  console.log('Количество отзывов:', workerReviews.length);
  
  console.log('Тест завершен. Теперь перезагрузите страницу профиля работника.');
})(); 