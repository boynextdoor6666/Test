// Тестирование системы отзывов
// Запустите этот скрипт в консоли браузера для создания тестовых данных

(function() {
  console.log('Запуск теста системы отзывов...');
  
  // Проверка наличия необходимых данных в localStorage
  const demoJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]');
  console.log('Количество демо-вакансий:', demoJobs.length);
  
  if (demoJobs.length > 0) {
    console.log('Пример вакансии:', demoJobs[0]);
    console.log('employer_id вакансии:', demoJobs[0].employer_id);
  }
  
  // Создаем тестовые отзывы
  const employerId = demoJobs.length > 0 ? demoJobs[0].employer_id : 1;
  
  // Создаем тестовые отзывы
  const testReviews = [
    {
      id: Date.now(),
      user_id: 9999,
      employer_id: employerId,
      rating: 5,
      content: 'Отличный работодатель! Тестовый отзыв 1.',
      created_at: new Date().toISOString(),
      user: {
        id: 9999,
        name: 'Тестовый пользователь'
      }
    },
    {
      id: Date.now() + 1,
      user_id: 9998,
      employer_id: employerId,
      rating: 4,
      content: 'Хороший работодатель, но есть некоторые моменты. Тестовый отзыв 2.',
      created_at: new Date().toISOString(),
      user: {
        id: 9998,
        name: 'Другой тестовый пользователь'
      }
    }
  ];
  
  // Сохраняем отзывы в localStorage
  const savedReviews = JSON.parse(localStorage.getItem('demoReviews') || '[]');
  const updatedReviews = [...savedReviews, ...testReviews];
  localStorage.setItem('demoReviews', JSON.stringify(updatedReviews));
  
  console.log('Созданы тестовые отзывы для работодателя с ID:', employerId);
  console.log('Всего отзывов в системе:', updatedReviews.length);
  
  // Обновляем рейтинг работодателя
  function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
  
  // Получаем все отзывы для конкретного работодателя
  const employerReviews = updatedReviews.filter(review => review.employer_id === employerId);
  const averageRating = calculateAverageRating(employerReviews);
  
  // Обновляем вакансии с соответствующим employer_id
  const updatedJobs = demoJobs.map(job => {
    if (job.employer_id === employerId) {
      return {
        ...job,
        employer_rating: averageRating,
        employer_review_count: employerReviews.length
      };
    }
    return job;
  });
  
  localStorage.setItem('demoJobs', JSON.stringify(updatedJobs));
  console.log('Обновлены рейтинги для вакансий с employer_id:', employerId);
  console.log('Новый средний рейтинг:', averageRating);
  console.log('Количество отзывов:', employerReviews.length);
  
  console.log('Тест завершен. Теперь перезагрузите страницу с деталями вакансии.');
})(); 