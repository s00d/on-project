<template>
  <div>
    <div class="mb-3">
      <label for="status" class="form-label">Status</label>
      <select v-model="localStatus" @change="applyFilters" class="form-select">
        <option value="">All</option>
        <option v-for="status in project?.statuses" :value="status" :key="status">{{ status }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="priority" class="form-label">Priority</label>
      <select v-model="localPriority" @change="applyFilters" class="form-select">
        <option value="">All</option>
        <option v-for="priority in project?.priorities" :value="priority" :key="priority">{{ priority }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="tags" class="form-label">Tags</label>
      <select v-model="localSelectedTags" @change="applyFilters" multiple class="form-select">
        <option v-for="tag in allTags" :value="tag" :key="tag">{{ tag }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="groupBy" class="form-label">Group By</label>
      <select v-model="localGroupBy" @change="applyFilters" class="form-select">
        <option value="none">None</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        <option value="assignee">Assignee</option>
        <option v-for="field in projectCustomFields" :key="field.name" :value="field.name">{{ field.name }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="assignee" class="form-label">Assignee</label>
      <select v-model="localAssignee" @change="applyFilters" multiple class="form-select">
        <option value="">All</option>
        <option v-for="user in users" :value="user.id" :key="user.id">{{ user.username }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="pageSize" class="form-label">Tasks per page</label>
      <select v-model="localPageSize" @change="applyFilters" class="form-select">
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="250">250</option>
        <option value="500">500</option>
        <option value="1000">1000</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="columns" class="form-label">Columns</label>
      <select v-model="localVisibleColumns" @change="applyFilters" multiple class="form-select">
        <option v-for="column in allColumns" :key="column" :value="column">{{ column }}</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import type {Project} from "@/stores/projectStore";
import type {User} from "@/stores/authStore";

const props = defineProps<{
  status: string
  priority: string
  selectedTags: string[]
  groupBy: string
  assignee: string[]
  pageSize: number
  visibleColumns: string[]
  allTags: string[]
  allColumns: string[]
  users: User[]
  project: Project | null
  projectCustomFields: { name: string }[]
}>()

const emit = defineEmits(['apply-filters'])

const localStatus = ref(props.status)
const localPriority = ref(props.priority)
const localSelectedTags = ref(props.selectedTags)
const localGroupBy = ref(props.groupBy)
const localAssignee = ref(props.assignee)
const localPageSize = ref(props.pageSize)
const localVisibleColumns = ref(props.visibleColumns)


const applyFilters = () => {
  emit('apply-filters', {
    status: localStatus.value,
    priority: localPriority.value,
    selectedTags: localSelectedTags.value,
    groupBy: localGroupBy.value,
    assignee: localAssignee.value,
    pageSize: localPageSize.value,
    visibleColumns: localVisibleColumns.value
  })
}
</script>
