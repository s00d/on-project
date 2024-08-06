<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Sprints</h1>
          <form @submit.prevent="addSprint" class="mt-3">
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input v-model="newSprintTitle" type="text" id="title" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                v-model="newSprintDescription"
                id="description"
                class="form-control"
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="startDate" class="form-label">Start Date</label>
              <input v-model="newSprintStartDate" type="date" id="startDate" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="endDate" class="form-label">End Date</label>
              <input v-model="newSprintEndDate" type="date" id="endDate" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Add Sprint</button>
          </form>
          <ul class="list-group mt-3">
            <li v-for="sprint in sprints" :key="sprint.id" class="list-group-item">
              <h5>{{ sprint.title }}</h5>
              <p>{{ sprint.description }}</p>
              <p>Start Date: {{ sprint.startDate }}</p>
              <p>End Date: {{ sprint.endDate }}</p>
              <button @click="deleteSprint(sprint.id)" class="btn btn-danger">Delete</button>
              <button @click="editSprint(sprint)" class="btn btn-secondary">Edit</button>
            </li>
          </ul>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useSprintStore } from '@/stores/sprintStore'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Tabs.vue'

export default defineComponent({
  name: 'SprintList',
  components: { Tabs },
  setup() {
    const sprintStore = useSprintStore()
    const route = useRoute()
    const newSprintTitle = ref('')
    const newSprintDescription = ref('')
    const newSprintStartDate = ref('')
    const newSprintEndDate = ref('')
    const roadmapId = Number(route.params.roadmapId)

    const fetchSprints = async () => {
      await sprintStore.fetchSprints(roadmapId)
    }

    const addSprint = async () => {
      await sprintStore.createSprint({
        title: newSprintTitle.value,
        description: newSprintDescription.value,
        startDate: new Date(newSprintStartDate.value),
        endDate: new Date(newSprintEndDate.value),
        roadmapId
      })
      newSprintTitle.value = ''
      newSprintDescription.value = ''
      newSprintStartDate.value = ''
      newSprintEndDate.value = ''
    }

    const deleteSprint = async (sprintId: number) => {
      await sprintStore.deleteSprint(sprintId)
    }

    const editSprint = async (sprint) => {
      // Implement edit sprint logic here
    }

    onMounted(() => {
      fetchSprints()
      sprintStore.subscribeToSocketEvents()
    })

    return {
      sprints: sprintStore.sprints,
      newSprintTitle,
      newSprintDescription,
      newSprintStartDate,
      newSprintEndDate,
      addSprint,
      deleteSprint,
      editSprint
    }
  }
})
</script>
