<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container-fluid">
          <div class="row flex-nowrap">
            <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
              <ReportsLinks :project-id="projectId" />
            </div>

            <div class="col py-3">
              <div class="report-generator">
                <h1>Universal Report Builder</h1>

                <form @submit.prevent="generateReport" class="report-form">
                  <div class="form-group">
                    <label>Select Model:</label>
                    <select v-model="selectedModel">
                      <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Select Fields:</label>
                    <select v-model="selectedFields" multiple>
                      <option v-for="field in availableFields" :key="field" :value="field">{{ field }}</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Select Filters:</label>
                    <div v-for="(value, field) in selectedFilters" :key="field">
                      <label>{{ field }}:</label>
                      <input v-model="selectedFilters[field]" />
                    </div>
                    <button type="button" class="add-filter-btn" @click="addFilter">Add Filter</button>
                  </div>

                  <div class="form-group">
                    <label>Group By:</label>
                    <select v-model="groupBy">
                      <option v-for="field in availableFields" :key="field" :value="field">{{ field }}</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Sort By:</label>
                    <select v-model="sortBy">
                      <option v-for="field in availableFields" :key="field" :value="field">{{ field }}</option>
                    </select>
                    <select v-model="sortOrder" class="sort-order">
                      <option value="ASC">Ascending</option>
                      <option value="DESC">Descending</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Chart Type:</label>
                    <select v-model="chartType">
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Select Date Range:</label>
                    <input type="date" v-model="startDate" />
                    <input type="date" v-model="endDate" />
                  </div>

                  <button type="submit" class="generate-report-btn">Generate Report</button>
                </form>

                <h2>Generated Report</h2>
                <div v-if="reportData && reportData.reportData && reportData.reportData.length">
                  <table class="report-table">
                    <thead>
                    <tr>
                      <th v-for="field in selectedFields" :key="field">{{ field }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in reportData.reportData" :key="item.entity_id">
                      <td v-for="field in selectedFields" :key="field">{{ item[`entity_${field}`] }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>

                <div class="chart-container">
                  <canvas id="reportChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>


<script setup lang="ts">
import {nextTick, ref, watch} from 'vue'
import axios from 'axios'
import { Chart, BarElement, ArcElement, LineElement, ScatterController, CategoryScale, LinearScale, Tooltip, BarController, PieController, LineController, PointElement } from 'chart.js'
import {useRoute} from "vue-router";
import ReportsLinks from "@/components/ReportsLinks.vue";
import Tabs from "@/components/Tabs.vue";
import {useAlertStore} from "@/stores/alertStore";

Chart.register(BarElement, ArcElement, LineElement, ScatterController, CategoryScale, LinearScale, Tooltip, BarController, PieController, LineController, PointElement)

const route = useRoute()
const projectId = ref(route.params.projectId.toString())

const availableModels = ['Task', 'User', 'Project', 'Sprint', 'Label'];

const modelFields = {
  Task: ['id', 'title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt', 'type', 'tags'],
  User: ['id', 'username', 'email', 'password', 'createdAt', 'updatedAt'],
  Project: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
  Sprint: ['id', 'title', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
  Label: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
};

const selectedModel = ref<string>('Task');
// @ts-ignore
const availableFields = ref<string[]>(modelFields[selectedModel.value]);
const selectedFields = ref<string[]>([]);
const selectedFilters = ref<Record<string, string>>({});
const groupBy = ref('createdAt');
const sortBy = ref('createdAt');
const sortOrder = ref<'ASC' | 'DESC'>('ASC');
const chartType = ref<'bar' | 'pie' | 'line' | 'scatter'>('bar');
const startDate = ref('');
const endDate = ref('');

const updateFields = () => {
  // @ts-ignore
  availableFields.value = modelFields[selectedModel.value];
  selectedFields.value = [];
  groupBy.value = '';
  sortBy.value = '';
  selectedFilters.value = {};
};

watch(selectedModel, () => {
  updateFields();
});

const reportData = ref<any>(null);
const select = ref<any>(null);

const addFilter = () => {
  selectedFilters.value[''] = '';
};

const generateReport = async () => {
  try {
    const response = await axios.post<any>(`/reports/project/${projectId.value}/universal`, {
      model: selectedModel.value,
      fields: selectedFields.value,
      filters: selectedFilters.value,
      groupBy: groupBy.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      chartType: chartType.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
    reportData.value = response.data;
    createChart();
  } catch (error: any) {
    console.error('Failed to generate report', error);
    useAlertStore().setAlert(`Failed to generate report: ${error.response?.data?.error}`, 'danger')
  }
};

const createChart = () => {
  if (reportData.value) {
    const ctx = document.getElementById('reportChart') as HTMLCanvasElement;

    // Перебираем данные, чтобы создать массив для графика
    const labels: string[] = [];
    const data: number[] = [];

    reportData.value.reportData.forEach((item: any) => {
      labels.push(item.groupByField || 'Other');
      data.push(parseInt(item.count));
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: `Data grouped by ${groupBy.value}`,
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    if (select.value) select.value.destroy();
    nextTick(() => {
      select.value = new Chart(ctx, {
        type: chartType.value,
        data: chartData,
      });
    })
  }
};
</script>

<style scoped>
.project-board {
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
  border-radius: 8px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
}

.board-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.board-filters label {
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
}

.board-filters select {
  padding: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background-color: #fff;
  color: #4a5568;
}

.chart-container {
  position: relative;
  height: 800px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.chart-container canvas {
  margin: auto;
  width: 800px;
}

.report-generator {
  padding: 20px;
  background-color: #f9f9f9;
}

.report-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-filter-btn {
  margin-top: 10px;
}

.generate-report-btn {
  grid-column: span 2;
  padding: 10px 20px;
  font-size: 1.1rem;
  background-color: #3182ce;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.generate-report-btn:hover {
  background-color: #2c5282;
}

form select,
form input,
form button {
  padding: 10px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.report-table th,
.report-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

.report-table th {
  background-color: #f4f5f7;
  font-weight: bold;
}
</style>
