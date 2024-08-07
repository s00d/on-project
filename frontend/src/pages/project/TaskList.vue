<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1 class="mb-4">Task List</h1>
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentFilter === null }"
                href="#"
                @click.prevent="applySavedFilter(null, null)"
              >
                Default
              </a>
            </li>

            <li class="nav-item" v-for="(filter, index) in savedFilters" :key="index">
              <a
                class="nav-link"
                :class="{ active: currentFilter === index }"
                href="#"
                @click.prevent="applySavedFilter(filter, index)"
              >
                {{ filter.name }}

                <span class="ml-5" style="cursor: pointer;" @click.stop.prevent="removeSavedFilter(index)">×</span>
              </a>
            </li>
          </ul>
          <div class="filters d-flex mb-3">
            <div class="filter-item me-3">
              <input
                v-model="search"
                @input="applyFilters"
                type="text"
                id="search"
                class="form-control"
                placeholder="Search"
              />
            </div>
            <div class="ms-auto d-flex align-items-end">
              <button @click="openSettingsModal" class="btn btn-secondary mb-3">Settings</button>
              <button @click="openSaveFilterModal" class="btn btn-secondary mb-3 ms-3">Save Filter</button>
              <router-link
                :to="`/cabinet/projects/${projectId}/tasks/add`"
                class="btn btn-primary mb-3 ms-3"
              >Create Task</router-link>
            </div>
          </div>
          <div class="task-list mt-3 table-responsive">
            <div v-for="(tasks, group) in groupedTasks" :key="group">
              <h3 class="task-group-title">{{ group }}</h3>
              <table class="table table-hover table-sm">
                <thead>
                <tr>
                  <th v-for="column in visibleColumns" @click="sort(column)" :key="column">
                    {{ column }}
                    <i v-if="sortKey === column" :class="sortIconClass(column)"></i>
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
                  <td v-for="column in visibleColumns" :key="column" v-html="getColumnData(task, column)"></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <PaginationComponent :total-pages="totalPages" :current-page="currentPage" @update:current-page="selectPage" />

          <!-- Task Modal -->
          <ModalComponent :isOpen="isTaskModalOpen" title="Task Details" @close="closeTaskModal" pos="fixed-left">
            <template #body>
              <TaskCard v-if="isTaskModalOpen && selectedTask && project" :task="selectedTask" :project="project" :show-comments="true" @close="closeTaskModal" />
            </template>
          </ModalComponent>

          <!-- Settings Modal -->
          <ModalComponent :isOpen="isSettingsModalOpen" title="Settings" @close="closeSettingsModal" pos="center">
            <template #body>
              <!-- Settings Modal Body -->
              <div class="mb-3">
                <label for="status" class="form-label">Status</label>
                <select v-model="status" @change="applyFilters" class="form-select">
                  <option value="">All</option>
                  <option v-for="status in project?.statuses" :value="status" :key="status" v-text="status"></option>
                </select>
              </div>
              <div class="mb-3">
                <label for="priority" class="form-label">Priority</label>
                <select v-model="priority" @change="applyFilters" class="form-select">
                  <option value="">All</option>
                  <option v-for="priority in project?.priorities" :value="priority" :key="priority" v-text="priority"></option>
                </select>
              </div>
              <div class="mb-3">
                <label for="tags" class="form-label">Tags</label>
                <select v-model="selectedTags" @change="applyFilters" multiple class="form-select">
                  <option v-for="tag in allTags" :value="tag" :key="tag">{{ tag }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="groupBy" class="form-label">Group By</label>
                <select v-model="groupBy" @change="applyFilters" class="form-select">
                  <option value="none">None</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="assignee">Assignee</option>
                  <option v-for="field in projectCustomFields" :key="field.name" :value="field.name">{{ field.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="assignee" class="form-label">Assignee</label>
                <select v-model="assignee" @change="applyFilters" class="form-select">
                  <option value="">All</option>
                  <option v-for="user in users" :value="user.id" :key="user.id">{{ user.username }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="pageSize" class="form-label">Tasks per page</label>
                <select v-model="pageSize" @change="applyFilters" class="form-select">
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="250">250</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="columns" class="form-label">Columns</label>
                <select v-model="visibleColumns" @change="applyFilters" multiple class="form-select">
                  <option v-for="column in allColumns" :key="column" :value="column">{{ column }}</option>
                </select>
              </div>
            </template>
          </ModalComponent>

          <!-- Save Filter Modal -->
          <ModalComponent :isOpen="isSaveFilterModalOpen" title="Save Filter" @close="closeSaveFilterModal" pos="center">
            <template #body>
              <div class="mb-3">
                <label for="filterName" class="form-label">Filter Name</label>
                <input v-model="filterName" type="text" id="filterName" class="form-control" placeholder="Enter filter name" />
              </div>
            </template>
            <template #footer>
              <button type="button" class="btn btn-secondary" @click="closeSaveFilterModal">Close</button>
              <button type="button" class="btn btn-primary" @click="saveFilter">Save</button>
            </template>
          </ModalComponent>

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
import {useProjectStore} from '@/stores/projectStore'
import type {User} from "@/stores/authStore";
import ModalComponent from "@/components/ModalComponent.vue";

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const route = useRoute()
const projectId = route.params.projectId.toString()

const users = ref<User[]>([])
const search = ref('')
const status = ref('')
const priority = ref('')
const assignee = ref<string[]>([])
const groupBy = ref('none')
const pageSize = ref(100)
const currentPage = ref(1)
const totalPages = ref(1)
const isTaskModalOpen = ref(false)
const isSettingsModalOpen = ref(false)
const isSaveFilterModalOpen = ref(false)
const selectedTask = ref<null | Task>(null)
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
const filterName = ref('')
const visibleColumns = ref<string[]>([
  'Title', 'Status', 'Label', 'Assignee', 'Due Date', 'Priority', 'Estimated Time', 'Type', 'Planned Date', 'Related Task', 'Actual Time', 'Tags'
])

const allColumns = [
  'Title', 'Status', 'Label', 'Assignee', 'Due Date', 'Priority', 'Estimated Time', 'Type', 'Planned Date', 'Related Task', 'Actual Time', 'Tags'
]

const savedFilters = ref<any[]>([])
const currentFilter = ref<number | null>(null)

const applyFilters = async () => {
  const filters = {
    search: search.value,
    status: status.value,
    priority: priority.value,
    assignee: assignee.value.join(','),
    tags: selectedTags.value,
    pageSize: pageSize.value,
    page: currentPage.value
  }
  const pId = parseInt(projectId)
  const { tasks, total } = await taskStore.fetchTasks(pId, filters)
  totalPages.value = Math.ceil(total / pageSize.value)
  taskStore.setTasks(tasks)
  extractTags(tasks)
}

const extractTags = (tasks: Task[]) => {
  const tagsSet = new Set<string>()
  tasks.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => tagsSet.add(tag))
    }
  })
  allTags.value = Array.from(tagsSet)
}

