<template>
  <div v-for="(tasks, group) in groupedTasks" :key="group">
    <h3 class="task-group-title">{{ group }}</h3>
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th v-for="column in visibleColumns" @click="sort(column)" :key="column">
              {{ column }}
              <i v-if="sortKey === column" :class="sortIconClass(column)"></i>
            </th>
            <th scope="col" class="actions-sticky" style="width: 90px">Actions</th>
          </tr>
        </thead>
        <tbody v-for="(task, index) in tasks" :key="task.id">
          <tr
            class="task-row"
            :class="{ dragging: dragStart?.id === task.id, 'drop-target': dropIndex === task.id }"
            draggable="true"
            @dragstart="onDragStart(task)"
            @dragover="(event) => onDragOver(event, task)"
            @drop="onDrop(task)"
          >
            <td
              v-for="column in visibleColumns"
              :style="{ backgroundColor: generatePriorityColor(task.priority ?? '') }"
              :key="column"
              v-html="getColumnData(task, column)"
            ></td>
            <td class="actions-sticky" style="width: 90px">
              <div style="width: 90%; display: flex">
                <button class="btn btn-danger btn-sm ms-1" @click="$emit('open-task-modal', task)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-info btn-sm ms-1" @click="$emit('open-preview-modal', task)">
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn btn-primary btn-sm ms-1"
                  @click="$emit('open-history-modal', task)"
                >
                  <i class="fas fa-history"></i>
                </button>
                <button class="btn btn-secondary btn-sm ms-1" @click="toggleRelatedTasks(task)">
                  <i class="fas fa-angle-down" v-if="expandedTask === task.id"></i>
                  <i class="fas fa-angle-right" v-else></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import type { Task } from '@/stores/taskStore'
import type { User } from '@/stores/authStore'
import type { Project } from '@/stores/projectStore'
import type { Sprint } from '@/stores/sprintStore'

const props = defineProps<{
  tasks: Task[]
  project: Project | null
  visibleColumns: string[]
  groupBy: string
  users: { [key: number]: User }
}>()

const emit = defineEmits<{
  (e: 'open-task-modal', task: Task): void
  (e: 'open-preview-modal', task: Task): void
  (e: 'open-history-modal', task: Task): void
  (e: 'archive-task', task: Task): void
  (e: 'refresh'): void
}>()

const sortKey = ref('')
const sortOrder = ref(1)
const expandedTask = ref<number | null>(null)
const relatedTasks = ref<Task[]>([]) // Store related tasks
const dragStart = ref<Task | null>(null)
const dropIndex = ref<number | null>(null)

