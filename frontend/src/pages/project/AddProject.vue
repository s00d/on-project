<template>
  <div class="container mt-5">
    <h1>Add Project</h1>
    <form @submit.prevent="addProject" class="mt-3">
      <div class="mb-3">
        <label for="name" class="form-label">Project Name</label>
        <input v-model="name" type="text" id="name" class="form-control" required />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea v-model="description" id="description" class="form-control" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Add Project</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AddProject',
  setup() {
    const projectStore = useProjectStore();
    const router = useRouter();
    const name = ref('');
    const description = ref('');

    const addProject = async () => {
      await projectStore.createProject({ name: name.value, description: description.value });
      router.push('/projects');
    };

    return { name, description, addProject };
  },
});
</script>
