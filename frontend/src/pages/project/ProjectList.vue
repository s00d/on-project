<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Projects</h1>
        <router-link class="btn btn-primary mb-3" :to="{ name: 'AddProject' }"
          >Add Project</router-link
        >
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
              <router-link class="btn btn-info" :to="{ name: 'TaskList', params: { projectId: project.id } }"
                >Select</router-link
              >
              <router-link
                v-if="project.ownerId === userId"
                class="btn btn-secondary ms-2"
                :to="{ name: 'EditProject', params: { projectId: project.id } }"
                >Edit</router-link
              >
              <button
                v-if="project.ownerId === userId"
                class="btn btn-danger ms-2"
                @click="() => deleteProject(project.id)"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { marked } from 'marked'
import TaskList from "@/pages/project/TaskList.vue";

const projectStore = useProjectStore()
const authStore = useAuthStore()

onMounted(() => {
  projectStore.fetchProjects()
})

const deleteProject = async (projectId: number) => {
  await projectStore.deleteProject(projectId)
}

const parseMd = (val: string) => {
  return marked.parse(val)
}

const projects = computed(() => projectStore.projects)
const userId = computed(() => authStore.getUserId)
</script>
