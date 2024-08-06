import { defineStore } from 'pinia';
import axios from 'axios';
import { socket } from '@/plugins/socketPlugin';
import { useAlertStore } from './alertStore';

export interface Sprint {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  roadmapId: number;
}

interface SprintState {
  sprints: Sprint[];
}

export const useSprintStore = defineStore('sprint', {
  state: (): SprintState => ({
    sprints: [],
  }),
  actions: {
    async fetchSprints(roadmapId: number) {
      try {
        const response = await axios.get(`/sprints/${roadmapId}`);
        this.sprints = response.data;
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch sprints', 'danger');
      }
    },
    async createSprint(sprint: { title: string, description?: string, startDate: Date, endDate: Date, roadmapId: number }) {
      try {
        const response = await axios.post('/sprints', sprint);
        this.sprints.push(response.data);
        useAlertStore().setAlert('Sprint created successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to create sprint', 'danger');
      }
    },
    async updateSprint(sprintId: number, sprint: { title: string, description?: string, startDate: Date, endDate: Date }) {
      try {
        const response = await axios.put(`/sprints/${sprintId}`, sprint);
        const index = this.sprints.findIndex(s => s.id === sprintId);
        if (index !== -1) {
          this.sprints[index] = response.data;
          useAlertStore().setAlert('Sprint updated successfully', 'success');
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to update sprint', 'danger');
      }
    },
    async deleteSprint(sprintId: number) {
      try {
        await axios.delete(`/sprints/${sprintId}`);
        this.sprints = this.sprints.filter(s => s.id !== sprintId);
        useAlertStore().setAlert('Sprint deleted successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to delete sprint', 'danger');
      }
    },
    subscribeToSocketEvents() {
      socket.on('sprint:create', (sprint) => {
        this.sprints.push(sprint);
      });
      socket.on('sprint:update', (updatedSprint) => {
        const index = this.sprints.findIndex(sprint => sprint.id === updatedSprint.id);
        if (index !== -1) {
          this.sprints[index] = updatedSprint;
        }
      });
      socket.on('sprint:delete', ({ id }) => {
        this.sprints = this.sprints.filter(sprint => sprint.id !== id);
      });
    }
  },
});
