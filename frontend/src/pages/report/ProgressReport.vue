<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container-fluid">
          <div class="row flex-nowrap">
            <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
              <ReportsLinks :project-id="projectId" />
            </div>

            <div class="col p-0">
              <div class="project-board">
                <div class="board-header">
                  <h1 class="board-title">Progress Report</h1>
                </div>

                <div class="board-filters">
                  <label for="period">Select Period:</label>
                  <select id="period" v-model="selectedPeriod" @change="fetchReport">
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>

                  <label for="chartType">Select Chart Type:</label>
                  <select id="chartType" v-model="selectedChartType" @change="createChart">
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>

                <div class="chart-container">
                  <canvas id="progressChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Chart,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  BarController
} from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import {useAlertStore} from "@/stores/alertStore";

Chart.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, LineController, BarController)

interface ProgressData {
  [date: string]: {
    total: number
    completed: number
  }
}

const route = useRoute()
const projectId = ref(route.params.projectId.toString())
const selectedPeriod = ref('month')
const selectedChartType = ref<"line"|"bar">('line')

const report = ref<ProgressData | null>(null)
const progressChart = ref<Chart | null>(null)

const fetchReport = async () => {
  const now = new Date();
  let startDate: Date;

  switch (selectedPeriod.value) {
    case 'week':
      startDate = startOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      break;
    default:
      startDate = new Date(0); // Все время
  }

  try {
    const response = await axios.get(`/reports/project/${projectId.value}/progress`, {
      params: { startDate: startDate.toISOString() }
    });
    report.value = response.data;
    createChart();
  } catch (error: any) {
    console.error('Failed to generate report', error);
    useAlertStore().setAlert(`Failed to generate report: ${error.response?.data?.error}`, 'danger')
  }
}

const createChart = () => {
  if (progressChart.value) {
    progressChart.value.destroy();
  }

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
        borderWidth: 1
      },
      {
        label: 'Completed Tasks',
        data: completedData,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }
    ]
  };

  const options: ChartConfiguration['options'] = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const ctx = document.getElementById('progressChart') as HTMLCanvasElement;
  progressChart.value = new Chart(ctx, {
    type: selectedChartType.value,
    data: chartData,
    options
  });
}

onMounted(() => {
  fetchReport();
});
</script>

<style scoped>
.project-board {
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
  border-radius: 8px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
}

.board-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.board-filters label {
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
}

.board-filters select {
  padding: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background-color: #fff;
  color: #4a5568;
}

.chart-container {
  position: relative;
  height: 600px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.chart-container canvas {
  margin: auto;
  width: 600px;
}
</style>
