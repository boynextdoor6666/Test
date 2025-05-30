// Тестирование системы отзывов о работодателях
// Запустите этот скрипт в консоли браузера для создания тестовых данных

(function() {
  console.log('Запуск теста системы отзывов о работодателях...');
  
  // Проверка наличия необходимых данных в localStorage
  const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
  console.log('Количество демо-пользователей:', demoUsers.length);
  
  // Находим работодателей
  const employers = demoUsers.filter(user => user.userType === 'employer');
  console.log('Количество работодателей:', employers.length);
  
  if (employers.length === 0) {
    console.log('Не найдено работодателей для тестирования');
    return;
  }
  
  // Выбираем первого работодателя
  const employerId = employers[0].id;
  console.log('ID выбранного работодателя:', employerId);
  
  // Создаем тестовые отзывы
  const testReviews = [
    {
      id: Date.now(),
      user_id: 'worker_test_1',
      employer_id: employerId,
      rating: 5,
      content: 'Отличный работодатель! Вовремя платит, четко ставит задачи, всегда на связи.',
      created_at: new Date().toISOString(),
      job_id: 1,
      user: {
        id: 'worker_test_1',
        name: 'Алексей Работник'
      }
    },
    {
      id: Date.now() + 1,
      user_id: 'worker_test_2',
      employer_id: employerId,
      rating: 4,
      content: 'Хороший работодатель, все условия соблюдает. Немного задерживает оплату, но всегда выплачивает полную сумму.',
      created_at: new Date(Date.now() - 86400000).toISOString(), // вчера
      job_id: 2,
      user: {
        id: 'worker_test_2',
        name: 'Мария Исполнитель'
      }
    },
    {
      id: Date.now() + 2,
      user_id: 'worker_test_3',
      employer_id: employerId,
      rating: 5,
      content: 'Очень доволен сотрудничеством. Всё четко и ясно, без лишних вопросов.',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
      job_id: 3,
      user: {
        id: 'worker_test_3',
        name: 'Иван Сотрудник'
      }
    }
  ];
  
  // Сохраняем отзывы в localStorage
  const existingReviews = JSON.parse(localStorage.getItem('demoReviews') || '[]');
  
  // Удаляем старые отзывы об этом работодателе, если они есть
  const filteredReviews = existingReviews.filter(review => review.employer_id !== employerId);
  
  // Добавляем новые отзывы
  const updatedReviews = [...filteredReviews, ...testReviews];
  localStorage.setItem('demoReviews', JSON.stringify(updatedReviews));
  
  console.log('Тестовые отзывы о работодателе успешно добавлены:', testReviews.length);
  
  // Обновляем рейтинг работодателя
  function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
  
  const employerReviews = updatedReviews.filter(review => review.employer_id === employerId);
  const averageRating = calculateAverageRating(employerReviews);
  
  // Обновляем информацию о работодателе
  const updatedEmployers = demoUsers.map(user => {
    if (user.id === employerId) {
      return {
        ...user,
        rating: averageRating,
        reviewCount: employerReviews.length
      };
    }
    return user;
  });
  
  localStorage.setItem('demoUsers', JSON.stringify(updatedEmployers));
  
  console.log('Обновлен рейтинг работодателя:', averageRating);
  console.log('Количество отзывов:', employerReviews.length);
  console.log('Тест завершен успешно!');
})(); 