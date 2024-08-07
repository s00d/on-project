<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Add Project</h1>
        <form @submit.prevent="addProject" class="mt-3">
          <div class="mb-3">
            <label for="name" class="form-label">Project Name</label>
            <input v-model="name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <MdEditor v-model="description" language="en-US" previewTheme="github" noMermaid :preview="false" />
          </div>
          <button type="submit" class="btn btn-primary">Add Project</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const projectStore = useProjectStore()
const router = useRouter()
const name = ref('')
const description = ref('')

const addProject = async () => {
  await projectStore.createProject({ name: name.value, description: description.value })
  router.push('/cabinet')
}
</script>
