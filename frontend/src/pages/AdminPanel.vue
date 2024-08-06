<template>
  <div class="admin-panel">
    <HeaderComponent />
    <div class="d-flex">
      <Sidebar />
      <div class="content p-3" style="margin-left: 250px;">
        <Tabs />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeaderComponent from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import Tabs from '@/components/Tabs.vue';

export default defineComponent({
  name: 'AdminPanel',
  components: {
    HeaderComponent,
    Sidebar,
    Tabs,
  },
});
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