onMounted(async () => {
  await applyFilters()
  taskStore.subscribeToSocketEvents()
  await projectStore.fetchProject(Number(projectId))
  loadSavedFilters()
  users.value = await projectStore.fetchUsers(Number(projectId))
})

const openTaskModal = (task: Task) => {
  selectedTask.value = task
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
  selectedTask.value = null
}

const openSettingsModal = () => {
  isSettingsModalOpen.value = true
}

const closeSettingsModal = () => {
  isSettingsModalOpen.value = false
}

const openSaveFilterModal = () => {
  isSaveFilterModalOpen.value = true
}

const closeSaveFilterModal = () => {
  isSaveFilterModalOpen.value = false
}

const saveFilter = async () => {
  if (!filterName.value.trim()) {
    alert('Filter name is required')
    return
  }
  const filters = {
    search: search.value,
    status: status.value,
    priority: priority.value,
    assignee: assignee.value,
    tags: selectedTags.value,
    groupBy: groupBy.value,
    pageSize: pageSize.value,
    visibleColumns: visibleColumns.value
  }
  const pId = parseInt(projectId.toString())
  const savedFilters = [...projectStore.project?.savedFilters ?? [], { name: filterName.value, filters }]
  await projectStore.updateProject(pId, { savedFilters })
  filterName.value = ''
  closeSaveFilterModal()
  await projectStore.fetchProject(Number(projectId))
  loadSavedFilters()
}

