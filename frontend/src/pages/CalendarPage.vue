<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Project Calendar</h1>
          <FullCalendar :options="calendarOptions" />
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import Tabs from '@/components/Tabs.vue'
import { useAlertStore } from '@/stores/alertStore'
import { useRoute } from 'vue-router'
import { type Task, useTaskStore } from '@/stores/taskStore'

const events = ref([])
const route = useRoute()
const taskStore = useTaskStore()

const projectId = route.params.projectId.toString()

const fetchTasks = async (startDate: string, endDate: string) => {
  try {
    const pId = parseInt(projectId)
    const { tasks } = await taskStore.fetchTasks(pId, { startDate, endDate })

    events.value = tasks.map((task: Task) => ({
      id: task.id,
      title: task.title,
      start: task.startDate, // Assuming your task has a startDate property
      end: task.stopDate, // Using dueDate as the end date
      description: task.description,
      extendedProps: {
        status: task.status,
        priority: task.priority,
        assignee: task.assignees?.map((assignee) => assignee.id)
      }
    }))
  } catch (error: any) {
    console.error('Failed to fetch tasks', error)
    useAlertStore().setAlert(`Failed to fetch tasks: ${error.response?.data?.error}`, 'danger')
  }
}

const handleDatesSet = (info: any) => {
  const startDate = info.startStr
  const endDate = info.endStr

  fetchTasks(startDate, endDate)
}

const handleEventClick = (info: any) => {
  useAlertStore().setAlert(
    `Task: ${info.event.title}\nStatus: ${info.event.extendedProps.status}\nPriority: ${info.event.extendedProps.priority}`,
    'success'
  )
}

const calendarOptions = computed(() => {
  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    events: events.value,
    eventClick: handleEventClick,
    datesSet: handleDatesSet
  }
})
</script>
