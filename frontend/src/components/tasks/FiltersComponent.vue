<template>
  <div class="filters d-flex mb-3">
    <div class="filter-item me-3">
      <input
        :value="search"
        @input="updateSearch"
        type="text"
        id="search"
        class="form-control"
        placeholder="Search"
      />
    </div>
    <div class="ms-auto d-flex align-items-end">
      <button @click="$emit('open-settings-modal')" class="btn btn-info mb-3">Settings</button>
      <button @click="$emit('open-save-filter-modal')" class="btn btn-success mb-3 ms-3">
        Save Filter
      </button>
      <button
        v-if="project && !project.isArchived"
        @click="$emit('create-task-modal')"
        class="btn btn-primary mb-3 ms-3"
      >
        Create Task
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import type { Project } from '@/stores/projectStore'

const props = defineProps<{
  projectId: string
  project: Project | null
  search: string
}>()

const emit = defineEmits([
  'update:search',
  'apply-filters',
  'open-settings-modal',
  'open-save-filter-modal',
  'create-task-modal'
])

const updateSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:search', target.value)
  emit('apply-filters')
}
</script>

<style scoped>
.filters {
  gap: 1rem;
}

.filter-item {
  flex: 1;
}
</style>
