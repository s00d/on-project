<template>
  <div v-if="alertStore.message" :class="`alert alert-${alertStore.type}`" role="alert">
    {{ alertStore.message }}
    <button type="button" class="btn-close" aria-label="Close" @click="alertStore.clearAlert"></button>
  </div>
</template>

<script lang="ts" setup>
import { useAlertStore } from '@/stores/alertStore';
import { computed } from 'vue';

const alertStore = useAlertStore();
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
