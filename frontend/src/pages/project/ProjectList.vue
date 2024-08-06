<template>
  <div class="container mt-5">
    <h1>Projects</h1>
    <router-link class="btn btn-primary mb-3" to="/projects/add">Add Project</router-link>
    <div v-if="projects.length === 0" class="alert alert-info">No projects available</div>
    <ul class="list-group">
      <li v-for="project in projects" :key="project.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h5>{{ project.name }}</h5>
          <p>{{ project.description }}</p>
        </div>
        <div>
          <router-link class="btn btn-secondary" :to="`/projects/${project.id}/edit`">Edit</router-link>
          <button class="btn btn-danger ms-2" @click="deleteProject(project.id)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';

export default defineComponent({
  name: 'ProjectList',
  setup() {
    const projectStore = useProjectStore();

    onMounted(() => {
      projectStore.fetchProjects();
    });

    const deleteProject = async (projectId: number) => {
      await projectStore.deleteProject(projectId);
    };

    return { projects: projectStore.projects, deleteProject };
  },
});
</script>
