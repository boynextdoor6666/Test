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
    },
    {
      path: '/jobs/:id',
      name: 'job-details',
      component: () => import('../views/JobDetailView.vue'),
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
  ],
})

// Имитация проверки авторизации (в реальном приложении это будет работать с токенами)
router.beforeEach((to, from, next) => {
  // Если маршрут требует авторизации
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // В реальном приложении здесь будет проверка наличия токена
    const isAuthenticated = localStorage.getItem('user') !== null

    if (!isAuthenticated) {
      // Перенаправляем на страницу входа
      next({ name: 'login' })
    } else {
      // Разрешаем доступ к маршруту
      next()
    }
  } else {
    // Если маршрут не требует авторизации, просто разрешаем доступ
    next()
  }
})

export default router
