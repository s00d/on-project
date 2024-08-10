<template>
  <div class="alert-container">
    <div
      v-for="(alert, index) in alertStore.alerts"
      :key="index"
      :class="`alert alert-${alert.type}`"
      role="alert"
    >
      {{ alert.message }}
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="alertStore.clearAlert(alert.message)"
      ></button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAlertStore } from '@/stores/alertStore'
import { computed } from 'vue'

const alertStore = useAlertStore()
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between each alert */
}

.alert {
  margin-bottom: 0; /* Remove margin since we are using gap */
}
</style>
