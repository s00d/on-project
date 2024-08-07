<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <div class="mb-4">
            <h3>Manage Labels</h3>
            <form @submit.prevent="createLabel" class="form-inline mb-3">
              <div class="form-group mr-3">
                <label for="name" class="sr-only">Label Name</label>
                <input v-model="labelName" type="text" id="name" class="form-control" placeholder="Label Name" required />
              </div>
              <div class="form-group mr-3">
                <label for="color" class="sr-only">Label Color</label>
                <input v-model="labelColor" type="color" id="color" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary">Create Label</button>
            </form>
          </div>

          <h2>Existing Labels</h2>
          <table class="table">
            <thead>
            <tr>
              <th>Badge</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="label in labels" :key="label.id">
              <td>
                <span class="badge" :style="{ backgroundColor: label.color }">{{ label.name }}</span>
              </td>
              <td>
                <button @click="editLabel(label)" class="btn btn-sm btn-secondary">Edit</button>
                <button @click="deleteLabel(label.id)" class="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { type Label, useTaskStore } from '@/stores/taskStore'
import Tabs from "@/components/Tabs.vue"
import { useRoute } from "vue-router"

const route = useRoute()
const projectId = route.params.projectId.toString()
const taskStore = useTaskStore()

const labelName = ref('')
const labelColor = ref('#000000')
const labels = computed(() => taskStore.labels)

const fetchLabels = async () => {
  await taskStore.fetchLabels(parseInt(projectId))
}

const createLabel = async () => {
  await taskStore.createLabel(parseInt(projectId), { name: labelName.value, color: labelColor.value })
  labelName.value = ''
  labelColor.value = '#000000'
  fetchLabels()
}

const editLabel = async (label: Label) => {
  labelName.value = label.name
  labelColor.value = label.color
  await taskStore.updateLabel(parseInt(projectId), label.id, { name: labelName.value, color: labelColor.value })
  fetchLabels()
}

const deleteLabel = async (labelId: number) => {
  await taskStore.deleteLabel(parseInt(projectId), labelId)
  fetchLabels()
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

.badge {
  padding: 0.5em;
  color: #fff;
  font-size: 0.875em;
}
</style>
