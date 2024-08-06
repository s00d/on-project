<template>
  <div class="tabs mt-3">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet') }" to="/cabinet">Projects</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet/reports') }" to="/cabinet/reports">Reports</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet/settings') }" to="/cabinet/settings">Settings</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet/kanban') }" to="/cabinet/kanban">Kanban Board</router-link>
      </li>
      <li class="lnav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet/reports') }" to="/cabinet/reports">Reports</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('/cabinet/roles') }" to="/cabinet/roles">Roles & Permissions</router-link>
      </li>
    </ul>
    <div class="tab-content mt-3">
      <slot></slot>
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
