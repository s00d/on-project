<template>
  <div>
    <h1>Kanban Board</h1>
    <div class="kanban-columns">
      <KanbanColumn v-for="status in statuses" :key="status" :status="status" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import KanbanColumn from '../../components/KanbanColumn.vue';
import { useTaskStore } from '@/stores/taskStore';

export default defineComponent({
  name: 'KanbanBoard',
  components: {
    KanbanColumn,
  },
  setup() {
    const statuses = ref(['To Do', 'In Progress', 'Done']);
    const taskStore = useTaskStore();

    onMounted(async () => {
      await taskStore.fetchTasks();
    });

    return { statuses };
  },
});
</script>

<style>
.kanban-columns {
  display: flex;
  justify-content: space-between;
}
</style>
