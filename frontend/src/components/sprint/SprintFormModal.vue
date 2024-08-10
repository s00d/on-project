<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label for="title">Title</label>
      <input v-model="form.title" type="text" id="title" required />
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea v-model="form.description" id="description" required></textarea>
    </div>
    <div class="form-group">
      <label for="startDate">Start Date</label>
      <input v-model="form.startDate" type="datetime-local" id="startDate" required />
    </div>
    <div class="form-group">
      <label for="endDate">End Date</label>
      <input v-model="form.endDate" type="datetime-local" id="endDate" required />
    </div>
    <button type="submit" class="btn btn-primary">
      {{ isEditMode ? 'Save Changes' : 'Create Sprint' }}
    </button>
    <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
  </form>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import type { Sprint } from '@/stores/sprintStore'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const props = defineProps<{
  isEditMode: boolean
  sprintData: Sprint
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Sprint>({
  id: 0,
  title: '',
  description: '',
  startDate: formatDate(new Date().toLocaleDateString()),
  endDate: formatDate(new Date().toLocaleDateString()),
  roadmapId: 0,
  tasks: []
})

const submitForm = () => {
  emit('save', { ...form.value })
}

const closeModal = () => {
  emit('close')
}

onMounted(() => {
  if (props.isEditMode && props.sprintData) {
    form.value = { ...props.sprintData }
    form.value = {
      ...props.sprintData,
      startDate: formatDate(props.sprintData.startDate.toString()),
      endDate: formatDate(props.sprintData.endDate.toString())
    }
  }
})

watch(
  () => props.sprintData,
  (newVal) => {
    if (props.isEditMode && newVal) {
      form.value = { ...newVal }
      form.value = {
        ...newVal,
        startDate: formatDate(newVal.startDate.toString()),
        endDate: formatDate(newVal.endDate.toString())
      }
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 100%;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  margin-right: 10px;
}
</style>
