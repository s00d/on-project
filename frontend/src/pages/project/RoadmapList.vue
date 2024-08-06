<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Roadmaps</h1>
          <form @submit.prevent="addRoadmap" class="mt-3">
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input v-model="newRoadmapTitle" type="text" id="title" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea v-model="newRoadmapDescription" id="description" class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add Roadmap</button>
          </form>
          <ul class="list-group mt-3">
            <li v-for="roadmap in roadmaps" :key="roadmap.id" class="list-group-item">
              <h5>{{ roadmap.title }}</h5>
              <p>{{ roadmap.description }}</p>
              <button @click="deleteRoadmap(roadmap.id)" class="btn btn-danger">Delete</button>
              <button @click="editRoadmap(roadmap)" class="btn btn-secondary">Edit</button>
              <router-link :to="`/roadmaps/${roadmap.id}/sprints`" class="btn btn-info">View Sprints</router-link>
            </li>
          </ul>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoadmapStore } from '@/stores/roadmapStore';
import { useRoute } from 'vue-router';
import Tabs from "@/components/Tabs.vue";

export default defineComponent({
  name: 'RoadmapList',
  components: {Tabs},
  setup() {
    const roadmapStore = useRoadmapStore();
    const route = useRoute();
    const newRoadmapTitle = ref('');
    const newRoadmapDescription = ref('');
    const projectId = Number(route.params.projectId);

    const fetchRoadmaps = async () => {
      await roadmapStore.fetchRoadmaps(projectId);
    };

    const addRoadmap = async () => {
      await roadmapStore.createRoadmap({
        title: newRoadmapTitle.value,
        description: newRoadmapDescription.value,
        projectId,
      });
      newRoadmapTitle.value = '';
      newRoadmapDescription.value = '';
    };

    const deleteRoadmap = async (roadmapId: number) => {
      await roadmapStore.deleteRoadmap(roadmapId);
    };

    const editRoadmap = async (roadmap) => {
      // Implement edit roadmap logic here
    };

    onMounted(() => {
      fetchRoadmaps();
      roadmapStore.subscribeToSocketEvents();
    });

    return { roadmaps: roadmapStore.roadmaps, newRoadmapTitle, newRoadmapDescription, addRoadmap, deleteRoadmap, editRoadmap };
  },
});
</script>
