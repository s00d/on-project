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
              <div class="project-board"> <!-- Изменили класс на project-board -->
                <div class="board-header">
                  <h1 class="board-title">Task Distribution Report</h1>
                </div>

                <div class="board-filters"> <!-- Новый элемент для фильтров -->
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
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
                  </select>

                  <label for="reportType">Select Report Type:</label>
                  <select id="reportType" v-model="selectedReportType" @change="fetchReport">
                    <option value="priority">Priority Distribution</option>
                    <option value="status">Status Distribution</option>
                  </select>
                </div>

                <p class="total-tasks">Total Tasks: {{ totalTasks }}</p>

                <div class="chart-container">
                  <canvas id="distributionChart"></canvas>
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, PieController, BarController } from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import ReportsLinks from "@/components/ReportsLinks.vue";
import { useRoute } from "vue-router";
import {useProjectStore} from "@/stores/projectStore";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, PieController, BarController)

interface ReportData {
  [key: string]: number
}

interface User {
  id: string
  username: string
}

const projectStore = useProjectStore()

const route = useRoute()
const projectId = route.params.projectId.toString()
const selectedPeriod = ref('month')
const selectedUser = ref('all')
const selectedReportType = ref('priority') // Новый реф для типа отчета

const users = ref<{[key: number]: User}>([])
const report = ref<ReportData | null>(null)
const distributionChart = ref<Chart | null>(null) // Объединяем графики в один

const totalTasks = computed(() => Object.values(report.value || {}).reduce((sum, count) => sum + count, 0))

const fetchUsers = async () => {
  try {
    users.value = await projectStore.fetchUsers(Number(projectId))
  } catch (error) {
    console.error('Failed to load users', error)
  }
}

const createChart = () => {
  if (distributionChart.value) {
    distributionChart.value.destroy()
  }

  const labels = Object.keys(report.value || {})
  const data = Object.values(report.value || {})

  const chartData = {
    labels,
    datasets: [
      {
        label: selectedReportType.value === 'priority' ? 'Task Distribution by Priority' : 'Task Distribution by Status',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  const options: ChartConfiguration['options'] = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`
        }
      }
    }
  }

  const ctx = document.getElementById('distributionChart') as any
  distributionChart.value = new Chart(ctx.getContext('2d'), {
    type: selectedReportType.value === 'priority' ? 'pie' : 'bar', // Меняем тип графика в зависимости от отчета
    data: chartData,
    options
  })
}

const fetchReport = async () => {
  try {
    const response = await axios.get(`/reports/project/${projectId}/priority_distribution?period=${selectedPeriod.value}&user=${selectedUser.value}&type=${selectedReportType.value}`)
    report.value = response.data
    createChart()
  } catch (error) {
    console.error('Failed to generate report', error)
  }
}

onMounted(async  () => {
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

.total-tasks {
  font-size: 1.2em;
  color: #2d3748;
  font-weight: bold;
  margin-top: 10px;
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

