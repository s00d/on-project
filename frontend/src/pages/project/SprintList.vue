<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <router-link
              class="btn btn-primary"
              :to="{ name: 'RoadmapList', params: { projectId: projectId } }"
            >
              <i class="fas fa-arrow-left"></i> Roadmaps
            </router-link>
            <h1 class="board-title">Sprints Overview</h1>
          </div>

          <div class="board-columns">
            <div class="board-column add-column" @click="openCreateSprintModal">
              <button class="btn btn-link">+ Add Sprint</button>
            </div>
            <div class="board-column" v-for="sprint in sprints" :key="sprint.id">
              <div class="board-column-header">
                <h2 class="board-column-title" :title="sprint.title">{{ sprint.title }}</h2>
                <div class="actions">
                  <button @click="openEditSprintModal(sprint)" class="btn btn-primary m-0 btn-sm">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button
                    @click="confirmDelete(sprint.id, sprint.title)"
                    class="btn btn-danger btn-sm m-0 ms-1"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="board-column-content">
                <p>{{ sprint.description }}</p>
                <p><b>Start Date</b>: {{ formatDate(sprint.startDate) }}</p>
                <p><b>End Date</b>: {{ formatDate(sprint.endDate) }}</p>

                <div class="task-list">
                  <div v-for="task in sprint.tasks" :key="task.id" class="task-item">
                    <div class="task-header">
                      <span class="task-title">{{ task.title }}</span>
                      <span class="task-priority" :class="getPriorityClass(task.priority)">
                        {{ task.priority }}
                      </span>
                    </div>
                    <div class="task-dates">
                      <span v-if="task.plannedDate"
                        >Planned: {{ formatDate(task.plannedDate) }}</span
                      >
                      <span v-if="task.dueDate">Due: {{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="project-board" v-if="isLoaded">
          <ScrumRoadmapTimeline v-if="sprints" :sprints="sprints" />
        </div>
      </Tabs>

      <ConfirmationModal
        :isOpen="showDeleteModal"
        actionType="Delete"
        :itemName="sprintNameToDelete ?? ''"
        buttonText="Delete Sprint"
        buttonClass="btn btn-danger"
        @confirm="deleteSprint"
        @close="closeModal"
      />

      <ModalComponent
        :isOpen="isModalOpen"
        :title="isEditMode ? 'Edit Sprint' : 'Create Sprint'"
        :is-block="true"
        @close="closeModal"
      >
        <template #body>
          <SprintFormModal
            v-if="isModalOpen && currentSprintData"
            :isEditMode="isEditMode"
            :sprint-data="currentSprintData"
            @save="handleSaveSprint"
            @close="closeModal"
          />
        </template>
      </ModalComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { type Sprint, useSprintStore } from '@/stores/sprintStore'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from 'vue-router'
import SprintFormModal from '@/components/sprint/SprintFormModal.vue'
import ScrumRoadmapTimeline from '@/components/sprint/ScrumRoadmapTimeline.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const route = useRoute()

const roadmapId = Number(route.params.roadmapId)
const projectId = Number(route.params.projectId)

const sprintStore = useSprintStore()

const sprints = computed(() => sprintStore.getSprints)

const isLoaded = ref(false)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentSprintData = ref<Sprint | null>(null)

const showDeleteModal = ref(false)
const sprintToDelete = ref<number | null>(null)
const sprintNameToDelete = ref<string | null>(null)

const openCreateSprintModal = () => {
  isEditMode.value = false
  currentSprintData.value = {
    id: 0,
    title: '',
    description: '',
    startDate: new Date().toString(),
    endDate: new Date().toString(),
    roadmapId: 0,
    tasks: []
  }
  isModalOpen.value = true
}

const openEditSprintModal = (sprint: any) => {
  isEditMode.value = true
  currentSprintData.value = { ...sprint }
  isModalOpen.value = true
}

const confirmDelete = (sprintId: number, sprintName: string) => {
  sprintToDelete.value = sprintId
  sprintNameToDelete.value = sprintName
  showDeleteModal.value = true
}

const deleteSprint = async () => {
  if (sprintToDelete.value !== null) {
    await sprintStore.deleteSprint(projectId, sprintToDelete.value)
    closeModal()
  }
}

const handleSaveSprint = async (sprintData: any) => {
  if (isEditMode.value) {
    await sprintStore.updateSprint(projectId, sprintData.id, {
      title: sprintData.title,
      description: sprintData.description,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate
    })
  } else {
    await sprintStore.createSprint(projectId, roadmapId, {
      title: sprintData.title,
      description: sprintData.description,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate
    })
  }
  closeModal()
  fetchSprints()
}

const closeModal = () => {
  isModalOpen.value = false
  showDeleteModal.value = false
  sprintToDelete.value = null
  sprintNameToDelete.value = null
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString()
}

const getPriorityClass = (priority: string) => {
  return {
    'priority-high': priority === 'High',
    'priority-medium': priority === 'Medium',
    'priority-low': priority === 'Low'
  }
}

const fetchSprints = async () => {
  await sprintStore.fetchSprints(projectId, roadmapId)
  isLoaded.value = true
}

onMounted(() => {
  fetchSprints()
  sprintStore.subscribeToSocketEvents()
})
</script>

<style scoped>
.priority-high {
  background-color: #e53e3e;
}

.priority-medium {
  background-color: #dd6b20;
}

.priority-low {
  background-color: #38a169;
}

.task-dates {
  font-size: 0.875rem;
  color: #718096;
}

.task-list {
  margin-top: 16px;
  max-height: 100px;
  overflow-y: scroll;
}

.task-item {
  background-color: #f1f3f4;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.task-title {
  font-size: 1rem;
  font-weight: bold;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #fff;
}
</style>
