// Скрипт для исправления данных вакансий
// Запустите этот скрипт в консоли браузера

(function() {
  console.log("Запуск скрипта для исправления данных вакансий...");
  
  // Получаем текущие вакансии
  const jobs = JSON.parse(localStorage.getItem('demoJobs') || '[]');
  console.log(`Найдено ${jobs.length} вакансий.`);
  
  if (jobs.length === 0) {
    console.error("Вакансии не найдены!");
    return;
  }
  
  // Исправляем данные вакансий
  const updatedJobs = jobs.map((job, index) => {
    // Добавляем employer_id, если его нет
    if (!job.employer_id) {
      job.employer_id = job.user_id || (index + 1);
      console.log(`Добавлен employer_id = ${job.employer_id} для вакансии ${job.title}`);
    }
    
    // Устанавливаем рейтинг и количество отзывов по умолчанию, если их нет
    if (job.employer_rating === undefined) {
      const randomRating = (3 + Math.random() * 2).toFixed(1); // Случайное число от 3.0 до 5.0
      job.employer_rating = parseFloat(randomRating);
      console.log(`Добавлен employer_rating = ${job.employer_rating} для вакансии ${job.title}`);
    }
    
    if (job.employer_review_count === undefined) {
      job.employer_review_count = Math.floor(Math.random() * 20) + 1; // Случайное число от 1 до 20
      console.log(`Добавлен employer_review_count = ${job.employer_review_count} для вакансии ${job.title}`);
    }
    
    return job;
  });
  
  // Сохраняем обновленные вакансии
  localStorage.setItem('demoJobs', JSON.stringify(updatedJobs));
  console.log("Вакансии обновлены!");
  
  // Генерируем тестовые отзывы для первой вакансии
  const firstJob = updatedJobs[0];
  const employerId = firstJob.employer_id;
  
  // Создаем тестовые отзывы
  const testReviews = [
    {
      id: Date.now(),
      user_id: 9999,
      employer_id: employerId,
      rating: 5,
      content: 'Отличный работодатель! Рекомендую всем.',
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
      content: 'Хороший работодатель, платит вовремя. Есть некоторые моменты, но в целом всё хорошо.',
      created_at: new Date().toISOString(),
      user: {
        id: 9998,
        name: 'Другой тестовый пользователь'
      }
    }
  ];
  
  // Сохраняем тестовые отзывы
  localStorage.setItem('demoReviews', JSON.stringify(testReviews));
  console.log(`Созданы тестовые отзывы для работодателя с ID ${employerId}.`);
  
  console.log("Скрипт выполнен. Перезагрузите страницу.");
  
  // Возвращаем обновленное количество вакансий и отзывов для проверки
  return {
    jobsCount: updatedJobs.length,
    reviewsCount: testReviews.length,
    firstJobEmployerId: firstJob.employer_id
  };
})(); 