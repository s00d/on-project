<template>
  <div class="modal-body">
    <h1 v-if="mode === 'create'">Add Project</h1>
    <h1 v-if="mode === 'edit'">Edit Project</h1>

    <div class="mb-3">
      <label for="name" class="form-label">Project Name</label>
      <input v-model="projectData.name" type="text" id="name" class="form-control" required />
    </div>

    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <MdEditor
        v-model="projectData.description"
        language="en-US"
        previewTheme="github"
        noMermaid
        :preview="false"
      />
    </div>

    <!-- Спойлер для дополнительных полей -->
    <div>
      <button v-if="mode === 'edit'" class="btn btn-link" @click="toggleAdvancedFields">
        {{ showAdvancedFields ? 'Hide' : 'Show' }} Advanced Fields
      </button>
    </div>
    <div v-if="showAdvancedFields && mode === 'edit'">
      <h3>Manage Custom Fields</h3>
      <div v-for="(field, index) in projectData.customFields" :key="index" class="mb-3">
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

      <hr />

      <h3>Manage Priorities</h3>
      <TagsInput v-model="projectData.priorities" placeholder="Add a priority" />

      <h3>Manage Statuses</h3>
      <TagsInput v-model="projectData.statuses" placeholder="Add a status" />

      <h3>Manage Tags</h3>
      <TagsInput v-model="projectData.tags" placeholder="Add a tag" />

      <h3>Manage Types</h3>
      <TagsInput v-model="projectData.types" placeholder="Add a type" />

      <hr />

      <div class="container mt-5">
        <div class="mb-4">
          <h3>Manage Labels</h3>
          <form @submit.prevent="createLabel" class="form-inline mb-3">
            <div class="form-group mr-3">
              <label for="name" class="sr-only">Label Name</label>
              <input
                v-model="labelName"
                type="text"
                id="name"
                class="form-control"
                placeholder="Label Name"
                required
              />
            </div>
            <div class="form-group mr-3">
              <label for="color" class="sr-only">Label Color</label>
              <input
                v-model="labelColor"
                type="color"
                id="color"
                class="form-control"
                required
              />
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
              <button @click="deleteLabel(label.id)" class="btn btn-sm btn-danger">
                Delete
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pef"></div>

    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click.prevent="submitProject">
        {{ mode === 'create' ? 'Create Project' : 'Save Changes' }}
      </button>
      <button type="button" class="btn btn-danger" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, defineProps} from 'vue'
import {type Project, useProjectStore} from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import TagsInput from '@/components/TagsInput.vue'
import {type Label, useTaskStore} from "@/stores/taskStore";

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const router = useRouter()

const showAdvancedFields = ref(false)

const labelName = ref('')
const labelColor = ref('#000000')

const labels = computed(() => taskStore.labels)

const emit = defineEmits(['save', 'close'])

const props = defineProps<{
  initialTaskData?: Project | null
  mode: 'create' | 'edit'
}>()

const projectData = ref<Project>({
  ownerId: 0,
  customFields: [],
  description: "",
  name: "",
  priorities: ["Low", "Medium", "High"],
  savedFilters: [],
  sprints: [],
  statuses: ["To Do", "In Progress", "Done"],
  tags: [],
  types: ["Frontend", "Backend", "Test", "Deploy", "Mixed"],
  createdAt: "",
  updatedAt: "",
})

const toggleAdvancedFields = () => {
  showAdvancedFields.value = !showAdvancedFields.value
}

const addCustomField = () => {
  projectData.value.customFields.push({ name: '', description: '', type: 'text' })
}

const removeCustomField = (index: number) => {
  projectData.value.customFields.splice(index, 1)
}

const submitProject = async () => {
  if (props.mode === 'create') {
    await projectStore.createProject({name: projectData.value.name, description: projectData.value.description})
  } else {
    const dataToSave = { ...projectData.value }
    delete (dataToSave as { createdAt?: string }).createdAt
    delete (dataToSave as { updatedAt?: string }).updatedAt
    delete (dataToSave as { ownerId?: number }).ownerId
    delete (dataToSave as { id?: number }).id

    await projectStore.updateProject(projectData.value.id!, dataToSave)
  }
  emit('save')
  router.push({ name: 'ProjectList' })
}

const createLabel = async () => {
  if (projectData.value.id) {
    await taskStore.createLabel(projectData.value.id, {
      name: labelName.value,
      color: labelColor.value
    })
    labelName.value = ''
    labelColor.value = '#000000'
    await fetchLabels()
  }

}

const fetchLabels = async () => {
  if (projectData.value.id) {
    await taskStore.fetchLabels(projectData.value.id)
  }
}

const editLabel = async (label: Label) => {
  if (projectData.value.id) {
    labelName.value = label.name
    labelColor.value = label.color
    await taskStore.updateLabel(projectData.value.id, label.id, {
      name: labelName.value,
      color: labelColor.value
    })
    await fetchLabels()
  }

}

const deleteLabel = async (labelId: number) => {
  if (projectData.value.id) {
    await taskStore.deleteLabel(projectData.value.id, labelId)
    await fetchLabels()
  }
}

onMounted(async () => {
  if (props.mode === 'edit' && props.initialTaskData) {
    projectData.value = { ...props.initialTaskData }
  }
  await fetchLabels()
})
</script>
<style scoped>
.task-form {
  max-width: 800px;
  margin: 0 auto;
}

.pef {
  padding-bottom: 75px;
}

.modal-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
}
</style>
