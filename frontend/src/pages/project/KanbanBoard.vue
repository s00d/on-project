<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <h1 class="board-title">Kanban Board</h1>
            <div class="selectors">
              <button v-if="!project?.isArchived" @click="createTaskModal" class="btn btn-primary">New Task</button>
              <div class="selector-item">
                <label for="roadmap-select" class="pr-3">Roadmap</label>
                <select id="roadmap-select" v-model="selectedRoadmap" @change="onRoadmapChange">
                  <option v-for="roadmap in roadmaps" :key="roadmap.id" :value="roadmap.id">
                    {{ roadmap.title }}
                  </option>
                </select>
              </div>

              <div class="selector-item">
                <label for="sprint-select" class="pr-3">Sprint</label>
                <select id="sprint-select" v-model="selectedSprint" @change="onSprintChange">
                  <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
                    {{ sprint.title }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="board-columns">
            <!-- Колонка для задач без спринта -->
            <KanbanColumn
              :status="'No Sprint'"
              :tasks="tasksWithoutSprint"
              :project-id="projectId"
              :users="users"
              @task-dropped="(taskId, newStatus) => onTaskDropped(taskId, newStatus, null)"
            />

            <!-- Остальные колонки -->
            <KanbanColumn
              v-for="status in project?.statuses"
              :key="status"
              :status="status"
              :tasks="filteredTasks(status)"
              :project-id="projectId"
              :users="users"
              @task-dropped="
                (taskId, newStatus) => onTaskDropped(taskId, newStatus, selectedSprint)
              "
            />
          </div>
        </div>
      </Tabs>
    </div>
  </div>

  <ModalComponent
    :isOpen="isTaskModalOpen"
    title="create Task"
    @close="isTaskModalOpen = false"
    pos="fixed-left"
  >
    <template #body>
      <TaskCard
        v-if="isTaskModalOpen"
        :projectId="projectId"
        :project="project"
        :users="users"
        :tasks="tasks"
        mode="create"
        showComments
        @task-saved="closeTaskModal"
        @close="isTaskModalOpen = false"
      />
    </template>
  </ModalComponent>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import KanbanColumn from '../../components/KanbanColumn.vue'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Tabs.vue'
import { useProjectStore } from '@/stores/projectStore'
import { useSprintStore } from '@/stores/sprintStore'
import { useRoadmapStore } from '@/stores/roadmapStore'
import type { Task } from '@/stores/taskStore'
import { useTaskStore } from '@/stores/taskStore'
import type { User } from '@/stores/authStore'
import TaskCard from '@/components/tasks/TaskCard.vue'
import ModalComponent from '@/components/ModalComponent.vue'

const projectStore = useProjectStore()
const roadmapStore = useRoadmapStore()
const sprintStore = useSprintStore()
const taskStore = useTaskStore()

const route = useRoute()
const projectId = route.params.projectId.toString()

const users = ref<{ [key: string]: User }>({})
const selectedRoadmap = ref<number | null>(null)
const selectedSprint = ref<number | null>(null)
const isTaskModalOpen = ref(false)

const roadmaps = computed(() => roadmapStore.getRoadmaps)
const sprints = computed(() => sprintStore.getSprints)
const project = computed(() => projectStore.project)

// Все задачи из проекта
const tasks = computed(() => {
  const sprint = sprints.value.find((s) => s.id === selectedSprint.value)
  if (sprint) {
    return sprint.tasks
  }
  return []
})

// Задачи без спринта
const tasksWithoutSprint = computed(() => {
  return taskStore.tasks.filter((task) => task.sprintId === null)
})

onMounted(async () => {
  const pId = parseInt(projectId)
  await projectStore.fetchProject(pId)
  await roadmapStore.fetchRoadmaps(pId)

  if (roadmaps.value.length > 0) {
    const savedRoadmapId = localStorage.getItem(`selectedRoadmap_${projectId}`)
    const initialRoadmapId = savedRoadmapId ? parseInt(savedRoadmapId) : roadmaps.value[0].id
    selectedRoadmap.value = initialRoadmapId
    await sprintStore.fetchSprints(pId, initialRoadmapId)
  }

  if (sprints.value.length > 0) {
    const savedSprintId = localStorage.getItem(`selectedSprint_${projectId}`)
    selectedSprint.value = savedSprintId ? parseInt(savedSprintId) : sprints.value[0].id
  }

  users.value = await projectStore.fetchUsers(pId)
  await taskStore.fetchTasks(pId, { sprintId: 0 })
})

const onRoadmapChange = async () => {
  if (selectedRoadmap.value !== null) {
    localStorage.setItem(`selectedRoadmap_${projectId}`, selectedRoadmap.value.toString())
    await sprintStore.fetchSprints(parseInt(projectId), selectedRoadmap.value)
    if (sprints.value.length > 0) {
      selectedSprint.value = sprints.value[0].id
      onSprintChange()
    } else {
      selectedSprint.value = null
    }
  }
}

const onSprintChange = () => {
  if (selectedSprint.value !== null) {
    localStorage.setItem(`selectedSprint_${projectId}`, selectedSprint.value.toString())
  }
}

const filteredTasks = (status: string): Task[] => {
  if (selectedSprint.value === null) return []
  return tasks.value.filter((task) => task.status === status)
}

const onTaskDropped = async (taskId: number, newStatus: string, sprintId: number | null) => {
  await taskStore.updateTask(parseInt(projectId), taskId, { status: newStatus, sprintId })
  if (selectedRoadmap.value) {
    await sprintStore.fetchSprints(parseInt(projectId), selectedRoadmap.value)
    const pId = parseInt(projectId)
    await taskStore.fetchTasks(pId, { sprintId: 0 })
  }
}

const closeTaskModal = async () => {
  if (selectedRoadmap.value) {
    await sprintStore.fetchSprints(parseInt(projectId), selectedRoadmap.value)
    const pId = parseInt(projectId)
    await taskStore.fetchTasks(pId, { sprintId: 0 })
  }
  isTaskModalOpen.value = false
}

const createTaskModal = () => {
  isTaskModalOpen.value = true
}
</script>

<style scoped>
.project-board {
  max-width: 95%;
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
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
}

.board-columns {
  display: flex;
  gap: 16px;
  overflow-x: auto;
}

.kanban-column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  width: 25%;
  padding: 16px;
  transition: background-color 0.3s ease;
}

.kanban-column.drag-over {
  background-color: #d3e0ff;
}

.column-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: bold;
}

.task-card {
  background-color: #f1f3f4;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.task-card p {
  margin: 0;
  font-size: 1rem;
  color: #718096;
}

.selectors {
  display: flex;
  gap: 20px;
}

.selector-item {
  display: flex;
  flex-direction: column;
}

.selector-item label {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 5px;
  font-weight: 600;
}

.selectors select {
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background-color: #fff;
  font-size: 1rem;
  color: #4a5568;
  outline: none;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selectors select:focus {
  border-color: #3182ce;
  box-shadow: 0 0 5px rgba(49, 130, 206, 0.5);
}

.selectors select:hover {
  border-color: #a0aec0;
}
</style>