const loadSavedFilters = () => {
  const project = projectStore.project
  if (project) {
    savedFilters.value = project.savedFilters
  }
}

const applySavedFilter = async (filter: any|null, index: number|null) => {
  currentFilter.value = index
  search.value = filter?.filters?.search ?? ''
  status.value = filter?.filters?.status ?? ''
  priority.value = filter?.filters?.priority ?? ''
  assignee.value = filter?.filters?.assignee ?? ''
  groupBy.value = filter?.filters?.groupBy ?? 'none'
  pageSize.value = filter?.filters?.pageSize ?? 100
  visibleColumns.value = filter?.filters?.visibleColumns ?? allColumns
  await applyFilters()
}

const removeSavedFilter = async (index: number) => {
  await applySavedFilter(null, null);

  let savedFilters = [...projectStore.project?.savedFilters ?? []]
  savedFilters.splice(index, 1);

  const pId = parseInt(projectId.toString())
  await projectStore.updateProject(pId, { savedFilters })
  await projectStore.fetchProject(Number(projectId))
  loadSavedFilters()
}

const groupedTasks = computed(() => {
  const tasks = taskStore.tasks
  if (groupBy.value === 'none') {
    return { 'All Tasks': tasks }
  }
  return tasks.reduce((acc: any, task: Task) => {
    let groupKey = ''
    if (groupBy.value === 'priority') {
      groupKey = task.priority || 'No Priority'
    } else if (groupBy.value === 'status') {
      groupKey = task.status || 'No Status'
    } else if (groupBy.value === 'assignee') {
      groupKey = task.assigneeIds ? task.assigneeIds.join(', ') : 'Unassigned'
    } else if (task.customFields) {
      groupKey = task.customFields[groupBy.value] || 'No ' + groupBy.value
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

function tagToBadge(tag: string) {
  return `<span class="badge bg-primary mr-2">${tag}</span>`;
}

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
      const getUsernames = (task: Task) => {
        const usernames: string[] = []
        if (task.assigneeIds?.length) {
          for (let i = 0; i < task.assigneeIds.length; i++) {
            const userId = task.assigneeIds[i];
            // @ts-ignore
            if (users[userId]) {
              // @ts-ignore
              usernames.push(users[userId].username);
            }
          }
        }
        return usernames.sort().join(', ');
      }

      const usernamesA = getUsernames(a)
      const usernamesB = getUsernames(b)
      result = usernamesA.localeCompare(usernamesB)
    } else if (key === 'Label') {
      result = (a.Label?.name || '').localeCompare(b.Label?.name || '')
    } else if (key === 'Tags') {
      result = (a.tags?.join(', ') || '').localeCompare(b.tags?.join(', ') || '')
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

const getColumnData = (task: Task, column: string) => {
  let vals = [];
  switch (column) {
    case 'Title':
      return task.title
    case 'Status':
      return task?.status;
    case 'Label':
      return task.Label ? `<span class="badge" style="background-color: ${task.Label.color}">${task.Label.name}</span>` : ''
    case 'Assignee':
      vals = [];
      if(task.assigneeIds?.length) {
        for (let i in task.assigneeIds) {
          const userId = task.assigneeIds[i]
          if(users.value[userId]) {
            vals.push(users.value[userId].username);
          }
        }
      }
      return vals.join(', ')
    case 'Due Date':
      return task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'
    case 'Priority':
    case 'Estimated Time':
      return task.estimatedTime
    case 'Type':
      return task.type
    case 'Planned Date':
      return task.plannedDate ? new Date(task.plannedDate).toLocaleDateString() : 'N/A'
    case 'Related Task':
      return task.relatedTaskId
    case 'Actual Time':
      return task.actualTime
    case 'Tags':
      return (task.tags?.map(tagToBadge).join('') || '');
    default:
      // @ts-ignore
      return task.customFields[column]
  }
}

const projectCustomFields = computed(() => {
  return projectStore.project?.customFields
})

const project = computed(() => {
  return projectStore.project
})

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
  overflow-x: auto;
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

</style>
