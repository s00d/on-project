<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1 class="mb-4">Task List</h1>
          <TabsComponent
            :savedFilters="savedFilters"
            :currentFilter="currentFilter"
            @apply-saved-filter="applySavedFilter"
            @remove-saved-filter="removeSavedFilter"
          />
          <Filters
            :projectId="projectId"
            :search="search"
            @apply-filters="applyFilters"
            @open-settings-modal="openSettingsModal"
            @open-save-filter-modal="openSaveFilterModal"
            @create-task-modal="createTaskModal"
            @update:search="(val) => (search = val)"
          />
          <TaskTable
            :tasks="taskStore.tasks"
            :visibleColumns="visibleColumns"
            :groupBy="groupBy"
            :project="project"
            :users="users"
            @open-task-modal="openTaskModal"
            @open-preview-modal="openPreviewModal"
          />
          <PaginationComponent
            :total-pages="totalPages"
            :current-page="currentPage"
            @update:current-page="selectPage"
          />

          <!-- Task Modal -->
          <ModalComponent
            :isOpen="isTaskModalOpen"
            :title="selectedTask ? 'Edit Details' : 'Create Details'"
            @close="closeTaskModal"
            pos="fixed-left"
          >
            <template #body>
              <TaskCard
                v-if="isTaskModalOpen && selectedTask && project"
                :projectId="projectId"
                :project="project"
                :initialTaskData="selectedTask"
                :users="users"
                mode="edit"
                showComments
                @task-saved="closeTaskModal"
                @close="isTaskModalOpen = false"
              />
              <TaskCard
                v-if="isTaskModalOpen && !selectedTask && project"
                :projectId="projectId"
                :project="project"
                :users="users"
                mode="create"
                :show-comments="false"
                @task-saved="closeTaskModal"
                @close="isTaskModalOpen = false"
              />
            </template>
          </ModalComponent>

          <ModalComponent
            :isOpen="isPreviewModalOpen"
            :title="selectedTask?.title ?? ''"
            @close="closeTaskModal"
          >
            <template #body>
              <TaskPreviewCard
                v-if="isPreviewModalOpen && selectedTask && project"
                :projectId="projectId"
                :project="project"
                :taskData="selectedTask"
                :users="users"
                @close="isPreviewModalOpen = false"
              />
            </template>
          </ModalComponent>

          <!-- Settings Modal -->
          <ModalComponent
            :isOpen="isSettingsModalOpen"
            title="Settings"
            @close="closeTaskModal"
            pos="center"
          >
            <template #body>
              <SettingsModalContent
                :status="status"
                :priority="priority"
                :selectedTags="selectedTags"
                :groupBy="groupBy"
                :assignee="assignee"
                :pageSize="pageSize"
                :visibleColumns="visibleColumns"
                :allTags="allTags"
                :allColumns="allColumns"
                :users="users"
                :project="project"
                :projectCustomFields="projectCustomFields"
                @apply-filters="applySettingsFilters"
              />
            </template>
          </ModalComponent>

          <!-- Save Filter Modal -->
          <ModalComponent
            :isOpen="isSaveFilterModalOpen"
            title="Save Filter"
            @close="closeTaskModal"
            pos="center"
          >
            <template #body>
              <div class="mb-3">
                <label for="filterName" class="form-label">Filter Name</label>
                <input
                  v-model="filterName"
                  type="text"
                  id="filterName"
                  class="form-control"
                  placeholder="Enter filter name"
                />
              </div>
            </template>
            <template #footer>
              <button type="button" class="btn btn-secondary" @click="closeTaskModal">Close</button>
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
import { useProjectStore } from '@/stores/projectStore'
import TaskCard from '@/components/tasks/TaskCard.vue'
import Tabs from '@/components/Tabs.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import TabsComponent from '@/components/tasks/TabsComponent.vue'
import Filters from '@/components/tasks/FiltersComponent.vue'
import TaskTable from '@/components/tasks/TaskTable.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import SettingsModalContent from '@/components/tasks/SettingsModalContent.vue'
import { useAlertStore } from '@/stores/alertStore'
import type { User } from '@/stores/authStore'
import TaskPreviewCard from '@/components/tasks/TaskPreviewCard.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const route = useRoute()
const projectId = route.params.projectId.toString()

