<template>
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

        <span class="ml-5" style="cursor: pointer" @click.stop.prevent="removeSavedFilter(index)"
          >×</span
        >
      </a>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  savedFilters: any[]
  currentFilter: number | null
}>()

const emit = defineEmits(['apply-saved-filter', 'remove-saved-filter'])

const applySavedFilter = (filter: any, index: number | null) => {
  emit('apply-saved-filter', filter, index)
}

const removeSavedFilter = (index: number) => {
  emit('remove-saved-filter', index)
}
</script>
