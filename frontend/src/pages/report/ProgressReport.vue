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
                <h1>Progress Report</h1>
                <div v-if="report" class="mt-3">
                  <h3>Task Progress</h3>
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
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

interface ProgressData {
  [date: string]: {
    total: number
    completed: number
  }
}

const route = useRoute()
const projectId = ref(route.params.projectId.toString())

const report = ref<ProgressData | null>(null)
const progressChart = ref<Chart | null>(null)

const createChart = () => {
  if (progressChart.value) {
    progressChart.value.destroy()
  }
  const ctx = document.getElementById('progressChart') as HTMLCanvasElement
  const labels = Object.keys(report.value || {})
  const totalData = Object.values(report.value || {}).map((val) => val.total)
  const completedData = Object.values(report.value || {}).map((val) => val.completed)

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
  }

  const options: ChartConfiguration['options'] = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  progressChart.value = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options
  })
}

onMounted(async () => {
  if (projectId.value) {
    try {
      const response = await axios.get(`/reports/project/${projectId.value}/progress`)
      report.value = response.data
      createChart()
    } catch (error) {
      console.error('Failed to generate report', error)
    }
  }
  if (report.value) {
    createChart()
  }
})
</script>
