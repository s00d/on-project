<template>
  <div class="kanban-column">
    <h2>{{ status }}</h2>
    <div>
      <TaskCard v-for="task in filteredTasks" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import TaskCard from './TaskCard.vue';

export default defineComponent({
  name: 'KanbanColumn',
  components: {
    TaskCard,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const taskStore = useTaskStore();

    const filteredTasks = computed(() =>
      taskStore.tasks.filter(task => task.status === props.status)
    );

    return { filteredTasks };
  },
});
</script>

<style>
.kanban-column {
  width: 30%;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}
</style>
