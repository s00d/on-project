<template>
  <div class="scrum-roadmap-timeline" ref="timelineContainer">
    <div class="timeline-header">
      <div class="timeline-month" v-for="(month, index) in months" :key="index">
        <div class="month-label">{{ formatMonth(month[0]) }}</div>
        <div class="days">
          <div class="day-label" v-for="day in month" :key="formatDay(day)">
            {{ formatDay(day) }}
            <div
              v-if="isToday(day)"
              class="current-day-marker"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="sprint-rows">
      <div v-for="sprint in sprints" :key="sprint.id" class="sprint-row">
        <div class="sprint-title">{{ sprint.title }}</div>
        <div class="sprint-bar-container">
          <div class="sprint-bar" :style="getSprintBarStyle(sprint)" @mouseenter="showTooltip($event, sprint.tasks)" @mouseleave="hideTooltip">

            <div class="sprint-info">
              <div class="sprint-info-title">{{ sprint.title }}</div>
              <div class="sprint-info-tasks">
                Tasks: {{ completedTasks(sprint.tasks) }} / {{ sprint.tasks.length }}
                ({{ taskCompletionPercentage(sprint.tasks) }}%)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tooltip Element -->
  <div v-if="tooltipVisible" class="tooltip" :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }">
    <ul>
      <li v-for="task in tooltipTasks" :key="task.id">
        <span>{{ task.title }} - {{ task.status }}</span>

        <span class="task-priority priority-low">{{ task.priority }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, nextTick, onMounted, ref} from 'vue';
import {addDays, differenceInDays, endOfMonth, endOfYear, format, isToday as checkIfToday, startOfYear} from 'date-fns';
import type {Sprint} from "@/stores/sprintStore";
import type {Task} from "@/stores/taskStore";

defineProps<{
  sprints: Sprint[]
}>();

const months = ref<Date[][]>([]);  // To store months with days
const timelineContainer = ref<HTMLDivElement | null>(null);

const tooltipVisible = ref(false);
const tooltipTasks = ref<Task[]>([]);
const tooltipPosition = ref({ x: 0, y: 0 });


const dateWidth = 27;  // Width of each date column in pixels

const generateTimelineMonths = () => {
  const currentYear = new Date().getFullYear();
  const overallStartDate = startOfYear(new Date(currentYear, 0, 1));
  const overallEndDate = endOfYear(new Date(currentYear, 11, 31));

  const currentMonths = [];
  let currentDate = new Date(overallStartDate);

  while (currentDate <= overallEndDate) {
    const month = [];
    const monthEnd = endOfMonth(currentDate);

    while (currentDate <= monthEnd) {
      month.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    currentMonths.push(month);
  }

  months.value = currentMonths;
};

const scrollToToday = () => {
  if (!timelineContainer.value) return;

  const today = new Date();
  const daysFromStart = differenceInDays(today, months.value[0][0]);

  timelineContainer.value.scrollLeft = daysFromStart * dateWidth - 200;
};

const completedTasks = (tasks: Task[]) => {
  return tasks.filter(task => task.status === 'Completed').length;
};

const showTooltip = (event: MouseEvent, tasks: Task[]) => {
  tooltipTasks.value = tasks;
  tooltipPosition.value = { x: event.clientX + 10, y: event.clientY + 10 }; // Смещение тултипа относительно курсора
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
  tooltipTasks.value = [];
};

const taskCompletionPercentage = (tasks: Task[]) => {
  const completed = completedTasks(tasks);
  return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
};

const getSprintBarStyle = (sprint: Sprint) => {
  if (!months.value || months.value.length === 0 || !months.value[0] || months.value[0].length === 0) {
    return {};
  }

  const sprintStart = new Date(sprint.startDate);
  const sprintEnd = new Date(sprint.endDate);

  const offsetDays = differenceInDays(sprintStart, months.value[0][0]);
  const durationDays = differenceInDays(sprintEnd, sprintStart) + 1;

  return {
    left: offsetDays * dateWidth + (offsetDays * 0.1) + 'px',
    width: durationDays * dateWidth + (offsetDays * 0.1) + 'px',
    backgroundColor: '#4caf50',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };
};

const formatDay = (date: Date) => {
  return format(date, 'dd');  // Format date as "01"
};

const formatMonth = (date: Date) => {
  return format(date, 'MMMM yyyy');  // Format month as "January 2024"
};

const isToday = (date: Date) => {
  return checkIfToday(date);
};

onMounted(async () => {
  generateTimelineMonths();
  await nextTick();
  scrollToToday();
});
</script>

<style scoped>
.scrum-roadmap-timeline {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  position: relative;
}

.timeline-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  flex-direction: row;
  padding-left: 192px;
}

.timeline-month {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background-color: #0070f3;
  color: white;
  border-radius: 8px;
  margin-right: 2px;
}

.month-label {
  font-weight: bold;
  padding: 8px 5px;
  text-align: center;
}

.days {
  display: flex;
  background-color: #f1f1f1;
}

.day-label {
  text-align: center;
  padding: 10px 5px;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
  font-size: 0.9em;
  color: black;
  position: relative;
  width: 27px;
}

.current-day-marker {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background-color: red;
  z-index: 10;
}

.sprint-rows {
  display: flex;
  flex-direction: column;
}

.sprint-row {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #ddd;
  width: 9900px;
}

.sprint-title {
  flex: 0 0 200px;
  padding: 10px;
  font-weight: bold;
  color: #444;
}

.sprint-bar-container {
  position: relative;
  flex: 1;
  margin: 0;  /* Убедитесь, что нет margin */
  padding: 0; /* Убедитесь, что нет padding */

  border: 1px solid blue;
}

.sprint-bar {
  position: absolute;
  height: 35px;
  display: flex;
  flex-direction: column;
  color: white;
  justify-content: center;
  top: -17px;
  padding-left: 0;
}

.sprint-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  overflow-x: scroll;
}

.sprint-info-title {
  font-weight: bold;
  font-size: 14px;
}

.sprint-info-tasks {
  font-size: 12px;
  margin-left: 10px;
}

.task-bar {
  position: absolute;
  height: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  margin-top: 5px;
  text-overflow: ellipsis;
}

.task-details {
  font-size: 10px;
  color: #fff;
  margin-top: 2px;
}

.task-priority {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.8em;
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 300px; /* Ширина подсказки */
  opacity: 1;
}

.tooltip ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.tooltip li {
  margin-bottom: 5px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
