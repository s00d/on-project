<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container-fluid">
          <div class="row flex-nowrap">
            <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
              <ReportsLinks :project-id="projectId" />
            </div>

            <div class="col py-3">
              <div class="container mt-5">
                <h1>Team Performance Report</h1>
                <div v-if="report" class="mt-3">
                  <h3>Team Performance</h3>
                  <canvas id="performanceChart"></canvas>
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
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip)

interface ReportData {
  [key: string]: {
    total: number
    completed: number
  }
}

const route = useRoute()

const projectId = ref(route.params.projectId.toString())
const report = ref<ReportData | null>(null)
const performanceChart = ref<Chart | null>(null)

const createChart = () => {
  if (performanceChart.value) {
    performanceChart.value.destroy()
  }
  const ctx = document.getElementById('performanceChart') as HTMLCanvasElement
  const labels = Object.keys(report.value || {}).map((key) => `User ${key}`)
  const completed = Object.values(report.value || {}).map((val) => val.completed)
  const total = Object.values(report.value || {}).map((val) => val.total)

  const data = {
    labels,
    datasets: [
      {
        label: 'Completed Tasks',
        data: completed,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Total Tasks',
        data: total,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }
    ]
  }

  const options: ChartConfiguration['options'] = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  performanceChart.value = new Chart(ctx, {
    type: 'bar',
    data,
    options
  })
}

onMounted(async () => {
  try {
    const response = await axios.get(`/reports/project/${projectId.value}/performance`)
    report.value = response.data
    createChart()
  } catch (error) {
    console.error('Failed to generate report', error)
  }

  if (report.value) {
    createChart()
  }
})
</script>
