<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Task List</h1>
          <div class="d-flex mb-3">
            <div class="me-3">
              <label for="search" class="form-label">Search</label>
              <input
                v-model="search"
                @input="applyFilters"
                type="text"
                id="search"
                class="form-control"
              />
            </div>
            <div class="me-3">
              <label for="status" class="form-label">Status</label>
              <select v-model="status" @change="applyFilters" class="form-select">
                <option value="">All</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div class="me-3">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" @change="applyFilters" class="form-select">
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="me-3">
              <label for="groupBy" class="form-label">Group By</label>
              <select v-model="groupBy" @change="applyFilters" class="form-select">
                <option value="none">None</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="assignee">Assignee</option>
              </select>
            </div>
            <div class="ms-auto d-flex align-items-end">
              <router-link
                :to="`/cabinet/projects/${projectId}/tasks/add`"
                class="btn btn-primary mb-3"
                style="margin-top: 2rem"
                >Create Task</router-link
              >
            </div>
          </div>
          <div class="task-list mt-3 table-responsive">
            <div v-for="(tasks, group) in groupedTasks" :key="group">
              <h3>{{ group }}</h3>
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th @click="sort('title')">Title</th>
                    <th @click="sort('status')">Status</th>
                    <th @click="sort('assignee')">Assignee</th>
                    <th @click="sort('dueDate')">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="task in tasks"
                    :key="task.id"
                    @click="openTaskModal(task)"
                    style="cursor: pointer"
                  >
                    <td>{{ task.title }}</td>
                    <td>{{ task.status }}</td>
                    <td>{{ task.assignee?.username }}</td>
                    <td>
                      {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                <div class="modal-header">
                  <h5 class="modal-title" v-text="selectedTask?.title"></h5>
                </div>
                <div class="modal-body">
                  <TaskCard
                    v-if="isTaskModalOpen && selectedTask"
                    :task="selectedTask"
                    :project-id="projectId"
                    @close="closeTaskModal"
                    :show-comments="true"
                  />
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-dismiss="modal"
                    @click="closeTaskModal"
                  >
                    Close
                  </button>
                </div>
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

const taskStore = useTaskStore()
const route = useRoute()
const projectId = route.params.projectId.toString()

const search = ref('')
const status = ref('')
const priority = ref('')
const groupBy = ref('none')
const isTaskModalOpen = ref(false)
const selectedTask = ref<null | Task>(null)

const applyFilters = async () => {
  const filters = {
    search: search.value,
    status: status.value,
    priority: priority.value
  }
  const pId = parseInt(projectId)
  await taskStore.fetchTasks(pId, filters)
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
      result = (a.assignee?.username || '').localeCompare(b.assignee?.username || '')
    } else {
      result = a[key] > b[key] ? 1 : -1
    }
    return result * sortOrder.value
  })
}
</script>

<style>
.container .d-flex > * {
  flex: 1;
}

.table-responsive {
  overflow-x: auto;
}

.modal .modal-dialog-aside {
  width: 550px;
  max-width: 80%;
  height: 100%;
  margin: 0;
  transform: translate(0);
  transition: transform 0.2s;
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
