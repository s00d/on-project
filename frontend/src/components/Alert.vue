<template>
  <div v-if="message" :class="`alert alert-${type}`" role="alert">
    {{ message }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAlertStore } from '@/stores/alertStore';


export default defineComponent({
  name: 'Alert',
  setup() {
    const alertStore = useAlertStore();
    const { message, type } = alertStore;

    return { message, type };
  },
});
</script>