const groupedTasks = computed(() => {
  const tasks = props.tasks
  if (props.groupBy === 'none') {
    return { 'All Tasks': tasks }
  }
  return tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    let groupKey = ''
    if (props.groupBy === 'priority') {
      groupKey = task.priority || 'No Priority'
    } else if (props.groupBy === 'status') {
      groupKey = task.status || 'No Status'
    } else if (props.groupBy === 'assignee') {
      groupKey = task.assignees
        ? task.assignees.map((assignee) => assignee.id).join(', ')
        : 'Unassigned'
    } else if (task.customFields) {
      groupKey = task.customFields[props.groupBy] || 'No ' + props.groupBy
    }
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(task)
    return acc
  }, {})
})

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1
  } else {
    sortKey.value = key
    sortOrder.value = 1
  }
  props.tasks.sort((a: Task, b: Task) => {
    let result = 0
    if (key === 'assignee') {
      const getUsernames = (task: Task) => {
        const usernames: string[] = []
        if (task.assignees?.length) {
          for (let i = 0; i < task.assignees.length; i++) {
            const userId = task.assignees[i].id
            if (props.users[userId]) {
              usernames.push(props.users[userId].username)
            }
          }
        }
        return usernames.sort().join(', ')
      }

      const usernamesA = getUsernames(a)
      const usernamesB = getUsernames(b)
      result = usernamesA.localeCompare(usernamesB)
    } else if (key === 'Label') {
      result = (a.label?.name || '').localeCompare(b.label?.name || '')
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

const sprintMap = computed(() => {
  const sprints = props.project?.sprints ?? []
  return sprints.reduce(
    (acc, sprint) => {
      acc[sprint.id] = sprint
      return acc
    },
    {} as Record<number, Sprint>
  )
})

const getColumnData = (task: Task, column: string) => {
  let vals: string[] = []
  switch (column) {
    case 'Title':
      return task.title
    case 'Status':
      return task.status
    case 'Sprint':
      return task.sprintId && sprintMap.value[task.sprintId]
        ? (sprintMap.value[task.sprintId].title ?? 'N/A')
        : 'N/A'
    case 'Label':
      return task.label
        ? `<span class="badge" style="background-color: ${task.label.color}">${task.label.name}</span>`
        : ''
    case 'Assignee':
      vals = []
      if (task.assignees?.length) {
        for (let i in task.assignees) {
          const userId = task.assignees[i].id
          if (props.users[userId]) {
            vals.push(props.users[userId].username)
          }
        }
      }
      return vals.join(', ')
    case 'Due Date':
      return task.dueDate
        ? `<span class="circle" style="background-color: ${generateColor(task.dueDate.toString())}"></span> ${new Date(task.dueDate).toLocaleDateString()}`
        : 'N/A'
    case 'Priority':
      return task.priority
    case 'Time': {
      const timeValue = task.status !== 'Done' ? task.estimatedTime : task.actualTime
      const color = task.status === 'Done' ? 'green' : '#b1b151'
      const tooltip = `Status: ${task.status}`
      return `<span style="color: ${color};font-weight: bold" title="${tooltip}">${timeValue}</span>`
    }
    case 'Type':
      return task.type
        ? `<span class="circle" style="background-color: ${generateColor(task.type)}"></span> ${task.type}`
        : 'N/A'
    case 'Planned Date':
      return task.plannedDate
        ? `<span class="circle" style="background-color: ${generateColor(task.plannedDate.toString())}"></span> ${new Date(task.plannedDate).toLocaleDateString()}`
        : 'N/A'
    case 'Related Task':
      return task.relatedTaskId
    case 'Tags':
      return (
        task.tags?.map((tag) => `<span class="badge bg-primary mr-2">${tag}</span>`).join('') || ''
      )
    default:
      return task.customFields?.[column] || ''
  }
}

const generateColor = (value: string, alpha: number = 0.8): string => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215)
  const r = (color >> 16) & 255
  const g = (color >> 8) & 255
  const b = color & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const generatePriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'rgba(242, 139, 130, 0.05)' // red
    case 'medium':
      return 'rgba(251, 188, 4, 0.05)' // orange
    case 'low':
      return 'rgba(52, 168, 83, 0.05)' // green
    default:
      return generateColor(priority, 0.05)
  }
}

const onDragStart = (task: Task) => {
  dragStart.value = task
}

const onDragOver = (event: DragEvent, task: Task) => {
  // Prevent default to allow drop
  event.preventDefault()
  dropIndex.value = task.id
}

const onDrop = async (task: Task) => {
  if (dragStart.value !== null && dragStart.value.id !== task.id) {
    await axios.put(`/tasks/${props.project!.id}/reorder/update`, {
      draggedTaskId: dragStart.value.id,
      targetTaskId: task.id
    })
    emit('refresh')
  }

  dragStart.value = null
  dropIndex.value = null
}

const toggleRelatedTasks = async (task: Task) => {
  if (expandedTask.value === task.id) {
    expandedTask.value = null
    relatedTasks.value = []
    return
  }
  expandedTask.value = task.id
  const response = await axios.get(`/tasks/${props.project!.id}`, {
    params: { relatedTaskId: task.id }
  })
  relatedTasks.value = response.data.tasks
}
</script>

<style scoped>
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

.table th,
.table td {
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

.priority {
  padding: 2px 4px;
  border-radius: 4px;
  color: white;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  min-width: 600px; /* Устанавливает минимальную ширину таблицы, если требуется */
}

.table th.actions-sticky,
.table td.actions-sticky {
  position: sticky;
  right: 0;
  background-color: #fff;
  z-index: 10;
}

.dragging {
  opacity: 0.5; /* Visually indicate the dragging item */
}

.drop-target {
  border: 2px dashed #007bff; /* Highlight the drop target */
}

.drop-marker-cell {
  height: 40px;
  background-color: #007bff;
}
</style>
