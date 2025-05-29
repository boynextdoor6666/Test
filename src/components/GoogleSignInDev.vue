<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  isRegister: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const router = useRouter();

// Create demo user data
const createDemoUser = (type = 'worker') => {
  return {
    id: `demo-${type}-${Date.now()}`,
    name: type === 'worker' ? 'Demo Worker' : 'Demo Employer',
    email: type === 'worker' ? 'demo.worker@example.com' : 'demo.employer@example.com',
    profilePicture: null,
    role: type,
    token: `demo-token-${Date.now()}`,
    authProvider: 'google'
  };
};

const handleDemoLogin = (userType = 'worker') => {
  const user = createDemoUser(userType);
  localStorage.setItem('user', JSON.stringify(user));
  router.push('/');
};
</script>

<template>
  <div class="google-dev-login">
    <h3>{{ t('googleAuth.demoUser') }}</h3>
    <p>{{ t('loginPage.testAccounts') }}</p>
    
    <div class="button-container">
      <button 
        class="demo-button worker"
        @click="handleDemoLogin('worker')"
      >
        <i class="fas fa-user-hard-hat"></i>
        {{ t('loginPage.worker') }}
      </button>
      
      <button 
        class="demo-button employer"
        @click="handleDemoLogin('employer')"
      >
        <i class="fas fa-building"></i>
        {{ t('loginPage.employer') }}
      </button>
    </div>
    
    <div class="info-message">
      <i class="fas fa-info-circle"></i>
      <span>{{ t('registerPage.errors.demoModeRegistrationUnavailable') }}</span>
    </div>
  </div>
</template>

<style scoped>
.google-dev-login {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin: 10px 0;
  text-align: center;
}

h3 {
  margin-top: 0;
  color: #333;
  font-size: 16px;
}

p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.demo-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s, transform 0.2s;
}

.demo-button:hover {
  transform: translateY(-2px);
}

.demo-button i {
  font-size: 16px;
}

.demo-button.worker {
  background-color: #4caf50;
  color: white;
}

.demo-button.worker:hover {
  background-color: #3d8b40;
}

.demo-button.employer {
  background-color: #2196f3;
  color: white;
}

.demo-button.employer:hover {
  background-color: #0d8aee;
}

.info-message {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
}

.info-message i {
  color: #ff9800;
}

@media (max-width: 480px) {
  .button-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 