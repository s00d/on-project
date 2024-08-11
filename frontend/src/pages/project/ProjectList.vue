<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Projects</h1>
        <button
          class="btn btn-secondary mb-3"
          @click="toggleArchivedProjects"
        >
          {{ showArchivedProjects ? 'Show Active Projects' : 'Show Archived Projects' }}
        </button>
        <a class="btn btn-primary mb-3 ms-2" @click="() => showEditProject()">Add Project</a>
        <div v-if="projects.length === 0" class="alert alert-info">No projects available</div>
        <ul class="list-group">
          <li
            v-for="project in projects"
            :key="project.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <h5>{{ project.name }}</h5>
              <p v-html="parseMd(project.description)"></p>
            </div>
            <div>
              <router-link
                class="btn btn-info"
                :to="{ name: 'TaskList', params: { projectId: project.id } }"
              >Select</router-link
              >
              <a
                v-if="project.ownerId === userId && !showArchivedProjects"
                class="btn btn-success ms-2"
                @click="() => showEditProject(project)"
              >
                Edit
              </a>
              <button
                v-if="!showArchivedProjects"
                class="btn btn-warning ms-2"
                @click="confirmArchive(project.id!, project.name)"
              >
                Archive
              </button>
              <button
                v-if="project.ownerId === userId && !showArchivedProjects"
                class="btn btn-danger ms-2"
                @click="confirmDelete(project.id!, project.name)"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
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
      buttonText="Delete Project"
      buttonClass="btn btn-warning"
      @confirm="archiveProject"
      @close="closeModal"
    />

    <ModalComponent
      :isOpen="isProjectModalOpen"
      :title="selectedProject ? 'Edit Details' : 'Create Details'"
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
import {type Project, useProjectStore} from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { marked } from 'marked'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ProjectCard from "@/components/tasks/ProjectCard.vue";
import ModalComponent from "@/components/ModalComponent.vue";

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

const showEditProject = (project: null|Project = null) => {
  isProjectModalOpen.value = true
  selectedProject.value = project
}


const closeAndLoadModal = () => {
  projectStore.fetchProjects()
  closeModal();
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


const projects = computed(() => projectStore.projects)
const userId = computed(() => authStore.getUserId)
</script>
