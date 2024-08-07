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
                <h1>Priority Distribution Report</h1>
                <div v-if="report" class="mt-3">
                  <h3>Priority Distribution</h3>
                  <canvas id="priorityDistributionChart"></canvas>
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
import { Chart, ArcElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import ReportsLinks from "@/components/ReportsLinks.vue";
import {useRoute} from "vue-router";

Chart.register(ArcElement, CategoryScale, LinearScale, Tooltip)

interface ReportData {
  [key: string]: number
}

const route = useRoute()
const projectId = ref(route.params.projectId.toString())

const report = ref<ReportData | null>(null)
const priorityDistributionChart = ref<Chart | null>(null)

const createChart = () => {
  if (priorityDistributionChart.value) {
    priorityDistributionChart.value.destroy()
  }
  const ctx = document.getElementById('priorityDistributionChart') as HTMLCanvasElement
  const labels = Object.keys(report.value || {})
  const data = Object.values(report.value || {})

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Task Distribution by Priority',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
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

  priorityDistributionChart.value = new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options
  })
}

onMounted(async () => {
  try {
    const response = await axios.get(`/reports/project/${projectId.value}/priority`)
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
