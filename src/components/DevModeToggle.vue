<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { devUtils, isOfflineMode } from '@/utils/api';

const mode = ref(isOfflineMode() ? 'OFFLINE/DEMO' : 'ONLINE');
const isDev = ref(import.meta.env.DEV);

const toggleMode = () => {
  devUtils.toggleMode();
  mode.value = devUtils.getCurrentMode();
};

onMounted(() => {
  // Update mode every second
  setInterval(() => {
    mode.value = devUtils.getCurrentMode();
  }, 1000);
});
</script>

<template>
  <div v-if="isDev" class="dev-mode-toggle">
    <div class="dev-mode-panel">
      <div class="dev-mode-status" :class="{ 'online': mode === 'ONLINE', 'offline': mode === 'OFFLINE/DEMO' }">
        {{ mode }}
      </div>
      <button @click="toggleMode" class="dev-mode-button">
        Toggle Mode
      </button>
      <button @click="devUtils.forceOnline" class="dev-mode-button online">
        Force Online
      </button>
      <button @click="devUtils.forceOffline" class="dev-mode-button offline">
        Force Offline
      </button>
    </div>
  </div>
</template>

<style scoped>
.dev-mode-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.dev-mode-panel {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dev-mode-status {
  font-weight: bold;
  text-align: center;
  padding: 5px;
  border-radius: 3px;
}

.dev-mode-status.online {
  background-color: green;
}

.dev-mode-status.offline {
  background-color: #d9534f;
}

.dev-mode-button {
  background-color: #444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.dev-mode-button:hover {
  background-color: #666;
}

.dev-mode-button.online {
  background-color: green;
}

.dev-mode-button.online:hover {
  background-color: darkgreen;
}

.dev-mode-button.offline {
  background-color: #d9534f;
}

.dev-mode-button.offline:hover {
  background-color: #c9302c;
}
</style> 