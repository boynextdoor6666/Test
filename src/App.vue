<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>

<template>
  <Navbar />
  <div class="app-container">
    <router-view />
  </div>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-heading tez-jumush-text">TEZ JUMUSH</h3>
          <p class="footer-text">
            Платформа для быстрого поиска работы и надежных работников в Кыргызстане. Найдите
            подходящую работу или сотрудников для ваших задач уже сегодня!
          </p>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">Навигация</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/" class="footer-link">
                <i class="fas fa-home"></i> Главная
              </router-link>
            </li>
            <li>
              <router-link to="/jobs" class="footer-link">
                <i class="fas fa-briefcase"></i> Найти работу
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="footer-link">
                <i class="fas fa-info-circle"></i> О нас
              </router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">Контакты</h3>
          <ul class="footer-links">
            <li>
              <a href="tel:+996551714547" class="footer-link">
                <i class="fas fa-phone"></i> +996 551 714 547
              </a>
            </li>
            <li>
              <a href="tel:+996556031224" class="footer-link">
                <i class="fas fa-phone"></i> +996 556 031 224
              </a>
            </li>
            <li>
              <a href="mailto:tezjumush.ksla@gmail.com" class="footer-link">
                <i class="fas fa-envelope"></i> tezjumush.ksla@gmail.com
              </a>
            </li>
            <li></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">Социальные сети</h3>
          <div class="social-links">
            <a href="https://t.me/tezJumush" target="_blank" class="social-link">
              <i class="fab fa-telegram"></i> Telegram
            </a>
            <a
              href="https://www.instagram.com/tezjumush.kg?igsh=b3NodHNpcDBrZ2V3&utm_source=qr"
              target="_blank"
              class="social-link"
            >
              <i class="fab fa-instagram"></i> Instagram
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ new Date().getFullYear() }} <span class="tez-jumush-text">TEZ JUMUSH</span>. Все
          права защищены.
        </p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-link-small">
            <i class="fas fa-file-alt"></i> Правила использования
          </a>
          <span class="footer-divider">|</span>
          <a href="#" class="footer-link-small">
            <i class="fas fa-shield-alt"></i> Политика конфиденциальности
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
.app-container {
  min-height: calc(100vh - 280px);
}

.footer {
  background-color: #222a36;
  color: white;
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  color: white;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  position: relative;
  padding-bottom: var(--spacing-xs);
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.footer-text {
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-family-body);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: var(--font-family-body);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.footer-link:hover {
  color: white;
  transform: translateX(3px);
}

.footer-link i {
  margin-right: var(--spacing-sm);
  width: 20px;
  text-align: center;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.social-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: var(--font-family-body);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: var(--spacing-xs) 0;
}

.social-link:hover {
  color: white;
  transform: translateY(-2px);
}

.social-link i {
  margin-right: var(--spacing-sm);
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: var(--spacing-md);
  transition: all 0.3s ease;
}

.social-link:hover i {
  background-color: var(--primary-color);
  transform: scale(1.1);
}

.social-link i.fa-telegram {
  background-color: rgba(0, 136, 204, 0.2);
}

.social-link:hover i.fa-telegram {
  background-color: #0088cc;
}

.social-link i.fa-instagram {
  background-color: rgba(225, 48, 108, 0.2);
}

.social-link:hover i.fa-instagram {
  background-color: #e1306c;
}

.social-link i.fa-facebook-f {
  background-color: rgba(66, 103, 178, 0.2);
}

.social-link:hover i.fa-facebook-f {
  background-color: #4267b2;
}

.social-link i.fa-whatsapp {
  background-color: rgba(37, 211, 102, 0.2);
}

.social-link:hover i.fa-whatsapp {
  background-color: #25d366;
}

.tez-jumush-text {
  color: #0066b3;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.copyright {
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.footer-link-small {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.footer-link-small:hover {
  color: white;
}

.footer-link-small i {
  margin-right: 6px;
}

.footer-divider {
  color: rgba(255, 255, 255, 0.3);
  margin: 0 var(--spacing-xs);
}

@media (max-width: 768px) {
  .footer-content {
    gap: var(--spacing-lg);
  }

  .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .footer-bottom-links {
    justify-content: center;
  }
}
</style>
