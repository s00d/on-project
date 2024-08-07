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
                <h1>Project Report</h1>
                <div v-if="report" class="mt-3">
                  <h3>{{ report.project }}</h3>
                  <p>{{ report.description }}</p>
                  <p>Completed Tasks: {{ report.completedTasks }}</p>
                  <p>Total Tasks: {{ report.totalTasks }}</p>
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
import {onMounted, ref} from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";

interface ProjectReport {
  project: string
  description: string
  completedTasks: number
  totalTasks: number
}

const route = useRoute()

const projectId = ref(route.params.projectId.toString())
const report = ref<ProjectReport | null>(null)

onMounted(async () => {
  try {
    const response = await axios.get<ProjectReport>(`/reports/project/${projectId.value}`)
    report.value = response.data
  } catch (error) {
    console.error('Failed to generate report', error)
  }
});
</script>
