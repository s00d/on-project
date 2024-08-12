<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <h1 class="board-title">Roadmaps Overview</h1>
          </div>

          <div class="board-columns">
            <div class="board-column add-column" @click="openCreateRoadmapModal">
              <button class="btn btn-link">+ Add Roadmap</button>
            </div>
            <div
              class="board-column"
              v-for="roadmap in roadmaps"
              :key="roadmap.id"
              @click="goToSprint(roadmap.id!)"
            >
              <div class="board-column-header">
                <h2 class="board-column-title" :title="roadmap.title">{{ roadmap.title }}</h2>
                <div class="actions">
                  <button @click.stop.prevent="openEditRoadmapModal(roadmap)" class="btn btn-primary btn-sm m-0">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button @click.stop.prevent="confirmDelete(roadmap.id, roadmap.title)" class="btn btn-danger btn-sm m-0 ms-1">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="board-column-content">
                <p>{{ roadmap.description }}</p>
                <router-link
                  :to="{
                    name: 'SprintList',
                    params: { roadmapId: roadmap.id, projectId: projectId }
                  }"
                  class="btn btn-light btn-sm"
                >View Sprints</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </Tabs>

      <ConfirmationModal
        :isOpen="showDeleteModal"
        actionType="Delete"
        :itemName="roadmapNameToDelete ?? ''"
        buttonText="Delete Roadmap"
        buttonClass="btn btn-danger"
        @confirm="deleteRoadmap"
        @close="closeModal"
      />

      <ModalComponent
        :isOpen="isModalOpen"
        :title="isEditMode ? 'Edit Roadmap' : 'Create Roadmap'"
        :is-block="true"
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
import { useRoute, useRouter } from 'vue-router'
import RoadmapFormModal from '@/components/sprint/RoadmapFormModal.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()

const projectId = Number(route.params.projectId)

const roadmapStore = useRoadmapStore()

const roadmaps = computed(() => roadmapStore.getRoadmaps)

const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentRoadmapData = ref<Roadmap | null>(null)

const showDeleteModal = ref(false)
const roadmapToDelete = ref<number | null>(null)
const roadmapNameToDelete = ref<string | null>(null)

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

const confirmDelete = (roadmapId: number, roadmapName: string) => {
  roadmapToDelete.value = roadmapId
  roadmapNameToDelete.value = roadmapName
  showDeleteModal.value = true
}

const deleteRoadmap = async () => {
  if (roadmapToDelete.value !== null) {
    await roadmapStore.deleteRoadmap(projectId, roadmapToDelete.value)
    closeModal()
  }
}

const handleSaveRoadmap = async (roadmapData: any) => {
  if (isEditMode.value) {
    await roadmapStore.updateRoadmap(projectId, roadmapData.id, { title: roadmapData.title, description: roadmapData.description })
  } else {
    await roadmapStore.createRoadmap(projectId, { title: roadmapData.title, description: roadmapData.description })
  }
  closeModal()
  fetchRoadmaps()
}

const closeModal = () => {
  isModalOpen.value = false
  showDeleteModal.value = false
  roadmapToDelete.value = null
  roadmapNameToDelete.value = null
}

const fetchRoadmaps = async () => {
  await roadmapStore.fetchRoadmaps(projectId)
}

const goToSprint = (roadmapId: number) => {
  router.push({
    name: 'SprintList',
    params: { roadmapId: roadmapId, projectId: projectId }
  })
}

onMounted(() => {
  fetchRoadmaps()
  roadmapStore.subscribeToSocketEvents()
})
</script>


<style scoped>


</style>