const users = ref<{ [key: number]: User }>([])
const search = ref('')
const status = ref('')
const priority = ref('')
const assignee = ref<string[]>([])
const groupBy = ref('none')
const pageSize = ref(100)
const currentPage = ref(1)
const totalPages = ref(1)
const isTaskModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isSettingsModalOpen = ref(false)
const isSaveFilterModalOpen = ref(false)
const selectedTask = ref<null | Task>(null)
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
const filterName = ref('')
const visibleColumns = ref<string[]>([
  'Title',
  'Status',
  'Label',
  'Assignee',
  'Due Date',
  'Priority',
  'Time',
  'Type',
  'Planned Date',
  'Related Task',
  'Tags',
  'Sprint'
])

const allColumns = [
  'Title',
  'Status',
  'Label',
  'Assignee',
  'Due Date',
  'Priority',
  'Time',
  'Type',
  'Planned Date',
  'Related Task',
  'Tags',
  'Sprint'
]

export interface Filter {
  name: string
  filters: {
    search: string
    status: string
    priority: string
    assignee: string[]
    tags: string[]
    groupBy: string
    pageSize: number
    visibleColumns: string[]
  }
}

const savedFilters = ref<Filter[]>([])
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
  extractTags(tasks)
}

const extractTags = (tasks: Task[]) => {
  const tagsSet = new Set<string>()
  tasks.forEach((task) => {
    if (task.tags) {
      task.tags.forEach((tag) => tagsSet.add(tag))
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

const createTaskModal = () => {
  selectedTask.value = null
  isTaskModalOpen.value = true
}

const openTaskModal = (task: Task) => {
  selectedTask.value = task
  isTaskModalOpen.value = true
}

const openPreviewModal = (task: Task) => {
  selectedTask.value = task
  isPreviewModalOpen.value = true
}

const closeTaskModal = async () => {
  isTaskModalOpen.value = false
  isSettingsModalOpen.value = false
  isPreviewModalOpen.value = false
  isSaveFilterModalOpen.value = false
  selectedTask.value = null
  await applyFilters()
}

const openSettingsModal = () => {
  isSettingsModalOpen.value = true
}

const openSaveFilterModal = () => {
  isSaveFilterModalOpen.value = true
}

const saveFilter = async () => {
  if (!filterName.value.trim()) {
    useAlertStore().setAlert('Filter name is required', 'danger')
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
  const savedFilters = [
    ...(projectStore.project?.savedFilters ?? []),
    { name: filterName.value, filters }
  ]
  await projectStore.updateProject(pId, { savedFilters })
  filterName.value = ''
  closeTaskModal()
  await projectStore.fetchProject(Number(projectId))
  loadSavedFilters()
}

const loadSavedFilters = () => {
  const project = projectStore.project
  if (project) {
    savedFilters.value = project.savedFilters
  }
}

const applySettingsFilters = (filters: any) => {
  status.value = filters.status
  priority.value = filters.priority
  selectedTags.value = filters.selectedTags
  groupBy.value = filters.groupBy
  assignee.value = filters.assignee
  pageSize.value = filters.pageSize
  visibleColumns.value = filters.visibleColumns
  applyFilters()
}

const applySavedFilter = async (filter: Filter | null, index: number | null) => {
  currentFilter.value = index
  search.value = filter?.filters?.search ?? ''
  status.value = filter?.filters?.status ?? ''
  priority.value = filter?.filters?.priority ?? ''
  assignee.value = filter?.filters?.assignee ?? []
  groupBy.value = filter?.filters?.groupBy ?? 'none'
  pageSize.value = filter?.filters?.pageSize ?? 100
  visibleColumns.value = filter?.filters?.visibleColumns ?? allColumns
  await applyFilters()
}

const removeSavedFilter = async (index: number) => {
  await applySavedFilter(null, null)
  let filters = [...savedFilters.value]
  filters.splice(index, 1)
  const pId = parseInt(projectId.toString())
  await projectStore.updateProject(pId, { savedFilters: filters })
  await projectStore.fetchProject(Number(projectId))
  loadSavedFilters()
}

const selectPage = (page: number) => {
  currentPage.value = page
  applyFilters()
}

const projectCustomFields = computed(() => {
  return projectStore.project?.customFields || []
})

const project = computed(() => {
  return projectStore.project
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
