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
                  <h1 class="board-title">Overdue Report</h1>
                </div>

                <div class="board-filters">
                  <label for="period">Select Period:</label>
                  <select id="period" v-model="selectedPeriod" @change="fetchReport">
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div class="chart-container">
                  <canvas id="overdueChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineController
} from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import ReportsLinks from '@/components/ReportsLinks.vue'
import { useRoute } from 'vue-router'
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import { useAlertStore } from '@/stores/alertStore'

Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineController
)

interface OverdueData {
  [date: string]: number
}

const route = useRoute()
const projectId = ref(route.params.projectId.toString())
const selectedPeriod = ref('month')
const report = ref<OverdueData | null>(null)
const overdueChart = ref<Chart | null>(null)

const fetchReport = async () => {
  const now = new Date()
  let startDate: Date

  switch (selectedPeriod.value) {
    case 'week':
      startDate = startOfWeek(now)
      break
    case 'month':
      startDate = startOfMonth(now)
      break
    case 'year':
      startDate = startOfYear(now)
      break
    default:
      startDate = new Date(0) // Все время
  }

  try {
    const response = await axios.get(`/reports/project/${projectId.value}/overdue`, {
      params: { startDate: startDate.toISOString() }
    })
    report.value = response.data
    createChart()
  } catch (error: any) {
    console.error('Failed to generate report', error)
    useAlertStore().setAlert(`Failed to generate report: ${error.response?.data?.error}`, 'danger')
  }
}

const createChart = () => {
  if (overdueChart.value) {
    overdueChart.value.destroy()
  }

  const labels = Object.keys(report.value || {})
  const data = Object.values(report.value || {})

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Overdue Tasks',
        data,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2
      }
    ]
  }

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const ctx = document.getElementById('overdueChart') as HTMLCanvasElement
  overdueChart.value = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options
  })
}

onMounted(() => {
  fetchReport()
})
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
