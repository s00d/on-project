<template>
  <div class="container mt-5">
    <button class="btn btn-secondary mb-3" @click="toggleSpoiler">
      {{ spoilerOpen ? 'Hide' : 'Show' }} Label Management
    </button>
    <div v-if="spoilerOpen">
      <h3>Manage Labels</h3>
      <form @submit.prevent="createLabel" class="mb-3">
        <div class="mb-3">
          <label for="name" class="form-label">Label Name</label>
          <input v-model="labelName" type="text" id="name" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="color" class="form-label">Label Color</label>
          <input v-model="labelColor" type="color" id="color" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary">Create Label</button>
      </form>
      <h2>Existing Labels</h2>
      <table class="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Color</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="label in labels" :key="label.id">
          <td>{{ label.name }}</td>
          <td>
            <span :style="{ backgroundColor: label.color, display: 'inline-block', width: '20px', height: '20px' }"></span>
          </td>
          <td>
            <button @click="editLabel(label)" class="btn btn-sm btn-secondary">Edit</button>
            <button @click="deleteLabel(label.id)" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { type Label, useTaskStore } from '@/stores/taskStore'

const props = defineProps<{
  projectId: string
}>()

const taskStore = useTaskStore()

const labelName = ref('')
const labelColor = ref('#000000')
const spoilerOpen = ref(false)

const labels = computed(() => taskStore.labels)

const fetchLabels = async () => {
  await taskStore.fetchLabels(parseInt(props.projectId))
}

const createLabel = async () => {
  await taskStore.createLabel(parseInt(props.projectId), { name: labelName.value, color: labelColor.value })
  labelName.value = ''
  labelColor.value = '#000000'
  fetchLabels()
}

const editLabel = async (label: Label) => {
  labelName.value = label.name
  labelColor.value = label.color
  await taskStore.updateLabel(parseInt(props.projectId), label.id, { name: labelName.value, color: labelColor.value })
  fetchLabels()
}

const deleteLabel = async (labelId: number) => {
  await taskStore.deleteLabel(parseInt(props.projectId), labelId)
  fetchLabels()
}

const toggleSpoiler = () => {
  spoilerOpen.value = !spoilerOpen.value
}

onMounted(() => {
  fetchLabels()
})
</script>

<style scoped>
.container {
  max-width: 800px;
}

.table {
  margin-top: 20px;
}

table span {
  display: inline-block;
  width: 20px;
  height: 20px;
}
</style>
