<template>
  <div class="sidebar">
    <ul class="list-group">
      <li class="list-group-item" v-for="link in links" :key="link.name">
        <router-link :to="`/cabinet/reports/${projectId}/${link.path}`">{{ link.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  projectId: string
}>()

const links = [
  { name: 'Overdue Report', path: 'overdue' },
  { name: 'Priority Distribution Report', path: 'priority-distribution' },
  { name: 'Priority Report', path: 'priority' },
  { name: 'Progress Report', path: 'progress' },
  { name: 'Project Report', path: 'report' },
  { name: 'Team Performance Report', path: 'performance' },
  { name: 'Team Workload Report', path: 'workload' }
]
</script>

<style scoped>
.sidebar {
  width: 250px;
}
.list-group-item {
  cursor: pointer;
}
</style>
