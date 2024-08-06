<template>
  <div class="tabs mt-3">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/projects') }" to="/projects">Projects</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/reports') }" to="/reports">Reports</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/settings') }" to="/settings">Settings</router-link>
      </li>
    </ul>
    <div class="tab-content mt-3">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'TabsComponent',
  setup() {
    const route = useRoute();
    const isActive = (path: string) => route.path.startsWith(path);

    return { isActive };
  },
});
</script>
