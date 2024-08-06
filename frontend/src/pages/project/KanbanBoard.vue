<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div>
          <h1>Kanban Board</h1>
          <div class="kanban-columns">
            <KanbanColumn
              v-for="status in statuses"
              :key="status"
              :status="status"
              :project-id="projectId"
              @task-dropped="onTaskDropped"
            />
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import KanbanColumn from '../../components/KanbanColumn.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Tabs.vue'

const route = useRoute()
const projectId = route.params.projectId.toString()
const statuses = ref(['To Do', 'In Progress', 'Done'])
const taskStore = useTaskStore()

onMounted(async () => {
  const pId = parseInt(projectId.toString())
  await taskStore.fetchTasks(pId, {})
})

const onTaskDropped = async (taskId: number, newStatus: string) => {
  await taskStore.updateTask(parseInt(projectId), taskId, { status: newStatus })
}
</script>

<style>
.kanban-columns {
  display: flex;
  justify-content: space-between;
}
</style>
