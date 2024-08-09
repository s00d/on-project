<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <router-link
              class="btn btn-primary"
              :to="{ name: 'RoadmapList', params: { projectId: projectId } }"
            >
              < Roadmap
            </router-link>
            <h1 class="board-title">
              Sprints Overview
            </h1>
            <button @click="openCreateSprintModal" class="btn btn-primary">New Sprint</button>
          </div>

          <div class="board-columns">
            <div class="board-column" v-for="sprint in sprints" :key="sprint.id">
              <div class="board-column-header">
                <h2 class="board-column-title">{{ sprint.title }}</h2>
                <button @click="deleteSprint(sprint.id)" class="btn btn-danger btn-sm">x</button>
              </div>
              <div class="board-column-content">
                <p>{{ sprint.description }}</p>
                <p>Start Date: {{ formatDate(sprint.startDate) }}</p>
                <p>End Date: {{ formatDate(sprint.endDate) }}</p>
                <button @click="openEditSprintModal(sprint)" class="btn btn-secondary btn-sm">Edit Sprint</button>

                <div class="task-list">
                  <div v-for="task in sprint.tasks" :key="task.id" class="task-item">
                    <div class="task-header">
                      <span class="task-title">{{ task.title }}</span>
                      <span class="task-priority" :class="getPriorityClass(task.priority)">{{ task.priority }}</span>
                    </div>
                    <div class="task-dates">
                      <span v-if="task.plannedDate">Planned: {{ formatDate(task.plannedDate) }}</span>
                      <span v-if="task.dueDate">Due: {{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="board-column add-column">
              <button @click="openCreateSprintModal" class="btn btn-link">+ Add Sprint</button>
            </div>
          </div>
        </div>


        <div class="project-board" v-if="isLoaded">
          <ScrumRoadmapTimeline :sprints="sprints" />
        </div>
      </Tabs>

      <ModalComponent :isOpen="isModalOpen" :title="isEditMode ? 'Edit Sprint' : 'Create Sprint'" @close="closeModal">
        <template #body>
          <SprintFormModal
            v-if="isModalOpen && currentSprintData"
            :isEditMode="isEditMode"
            :sprint-data="currentSprintData"
            @save="handleSaveSprint"
            @close="closeModal"
          />
        </template>
      </ModalComponent>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {type Sprint, useSprintStore} from '@/stores/sprintStore';
import Tabs from "@/components/Tabs.vue";
import { useRoute } from "vue-router";
import SprintFormModal from "@/components/sprint/SprintFormModal.vue";
import ScrumRoadmapTimeline from "@/components/sprint/ScrumRoadmapTimeline.vue";
import ModalComponent from "@/components/ModalComponent.vue";

const route = useRoute();

const roadmapId = Number(route.params.roadmapId);
const projectId = Number(route.params.projectId);

const sprintStore = useSprintStore();

const sprints = computed(() => sprintStore.getSprints);

const isLoaded = ref(false);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentSprintData = ref<Sprint|null>(null);

const openCreateSprintModal = () => {
  isEditMode.value = false;
  currentSprintData.value = {
    id: 0,
    title: '',
    description: '',
    startDate: (new Date).toString(),
    endDate: (new Date).toString(),
    roadmapId: 0,
    tasks: [],
  };
  isModalOpen.value = true;
};

const openEditSprintModal = (sprint: any) => {
  isEditMode.value = true;
  currentSprintData.value = { ...sprint };
  isModalOpen.value = true;
};

const handleSaveSprint = async (sprintData: any) => {
  if (isEditMode.value) {
    await sprintStore.updateSprint(projectId, sprintData.id, sprintData);
  } else {
    await sprintStore.createSprint(projectId, { ...sprintData, roadmapId });
  }
  closeModal();
  fetchSprints();
};

const closeModal = () => {
  isModalOpen.value = false;
};

const deleteSprint = async (sprintId: number) => {
  await sprintStore.deleteSprint(projectId, sprintId);
};

const formatDate = (date: Date|string) => {
  return new Date(date).toLocaleDateString();
};

const getPriorityClass = (priority: string) => {
  return {
    'priority-high': priority === 'High',
    'priority-medium': priority === 'Medium',
    'priority-low': priority === 'Low',
  };
};

const fetchSprints = async () => {
  await sprintStore.fetchSprints(projectId, roadmapId);
  isLoaded.value = true;
};

onMounted(() => {
  fetchSprints();
  sprintStore.subscribeToSocketEvents();
});
</script>


<style scoped>
.project-board {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-title {
  font-size: 2rem;
  font-weight: bold;
}

.board-columns {
  display: flex;
  gap: 16px;
  overflow-x: auto;
}

.board-column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  width: 300px;
  padding: 16px;
}

.board-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-column-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.board-column-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-list {
  margin-top: 16px;
}

.task-item {
  background-color: #f1f3f4;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.task-title {
  font-size: 1rem;
  font-weight: bold;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #fff;
}

.priority-high {
  background-color: #e53e3e;
}

.priority-medium {
  background-color: #dd6b20;
}

.priority-low {
  background-color: #38a169;
}

.task-dates {
  font-size: 0.875rem;
  color: #718096;
}

.add-column {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  background-color: #edf2f7;
  border-radius: 8px;
  border: 2px dashed #cbd5e0;
  cursor: pointer;
}
</style>
