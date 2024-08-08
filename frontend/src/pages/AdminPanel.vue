<template>
  <div class="admin-panel">
    <div class="d-flex">
      <div class="content p-3" style="margin-left: 250px">
        <Tabs />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tabs from '@/components/Tabs.vue'

export default defineComponent({
  name: 'AdminPanel',
  components: {
    Tabs
  }
})
</script>

<style scoped>
.admin-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.content {
  flex-grow: 1;
}
</style>
