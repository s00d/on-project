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
                  <h1 class="board-title">Project Report</h1>
                </div>

                <div class="board-filters">
                  <label for="period">Select Period:</label>
                  <select id="period" v-model="selectedPeriod" @change="fetchReport">
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>

                  <label for="user">Select User:</label>
                  <select id="user" v-model="selectedUser" @change="fetchReport">
                    <option value="all">All Users</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.username }}
                    </option>
                  </select>
                </div>

                <div v-if="report" class="mt-3">
                  <h3>{{ report.project }}</h3>
                  <p>{{ report.description }}</p>
                  <p>Completed Tasks: {{ report.completedTasks }}</p>
                  <p>Total Tasks: {{ report.totalTasks }}</p>
                </div>

                <!-- Диаграмма прогресса задач -->
                <div class="chart-container">
                  <canvas id="taskCompletionChart"></canvas>
                </div>

                <!-- Диаграмма распределения по статусу -->
                <div class="chart-container">
                  <canvas id="taskStatusChart"></canvas>
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
import { onMounted, ref } from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from 'vue-router'
import ReportsLinks from '@/components/ReportsLinks.vue'
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
} from 'chart.js'
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import { useAlertStore } from '@/stores/alertStore'

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
)

interface ProjectReport {
  project: string
  description: string
  completedTasks: number
  totalTasks: number
  taskStatusDistribution: Record<string, number>
}

interface User {
  id: string
  username: string
}

const route = useRoute()

const projectId = ref(route.params.projectId.toString())
const selectedPeriod = ref('month')
const selectedUser = ref('all')
const report = ref<ProjectReport | null>(null)
const users = ref<User[]>([])
const taskCompletionChart = ref<Chart<'doughnut', number[], string> | null>(null)
const taskStatusChart = ref<Chart<'bar', number[], string> | null>(null)

const fetchUsers = async () => {
  try {
    const response = await axios.get(`/project/${projectId.value}/users`)
    users.value = response.data
  } catch (error) {
    console.error('Failed to load users', error)
  }
}

const createCharts = () => {
  if (taskCompletionChart.value) {
    taskCompletionChart.value.destroy()
  }

  if (taskStatusChart.value) {
    taskStatusChart.value.destroy()
  }

  const ctxCompletion = document.getElementById('taskCompletionChart') as HTMLCanvasElement
  const ctxStatus = document.getElementById('taskStatusChart') as HTMLCanvasElement

  // Диаграмма прогресса выполнения задач
  taskCompletionChart.value = new Chart<'doughnut', number[], string>(ctxCompletion, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [
            report.value?.completedTasks || 0,
            (report.value?.totalTasks || 0) - (report.value?.completedTasks || 0)
          ],
          backgroundColor: ['#4caf50', '#f44336']
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })

  // Диаграмма распределения задач по статусам
  taskStatusChart.value = new Chart<'bar', number[], string>(ctxStatus, {
    type: 'bar',
    data: {
      labels: Object.keys(report.value?.taskStatusDistribution || {}),
      datasets: [
        {
          label: 'Task Status Distribution',
          data: Object.values(report.value?.taskStatusDistribution || {}),
          backgroundColor: ['#2196f3', '#ffeb3b', '#9c27b0', '#f44336', '#4caf50']
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })
}

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
    const response = await axios.get<ProjectReport>(`/reports/project/${projectId.value}`, {
      params: {
        startDate: startDate.toISOString(),
        user: selectedUser.value
      }
    })
    report.value = response.data
    createCharts()
  } catch (error: any) {
    console.error('Failed to generate report', error)
    useAlertStore().setAlert(`Failed to generate report: ${error.response?.data?.error}`, 'danger')
  }
}

onMounted(async () => {
  await fetchUsers()
  await fetchReport()
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

.mt-3 {
  margin-top: 20px;
}

.mt-3 h3 {
  font-size: 1.5rem;
  color: #2d3748;
}

.mt-3 p {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 10px;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 20px;
  margin-top: 20px;
}

.chart-container canvas {
  margin: auto;
  width: 100%;
  height: 100%;
}
</style>
