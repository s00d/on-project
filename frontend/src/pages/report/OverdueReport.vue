<template>
  <div class="container mt-5">
    <h1>Overdue Report</h1>
    <form @submit.prevent="generateReport" class="mt-3">
      <div class="mb-3">
        <label for="projectId" class="form-label">Project ID</label>
        <input v-model="projectId" type="number" id="projectId" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary">Generate Report</button>
    </form>
    <div v-if="report" class="mt-3">
      <h3>Overdue Tasks: {{ report.overdueTasks }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'OverdueReport',
  setup() {
    const projectId = ref<number | null>(null);
    const report = ref<{ overdueTasks: number } | null>(null);

    const generateReport = async () => {
      if (projectId.value !== null) {
        try {
          const response = await axios.get(`/reports/project/${projectId.value}/overdue`);
          report.value = response.data;
        } catch (error) {
          console.error('Failed to generate report', error);
        }
      }
    };

    return { projectId, report, generateReport };
  },
});
</script>
