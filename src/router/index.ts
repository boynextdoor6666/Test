import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('../views/JobsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/jobs/:id',
      name: 'job-details',
      component: () => import('../views/JobDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    // Маршрут для перенаправления при попытке доступа к несуществующим страницам
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Проверка авторизации для защищенных маршрутов
router.beforeEach((to, from, next) => {
  // Если маршрут требует авторизации
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Проверяем наличие пользователя в localStorage
    const isAuthenticated = localStorage.getItem('user') !== null

    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      next({
        name: 'login',
        // Сохраняем путь, на который пытался перейти пользователь
        query: { redirect: to.fullPath },
      })
    } else {
      // Если пользователь авторизован, разрешаем доступ
      next()
    }
  } else {
    // Если маршрут не требует авторизации, просто разрешаем доступ
    next()
  }
})

export default router
