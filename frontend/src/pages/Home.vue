<template>
  <div class="container mt-5">
    <h1 class="mb-4">Welcome to Project Manager</h1>
    <p>
      Project Manager is a powerful tool that helps you manage your projects efficiently.
      You can create projects, add tasks, assign tasks to users, and track the progress of your projects using our Kanban board.
    </p>
    <router-link class="btn btn-primary mt-3" to="/projects">View Projects</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
});
</script>
