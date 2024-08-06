<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Project Calendar</h1>
          <FullCalendar
            :plugins="[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]"
            initial-view="dayGridMonth"
            :events="events"
            @eventClick="handleEventClick"
          />
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {  ref, onMounted } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Tabs from "@/components/Tabs.vue";

const events = ref([]);

const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/tasks');
    events.value = response.data.map((task: any) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      description: task.description,
      extendedProps: {
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
      },
    }));
  } catch (error) {
    console.error('Failed to fetch tasks', error);
  }
};

const handleEventClick = (info: any) => {
  alert(`Task: ${info.event.title}\nStatus: ${info.event.extendedProps.status}\nPriority: ${info.event.extendedProps.priority}`);
};

onMounted(fetchTasks);
</script>
