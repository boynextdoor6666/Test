import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './utils/i18n'
import { applyTheme, getPreferredTheme } from './utils/theme'

// Apply theme early to prevent flash of wrong theme
applyTheme(getPreferredTheme())

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
