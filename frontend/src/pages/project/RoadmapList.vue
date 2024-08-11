<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <h1 class="board-title">Roadmaps Overview</h1>
          </div>

          <div class="board-columns">
            <div class="board-column" v-for="roadmap in roadmaps" :key="roadmap.id">
              <div class="board-column-header">
                <h2 class="board-column-title">{{ roadmap.title }}</h2>
                <button @click="deleteRoadmap(roadmap.id)" class="btn btn-danger btn-sm">x</button>
              </div>
              <div class="board-column-content">
                <p>{{ roadmap.description }}</p>
                <button @click="openEditRoadmapModal(roadmap)" class="btn btn-secondary btn-sm">
                  Edit Roadmap
                </button>
                <router-link
                  :to="{
                    name: 'SprintList',
                    params: { roadmapId: roadmap.id, projectId: projectId }
                  }"
                  class="btn btn-info btn-sm"
                  >View Sprints</router-link
                >
              </div>
            </div>

            <div class="board-column add-column" @click="openCreateRoadmapModal">
              <button class="btn btn-link">+ Add Roadmap</button>
            </div>
          </div>
        </div>
      </Tabs>

      <ModalComponent
        :isOpen="isModalOpen"
        :title="isEditMode ? 'Edit Sprint' : 'Create Sprint'"
        @close="closeModal"
      >
        <template #body>
          <RoadmapFormModal
            v-if="isModalOpen && currentRoadmapData"
            :isEditMode="isEditMode"
            :roadmap-data="currentRoadmapData"
            @save="handleSaveRoadmap"
            @close="closeModal"
          />
        </template>
      </ModalComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { type Roadmap, useRoadmapStore } from '@/stores/roadmapStore'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from 'vue-router'
import RoadmapFormModal from '@/components/sprint/RoadmapFormModal.vue'
import ModalComponent from '@/components/ModalComponent.vue'

const route = useRoute()

const projectId = Number(route.params.projectId)

const roadmapStore = useRoadmapStore()

const roadmaps = computed(() => roadmapStore.getRoadmaps)

const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentRoadmapData = ref<Roadmap | null>(null)

const openCreateRoadmapModal = () => {
  isEditMode.value = false
  currentRoadmapData.value = {
    id: 0,
    title: '',
    description: '',
    projectId: 0
  }
  isModalOpen.value = true
}

const openEditRoadmapModal = (roadmap: any) => {
  isEditMode.value = true
  currentRoadmapData.value = { ...roadmap }
  isModalOpen.value = true
}

const handleSaveRoadmap = async (roadmapData: any) => {
  if (isEditMode.value) {
    await roadmapStore.updateRoadmap(projectId, roadmapData.id, {title: roadmapData.title, description: roadmapData.description})
  } else {
    await roadmapStore.createRoadmap(projectId, {title: roadmapData.title, description: roadmapData.description})
  }
  closeModal()
  fetchRoadmaps()
}

const closeModal = () => {
  isModalOpen.value = false
}

const deleteRoadmap = async (roadmapId: number) => {
  await roadmapStore.deleteRoadmap(projectId, roadmapId)
}

const fetchRoadmaps = async () => {
  await roadmapStore.fetchRoadmaps(projectId)
}

onMounted(() => {
  fetchRoadmaps()
  roadmapStore.subscribeToSocketEvents()
})
</script>

<style scoped>
.project-board {
  max-width: 1200px;
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

.board-column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  width: 300px;
  padding: 16px;
}

.board-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-column-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.board-column-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-column {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  background-color: #edf2f7;
  border-radius: 8px;
  border: 2px dashed #cbd5e0;
  cursor: pointer;
}
</style>
