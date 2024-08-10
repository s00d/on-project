<template>
  <div class="sidebar">
    <ul class="list-group">
      <li class="list-group-item" v-for="link in links" :key="link.name">
        <router-link :to="{ name: link.routeName, params: { projectId: projectId } }">{{
          link.name
        }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import UniversalReport from '@/pages/report/UniversalReport.vue'

const props = defineProps<{
  projectId: string
}>()

const links = [
  { name: 'Overdue Report', routeName: 'OverdueReport' },
  { name: 'Priority Distribution Report', routeName: 'PriorityDistributionReport' },
  { name: 'Priority Report', routeName: 'PriorityReport' },
  { name: 'Progress Report', routeName: 'ProgressReport' },
  { name: 'Project Report', routeName: 'ProjectReport' },
  { name: 'Team Performance Report', routeName: 'TeamPerformanceReport' },
  { name: 'Team Workload Report', routeName: 'TeamWorkloadReport' },
  { name: 'Universal Report Builder', routeName: 'UniversalReport' }
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
