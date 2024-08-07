<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1 class="mb-4">Task List</h1>
          <div class="filters d-flex mb-3">
            <div class="filter-item me-3">
              <label for="search" class="form-label">Search</label>
              <input
                v-model="search"
                @input="applyFilters"
                type="text"
                id="search"
                class="form-control"
              />
            </div>
            <div class="filter-item me-3">
              <label for="status" class="form-label">Status</label>
              <select v-model="status" @change="applyFilters" class="form-select">
                <option value="">All</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div class="filter-item me-3">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" @change="applyFilters" class="form-select">
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="filter-item me-3">
              <label for="groupBy" class="form-label">Group By</label>
              <select v-model="groupBy" @change="applyFilters" class="form-select">
                <option value="none">None</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="assignee">Assignee</option>
              </select>
            </div>
            <div class="filter-item me-3">
              <label for="pageSize" class="form-label">Tasks per page</label>
              <select v-model="pageSize" @change="applyFilters" class="form-select">
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
              </select>
            </div>
            <div class="ms-auto d-flex align-items-end">
              <router-link
                :to="`/cabinet/projects/${projectId}/tasks/add`"
                class="btn btn-primary mb-3"
                style="margin-top: 2rem"
              >Create Task</router-link>
            </div>
          </div>
          <div class="task-list mt-3 table-responsive">
            <div v-for="(tasks, group) in groupedTasks" :key="group">
              <h3 class="task-group-title">{{ group }}</h3>
              <table class="table table-hover table-sm">
                <thead>
                <tr>
                  <th @click="sort('title')">
                    Title
                    <i v-if="sortKey === 'title'" :class="sortIconClass('title')"></i>
                  </th>
                  <th @click="sort('status')">
                    Status
                    <i v-if="sortKey === 'status'" :class="sortIconClass('status')"></i>
                  </th>
                  <th @click="sort('label')">
                    Label
                    <i v-if="sortKey === 'label'" :class="sortIconClass('label')"></i>
                  </th>
                  <th @click="sort('assignee')">
                    Assignee
                    <i v-if="sortKey === 'assignee'" :class="sortIconClass('assignee')"></i>
                  </th>
                  <th @click="sort('dueDate')">
                    Due Date
                    <i v-if="sortKey === 'dueDate'" :class="sortIconClass('dueDate')"></i>
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="task in tasks"
                  :key="task.id"
                  @click="openTaskModal(task)"
                  class="task-row"
                >
                  <td>{{ task.title }}</td>
                  <td>{{ task.status }}</td>
                  <td><span v-if="task.Label" class="badge" :style="{ backgroundColor: task.Label.color }">{{ task.Label.name }}</span></td>
                  <td>{{ task.User?.username }}</td>
                  <td>{{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A' }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <PaginationComponent :total-pages="totalPages" :current-page="currentPage" @update:current-page="selectPage" />

          <!-- Task Modal -->
          <div
            v-if="isTaskModalOpen"
            class="modal-backdrop fade show"
            @click="closeTaskModal"
          ></div>
          <div
            v-if="isTaskModalOpen"
            id="modal_aside_right"
            class="modal fixed-left fade show"
            tabindex="-1"
            role="dialog"
            style="display: block"
          >
            <div class="modal-dialog modal-dialog-aside" role="document">
              <div class="modal-content">
                <TaskCard
                  v-if="isTaskModalOpen && selectedTask"
                  :task="selectedTask"
                  :project-id="projectId"
                  :show-comments="true"
                  @close="closeTaskModal"
                />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { type Task, useTaskStore } from '@/stores/taskStore'
import { useRoute } from 'vue-router'
import TaskCard from '../../components/TaskCard.vue'
import Tabs from '@/components/Tabs.vue'
import PaginationComponent from "@/components/PaginationComponent.vue";

const taskStore = useTaskStore()
const route = useRoute()
const projectId = route.params.projectId.toString()

const search = ref('')
const status = ref('')
const priority = ref('')
const groupBy = ref('none')
const pageSize = ref(100)
const currentPage = ref(1)
const totalPages = ref(1)
const isTaskModalOpen = ref(false)
const selectedTask = ref<null | Task>(null)

const applyFilters = async () => {
  const filters = {
    search: search.value,
    status: status.value,
    priority: priority.value,
    pageSize: pageSize.value,
    page: currentPage.value
  }
  const pId = parseInt(projectId)
  const { tasks, total } = await taskStore.fetchTasks(pId, filters)
  totalPages.value = Math.ceil(total / pageSize.value)
  taskStore.setTasks(tasks)
}

onMounted(() => {
  applyFilters()
  taskStore.subscribeToSocketEvents()
})

const openTaskModal = (task: Task) => {
  selectedTask.value = task
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
  selectedTask.value = null
}

const groupedTasks = computed(() => {
  const tasks = taskStore.tasks
  if (groupBy.value === 'none') {
    return { 'All Tasks': tasks }
  }
  return tasks.reduce((acc: any, task: any) => {
    let groupKey = ''
    if (groupBy.value === 'priority') {
      groupKey = task.priority || 'No Priority'
    } else if (groupBy.value === 'status') {
      groupKey = task.status || 'No Status'
    } else if (groupBy.value === 'assignee') {
      groupKey = task.assignee ? task.assignee.username : 'Unassigned'
    }
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(task)
    return acc
  }, {})
})

const sortKey = ref('')
const sortOrder = ref(1)

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1
  } else {
    sortKey.value = key
    sortOrder.value = 1
  }
  taskStore.tasks.sort((a, b) => {
    let result = 0
    if (key === 'assignee') {
      result = (a.User?.username || '').localeCompare(b.User?.username || '')
    } else {
      // @ts-ignore
      result = a[key] > b[key] ? 1 : -1
    }
    return result * sortOrder.value
  })
}

const sortIconClass = (key: string) => {
  if (sortKey.value === key) {
    return sortOrder.value === 1 ? 'fas fa-sort-up' : 'fas fa-sort-down'
  }
  return 'fas fa-sort'
}

const selectPage = (page: number) => {
  currentPage.value = page
  applyFilters()
}
</script>

<style>
.container {
  max-width: 1200px;
}

.filters {
  gap: 1rem;
}

.filter-item {
  flex: 1;
}

.task-group-title {
  margin-top: 2rem;
  font-size: 1.5rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.table {
  margin-bottom: 2rem;
  border-collapse: collapse;
  border: 1px solid #f1f1f1;
}

.table th, .table td {
  vertical-align: middle;
  padding: 0.5rem;
}

.table th {
  cursor: pointer;
  position: relative;
  background-color: #f3f3f3 !important;
}

.table th:hover {
  background-color: #e7e7e7;
}

.table th.sortable-column {
  padding-right: 1.5rem;
}

.table th i {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.table th i:hover {
  color: #000;
}

.table tr {
  transition: background-color 0.2s ease;
}

.table tr:hover {
  background-color: #f9f9f9;
}

.modal .modal-dialog-aside {
  width: 500px;
  max-width: 80%;
  height: 100%;
  margin: 0;
  transform: translate(0);
  transition: transform 0.3s ease-in-out;
}

.modal .modal-dialog-aside .modal-content {
  height: inherit;
  border: 0;
  border-radius: 0;
}

.modal .modal-dialog-aside .modal-content .modal-body {
  overflow-y: auto;
}

.modal.fixed-left .modal-dialog-aside {
  margin-left: auto;
  transform: translateX(100%);
}

.modal.fixed-right .modal-dialog-aside {
  margin-right: auto;
  transform: translateX(-100%);
}

.modal.show .modal-dialog-aside {
  transform: translateX(0);
}
</style>
