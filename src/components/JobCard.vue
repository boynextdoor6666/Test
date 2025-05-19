<script setup lang="ts">
interface Job {
  id: number
  title: string
  description: string
  salary: string
  location: string
  phone: string
  date: string
}

defineProps<{
  job: Job
}>()
</script>

<template>
  <div class="job-card">
    <h3 class="job-title">{{ job.title }}</h3>
    <p class="job-description">{{ job.description }}</p>

    <div class="job-details">
      <div class="job-detail">
        <i class="icon-location"></i>
        <span>{{ job.location }}</span>
      </div>
      <div class="job-detail">
        <i class="icon-money"></i>
        <span>{{ job.salary }}</span>
      </div>
      <div class="job-detail">
        <i class="icon-phone"></i>
        <span>{{ job.phone }}</span>
      </div>
    </div>

    <div class="job-footer">
      <div class="job-actions">
        <router-link :to="`/jobs/${job.id}`" class="btn btn-primary">Подробнее</router-link>
      </div>
      <div class="job-date">
        <small>{{ new Date(job.date).toLocaleDateString('ru-RU') }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-card {
  border-radius: var(--radius-lg);
  background-color: white;
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow);
}

.job-title {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  height: 2.6rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.job-description {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  font-size: 0.95rem;
  line-height: 1.5;
  height: 4.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.job-detail {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: var(--spacing-xs) 0;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.job-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.job-date {
  color: var(--text-light);
  font-size: 0.85rem;
  font-family: var(--font-family-body);
}

/* Icons */
.icon-location,
.icon-money,
.icon-phone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-sm);
  color: var(--primary-color);
}

.icon-location::before {
  content: '📍';
}

.icon-money::before {
  content: '💰';
}

.icon-phone::before {
  content: '📞';
}

@media (max-width: 768px) {
  .job-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .job-date {
    width: 100%;
    text-align: left;
    margin-top: var(--spacing-xs);
  }
}
</style>
