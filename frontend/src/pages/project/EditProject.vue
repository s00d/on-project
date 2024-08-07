<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Edit Project</h1>
        <div class="mt-3">
          <div class="mb-3">
            <label for="name" class="form-label">Project Name</label>
            <input v-model="name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <MdEditor v-model="description" language="en-US" previewTheme="github" noMermaid :preview="false" />
          </div>

          <h3>Manage Custom Fields</h3>

          <div v-for="(field, index) in customFields" :key="index" class="mb-3">
            <div class="d-flex align-items-center">
              <input
                v-model="field.name"
                type="text"
                class="form-control mr-2"
                placeholder="Field Name"
              />
              <input
                v-model="field.description"
                type="text"
                class="form-control mr-2"
                placeholder="Field Description"
              />
              <select v-model="field.type" class="form-control mr-2">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="datetime">DateTime</option>
                <option value="time">Time</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
                <option value="tel">Telephone</option>
                <option value="color">Color</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
                <option value="range">Range</option>
                <option value="password">Password</option>
                <option value="textarea">Textarea</option>
              </select>
              <button type="button" class="btn btn-danger" @click="removeCustomField(index)">
                Remove
              </button>
            </div>
          </div>
          <button type="button" class="btn btn-primary" @click="addCustomField">
            Add Custom Field
          </button>

          <hr>

          <h3>Manage Priorities</h3>
          <TagsInput v-model="priorities" placeholder="Add a priority" />

          <h3>Manage Statuses</h3>
          <TagsInput v-model="statuses" placeholder="Add a status" />

          <h3>Manage Tags</h3>
          <TagsInput v-model="tags" placeholder="Add a tag" />
          <h3>Manage Types</h3>
          <TagsInput v-model="types" placeholder="Add a type" />

          <hr>

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

          <hr>

          <button type="button" class="btn btn-primary" @click.prevent="updateProject">Update Project</button>
          <button type="button" class="btn btn-warning" style="margin-left: 10px;" @click="close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { type Label, useTaskStore } from "@/stores/taskStore"
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import TagsInput from "@/components/TagsInput.vue";

const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const name = ref('')
const description = ref('')
const customFields = ref<{ name: string; description: string; type: string }[]>([])

const labelName = ref('')
const labelColor = ref('#000000')

const priorities = ref<string[]>([])
const statuses = ref<string[]>([])
const tags = ref<string[]>([])
const types = ref<string[]>([])

const projectId = route.params.projectId.toString()

const labels = computed(() => taskStore.labels)

const fetchProject = async () => {
  const project = await projectStore.fetchProject(Number(projectId))
  if (project) {
    name.value = project.name
    description.value = project.description
    customFields.value = project.customFields
    if(project.priorities) priorities.value = project.priorities
    if(project.statuses) statuses.value = project.statuses
    if(project.tags) tags.value = project.tags
    if(project.types) types.value = project.types
  }
}

const addCustomField = () => {
  customFields.value.push({ name: '', description: '', type: 'text' });
};

const removeCustomField = (index: number) => {
  customFields.value.splice(index, 1);
};

const updateProject = async () => {
  await projectStore.updateProject(Number(projectId), {
    name: name.value,
    description: description.value,
    customFields: customFields.value,
    priorities: priorities.value,
    statuses: statuses.value,
    tags: tags.value,
    types: types.value
  })
  router.push('/cabinet')
}

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

function close() {
  router.push(`/cabinet/projects/${projectId}`)
}

onMounted(async () => {
  await fetchProject()
  await fetchLabels()
})
</script>

