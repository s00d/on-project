<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div>
          <h1>Kanban Board</h1>
          <div class="kanban-columns">
            <KanbanColumn
              v-for="status in project?.statuses"
              :key="status"
              :status="status"
              :project-id="projectId"
              :users="users"
              @task-dropped="onTaskDropped"
            />
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, computed, ref} from 'vue'
import KanbanColumn from '../../components/KanbanColumn.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Tabs.vue'
import {useProjectStore} from "@/stores/projectStore";
import type {User} from "@/stores/authStore";

const projectStore = useProjectStore()

const route = useRoute()
const projectId = route.params.projectId.toString()
const taskStore = useTaskStore()

const users = ref<{[key: string]: User}>({})

onMounted(async () => {
  const pId = parseInt(projectId.toString())
  await projectStore.fetchProject(parseInt(projectId))
  await taskStore.fetchTasks(pId, {})
  users.value = await projectStore.fetchUsers(pId)
})

const onTaskDropped = async (taskId: number, newStatus: string) => {
  await taskStore.updateTask(parseInt(projectId), taskId, { status: newStatus })
  await taskStore.fetchTasks(parseInt(projectId), {})
}

const project = computed(() => {
  return projectStore.project
})
</script>

<style>
.kanban-columns {
  display: flex;
  justify-content: space-between;
}
</style>
