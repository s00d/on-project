<template>
  <div class="sidebar bg-light">
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <router-link to="/projects">Projects</router-link>
      </li>
      <li class="list-group-item">
        <router-link to="/kanban">Kanban Board</router-link>
      </li>
      <li class="list-group-item">
        <router-link to="/reports">Reports</router-link>
      </li>
      <li class="list-group-item">
        <router-link to="/roles">Roles & Permissions</router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SidebarComponent',
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  padding-top: 60px;
}
</style>
