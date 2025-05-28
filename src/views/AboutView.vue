<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Use the global i18n instance
const { t } = useI18n()
</script>

<template>
  <div class="about">
    <section class="section">
      <div class="container">
        <h1 class="text-center">{{ t('aboutTitle') }}</h1>
        <div class="about-content mt-5">
          <div class="about-image">
            <img src="/img/logo.jpg" alt="Tez Jumush" width="200" />
          </div>
          <div class="about-text">
            <h2>{{ t('aboutWhatIs') }}</h2>
            <p>
              {{ t('aboutDescription') }}
            </p>
            <p>
              {{ t('aboutSimplify') }}
            </p>

            <h3 class="mt-4">{{ t('aboutMission') }}</h3>
            <p>
              {{ t('aboutMissionDescription') }}
            </p>

            <h3 class="mt-4">{{ t('aboutHowWorks') }}</h3>
            <ul>
              <li>{{ t('aboutSteps.step1') }}</li>
              <li>{{ t('aboutSteps.step2') }}</li>
              <li>{{ t('aboutSteps.step3') }}</li>
              <li>{{ t('aboutSteps.step4') }}</li>
            </ul>

            <h3 class="mt-4">{{ t('aboutAdvantages') }}</h3>
            <ul>
              <li>{{ t('aboutAdvantagesList.adv1') }}</li>
              <li>{{ t('aboutAdvantagesList.adv2') }}</li>
              <li>{{ t('aboutAdvantagesList.adv3') }}</li>
              <li>{{ t('aboutAdvantagesList.adv4') }}</li>
              <li>{{ t('aboutAdvantagesList.adv5') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section team-section">
      <div class="container">
        <h2 class="text-center">{{ t('aboutTeam') }}</h2>
        <p class="text-center">
          {{ t('aboutTeamDescription') }}
        </p>

        <div class="contact-us mt-5 text-center">
          <h3>{{ t('contactUs') }}</h3>
          <p>{{ t('aboutContactText') }}</p>
          <a href="https://t.me/tezJumush" target="_blank" class="btn btn-primary mt-3"
            >{{ t('telegramChannel') }}</a
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-content {
  display: flex;
  gap: 50px;
  align-items: flex-start;
}

.about-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.about-text {
  flex: 2;
}

.team-section {
  background-color: var(--bg-color);
}

ul {
  margin-left: 20px;
}

li {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .about-content {
    flex-direction: column;
  }

  .about-image {
    margin-bottom: 30px;
  }
}
</style>
