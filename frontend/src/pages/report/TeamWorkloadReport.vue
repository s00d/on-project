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
                <h1>Team Workload Report</h1>
                <div v-if="report" class="mt-3">
                  <h3>Workload Distribution</h3>
                  <canvas id="teamWorkloadChart"></canvas>
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
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip)

interface WorkloadData {
  [assignee: string]: number
}

const route = useRoute()

const projectId = ref(route.params.projectId.toString())
const report = ref<WorkloadData | null>(null)
const teamWorkloadChart = ref<Chart | null>(null)

const createChart = () => {
  if (teamWorkloadChart.value) {
    teamWorkloadChart.value.destroy()
  }
  const ctx = document.getElementById('teamWorkloadChart') as HTMLCanvasElement
  const labels = Object.keys(report.value || {})
  const data = Object.values(report.value || {})

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Task Workload',
        data,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
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

  teamWorkloadChart.value = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options
  })
}

onMounted(async () => {
  try {
    const response = await axios.get(`/reports/project/${projectId.value}/workload`)
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
