<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Priority Distribution Report</h1>
          <form @submit.prevent="generateReport" class="mt-3">
            <div class="mb-3">
              <label for="projectId" class="form-label">Project ID</label>
              <input v-model="projectId" type="number" id="projectId" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary">Generate Report</button>
          </form>
          <div v-if="report" class="mt-3">
            <h3>Priority Distribution</h3>
            <canvas id="priorityDistributionChart"></canvas>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Chart, ArcElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import Tabs from "@/components/Tabs.vue";

Chart.register(ArcElement, CategoryScale, LinearScale, Tooltip);

interface ReportData {
  [key: string]: number;
}

const projectId = ref<number | null>(null);
const report = ref<ReportData | null>(null);
const priorityDistributionChart = ref<Chart | null>(null);

const generateReport = async () => {
  if (projectId.value) {
    try {
      const response = await axios.get(`/reports/project/${projectId.value}/priority`);
      report.value = response.data;
      createChart();
    } catch (error) {
      console.error('Failed to generate report', error);
    }
  }
};

const createChart = () => {
  if (priorityDistributionChart.value) {
    priorityDistributionChart.value.destroy();
  }
  const ctx = document.getElementById('priorityDistributionChart') as HTMLCanvasElement;
  const labels = Object.keys(report.value || {});
  const data = Object.values(report.value || {});

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Task Distribution by Priority',
        data,
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
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

  priorityDistributionChart.value = new Chart(ctx, {
    type: 'pie',
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
