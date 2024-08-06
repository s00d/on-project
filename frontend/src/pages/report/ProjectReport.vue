<template>
  <div class="container mt-5">
    <h1>Project Report</h1>
    <form @submit.prevent="generateReport" class="mt-3">
      <div class="mb-3">
        <label for="projectId" class="form-label">Project ID</label>
        <input v-model="projectId" type="number" id="projectId" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary">Generate Report</button>
    </form>
    <div v-if="report" class="mt-3">
      <h3>{{ report.project }}</h3>
      <p>{{ report.description }}</p>
      <p>Completed Tasks: {{ report.completedTasks }}</p>
      <p>Total Tasks: {{ report.totalTasks }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';

interface ProjectReport {
  project: string;
  description: string;
  completedTasks: number;
  totalTasks: number;
}

const projectId = ref<number | null>(null);
const report = ref<ProjectReport | null>(null);

const generateReport = async () => {
  if (projectId.value !== null) {
    try {
      const response = await axios.get<ProjectReport>(`/reports/project/${projectId.value}`);
      report.value = response.data;
    } catch (error) {
      console.error('Failed to generate report', error);
    }
  }
};
</script>
