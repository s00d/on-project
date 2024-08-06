<template>
  <div class="container mt-5">
    <h1>Task List</h1>
    <div class="mb-3">
      <label for="search" class="form-label">Search</label>
      <input v-model="search" @input="applyFilters" type="text" id="search" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="status" class="form-label">Status</label>
      <select v-model="status" @change="applyFilters" class="form-select">
        <option value="">All</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="priority" class="form-label">Priority</label>
      <select v-model="priority" @change="applyFilters" class="form-select">
        <option value="">All</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="groupBy" class="form-label">Group By</label>
      <select v-model="groupBy" @change="applyFilters" class="form-select">
        <option value="none">None</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        <option value="assignee">Assignee</option>
      </select>
    </div>
    <div class="task-list mt-3">
      <div v-for="(tasks, group) in groupedTasks" :key="group">
        <h3>{{ group }}</h3>
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import TaskCard from '../../components/TaskCard.vue';

export default defineComponent({
  name: 'TaskList',
  components: {
    TaskCard,
  },
  setup() {
    const taskStore = useTaskStore();
    const search = ref('');
    const status = ref('');
    const priority = ref('');
    const groupBy = ref('none');

    const applyFilters = async () => {
      const filters = {
        search: search.value,
        status: status.value,
        priority: priority.value,
      };
      await taskStore.fetchTasks(filters);
    };

    onMounted(() => {
      applyFilters();
      taskStore.subscribeToSocketEvents();
    });

    const groupedTasks = computed(() => {
      const tasks = taskStore.tasks;
      if (groupBy.value === 'none') {
        return { 'All Tasks': tasks };
      }
      return tasks.reduce((acc: any, task: any) => {
        let groupKey = '';
        if (groupBy.value === 'priority') {
          groupKey = task.priority || 'No Priority';
        } else if (groupBy.value === 'status') {
          groupKey = task.status || 'No Status';
        } else if (groupBy.value === 'assignee') {
          groupKey = task.assignee ? task.assignee.username : 'Unassigned';
        }
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(task);
        return acc;
      }, {});
    });

    return { search, status, priority, groupBy, groupedTasks, applyFilters };
  },
});
</script>
