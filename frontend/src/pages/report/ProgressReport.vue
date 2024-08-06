<template>
  <div class="container mt-5">
    <h1>Progress Report</h1>
    <form @submit.prevent="generateReport" class="mt-3">
      <div class="mb-3">
        <label for="projectId" class="form-label">Project ID</label>
        <input v-model="projectId" type="number" id="projectId" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary">Generate Report</button>
    </form>
    <div v-if="report" class="mt-3">
      <h3>Task Progress</h3>
      <canvas id="progressChart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface ProgressData {
  [date: string]: {
    total: number;
    completed: number;
  };
}

const projectId = ref<number | null>(null);
const report = ref<ProgressData | null>(null);
const progressChart = ref<Chart | null>(null);

const generateReport = async () => {
  if (projectId.value) {
    try {
      const response = await axios.get("/reports/project/${projectId.value}/progress");
      report.value = response.data;
      createChart();
    } catch (error) {
      console.error('Failed to generate report', error);
    }
  }
};

const createChart = () => {
  if (progressChart.value) {
    progressChart.value.destroy();
  }
  const ctx = document.getElementById('progressChart') as HTMLCanvasElement;
  const labels = Object.keys(report.value || {});
  const totalData = Object.values(report.value || {}).map(val => val.total);
  const completedData = Object.values(report.value || {}).map(val => val.completed);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Tasks',
  data: totalData,
    fill: false,
    borderColor: 'rgba(54, 162, 235, 1)',
  backgroundColor: 'rgba(54, 162, 235, 0.2)',
  borderWidth: 1,
},
  {
    label: 'Completed Tasks',
    data: completedData,
      fill: false,
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderWidth: 1,
  },
],
};

  const options: ChartConfiguration['options'] = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  progressChart.value = new Chart(ctx, {
    type: 'line',
  data: chartData,
    options,
});
};

onMounted(() => {
  if (report.value) {
    createChart();
  }
});
</script>
