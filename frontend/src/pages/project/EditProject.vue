<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Edit Project</h1>
          <form @submit.prevent="updateProject" class="mt-3">
            <div class="mb-3">
              <label for="name" class="form-label">Project Name</label>
              <input v-model="name" type="text" id="name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea v-model="description" id="description" class="form-control" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Project</button>
          </form>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { useRoute, useRouter } from 'vue-router';
import Tabs from "@/components/Tabs.vue";

export default defineComponent({
  name: 'EditProject',
  components: {Tabs},
  setup() {
    const projectStore = useProjectStore();
    const route = useRoute();
    const router = useRouter();
    const name = ref('');
    const description = ref('');

    const fetchProject = async () => {
      const project = await projectStore.fetchProject(Number(route.params.id));
      if (project) {
        name.value = project.name;
        description.value = project.description;
      }
    };

    const updateProject = async () => {
      await projectStore.updateProject(Number(route.params.id), { name: name.value, description: description.value });
      router.push('/projects');
    };

    onMounted(() => {
      fetchProject();
    });

    return { name, description, updateProject };
  },
});
</script>
