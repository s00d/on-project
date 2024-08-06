<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Projects</h1>
          <router-link class="btn btn-primary mb-3" to="/cabinet/projects/add">Add Project</router-link>
          <div v-if="projects.length === 0" class="alert alert-info">No projects available</div>
          <ul class="list-group">
            <li v-for="project in projects" :key="project.id" class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{{ project.name }}</h5>
                <p>{{ project.description }}</p>
              </div>
              <div>
                <router-link class="btn btn-secondary" :to="`/cabinet/projects/${project.id}/edit`">Edit</router-link>
                <button class="btn btn-danger ms-2" @click="() => deleteProject(project.id)">Delete</button>
              </div>
            </li>
          </ul>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import Tabs from "@/components/Tabs.vue";

const projectStore = useProjectStore();

onMounted(() => {
  projectStore.fetchProjects();
});

const deleteProject = async (projectId: number) => {
  await projectStore.deleteProject(projectId);
};


const projects = computed(() => projectStore.projects);
</script>
