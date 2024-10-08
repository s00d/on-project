<template>
  <div class="admin-panel">
    <div class="content">
      <div class="project-board">
        <div class="board-header">
          <h1 class="board-title">{{ showArchivedProjects ? 'Archived Projects' : 'Projects' }}</h1>
          <div class="actions">
            <button class="btn btn-secondary mb-3" @click="toggleArchivedProjects">
              {{ showArchivedProjects ? 'Show Active Projects' : 'Show Archived Projects' }}
            </button>
            <button class="btn btn-primary mb-3 ms-2" @click="() => showEditProject()">
              Add Project
            </button>
          </div>
        </div>

        <div class="board-columns">
          <div class="board-column add-column" @click="showEditProject()">
            <button class="btn btn-link">+ Add Project</button>
          </div>
          <div
            class="board-column"
            v-for="project in projects"
            :key="project.id"
            @click="goToTaskList(project.id!)"
          >
            <div class="board-column-header">
              <h2 class="board-column-title" :title="project.name">{{ project.name }}</h2>
              <div class="actions" v-if="!showArchivedProjects">
                <button
                  v-if="project.ownerId === userId"
                  @click.stop.prevent="() => showEditProject(project)"
                  class="btn btn-primary btn-sm m-0"
                >
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button
                  @click.stop.prevent="confirmArchive(project.id!, project.name)"
                  class="btn btn-warning btn-sm m-0 ms-1"
                >
                  <i class="fas fa-archive"></i>
                </button>
                <button
                  @click.stop.prevent="confirmDelete(project.id!, project.name)"
                  class="btn btn-danger btn-sm m-0 ms-1"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div class="board-column-content">
              <p v-html="parseMd(project.description)"></p>
              <router-link
                :to="{ name: 'TaskList', params: { projectId: project.id } }"
                class="btn btn-light btn-sm"
              >
                Select
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      :isOpen="showDeleteModal"
      actionType="Delete"
      :itemName="projectNameToDelete ?? ''"
      buttonText="Delete Project"
      buttonClass="btn btn-danger"
      @confirm="deleteProject"
      @close="closeModal"
    />

    <ConfirmationModal
      :isOpen="showDeleteArchive"
      actionType="Archive"
      :itemName="projectNameToArchive ?? ''"
      buttonText="Archive Project"
      buttonClass="btn btn-warning"
      @confirm="archiveProject"
      @close="closeModal"
    />

    <ModalComponent
      :isOpen="isProjectModalOpen"
      :title="selectedProject ? 'Edit Details' : 'Create Details'"
      :is-block="true"
      @close="closeModal"
      pos="fixed-left"
    >
      <template #body>
        <ProjectCard
          v-if="isProjectModalOpen && selectedProject"
          :initialTaskData="selectedProject"
          @save="closeAndLoadModal"
          @close="closeModal"
          mode="edit"
        />
        <ProjectCard
          v-if="isProjectModalOpen && !selectedProject"
          @save="closeAndLoadModal"
          @close="closeModal"
          mode="create"
        />
      </template>
    </ModalComponent>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { type Project, useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { marked } from 'marked'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ProjectCard from '@/components/tasks/ProjectCard.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const showArchivedProjects = ref(false)

const showDeleteModal = ref(false)
const projectToDelete = ref<number | null>(null)
const projectNameToDelete = ref<string | null>(null)

const showDeleteArchive = ref(false)
const projectToArchive = ref<number | null>(null)
const projectNameToArchive = ref<string | null>(null)

const isProjectModalOpen = ref(false)
const selectedProject = ref<null | Project>(null)

onMounted(() => {
  projectStore.fetchProjects()
})

const confirmArchive = (projectId: number, projectName: string) => {
  projectToArchive.value = projectId
  projectNameToArchive.value = projectName
  showDeleteArchive.value = true
}

const confirmDelete = (projectId: number, projectName: string) => {
  projectToDelete.value = projectId
  projectNameToDelete.value = projectName
  showDeleteModal.value = true
}

const deleteProject = async () => {
  if (projectToDelete.value !== null) {
    await projectStore.deleteProject(projectToDelete.value)
    closeModal()
  }
}

const showEditProject = (project: null | Project = null) => {
  isProjectModalOpen.value = true
  selectedProject.value = project
}

const closeAndLoadModal = () => {
  projectStore.fetchProjects()
  closeModal()
}

const closeModal = () => {
  isProjectModalOpen.value = false
  showDeleteArchive.value = false
  showDeleteModal.value = false
  projectToDelete.value = null
  projectNameToDelete.value = null
  selectedProject.value = null
  projectNameToArchive.value = null
  projectToArchive.value = null
}

const parseMd = (val: string) => {
  return marked.parse(val)
}

const toggleArchivedProjects = () => {
  showArchivedProjects.value = !showArchivedProjects.value
  projectStore.fetchProjects(showArchivedProjects.value)
}

const archiveProject = async () => {
  await projectStore.archiveProject(projectToArchive.value!)
  projectStore.fetchProjects(showArchivedProjects.value)
}

const goToTaskList = (projectId: number) => {
  router.push({ name: 'TaskList', params: { projectId } })
}

const projects = computed(() => projectStore.projects)
const userId = computed(() => authStore.getUserId)
</script>

<style scoped></style>
