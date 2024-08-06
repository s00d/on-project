import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAlertStore } from './alertStore';

const socket = io(import.meta.env.VITE_SOCKET_URL);

interface Roadmap {
  id: number;
  title: string;
  description: string;
  projectId: number;
}

interface RoadmapState {
  roadmaps: Roadmap[];
}

export const useRoadmapStore = defineStore('roadmap', {
  state: (): RoadmapState => ({
    roadmaps: [],
  }),
  actions: {
    async fetchRoadmaps(projectId: number) {
      try {
        const response = await axios.get(`/roadmaps/${projectId}`);
        this.roadmaps = response.data;
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch roadmaps', 'danger');
      }
    },
    async createRoadmap(roadmap: { title: string, description?: string, projectId: number }) {
      try {
        const response = await axios.post('/roadmaps', roadmap);
        this.roadmaps.push(response.data);
        useAlertStore().setAlert('Roadmap created successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to create roadmap', 'danger');
      }
    },
    async updateRoadmap(roadmapId: number, roadmap: { title: string, description?: string }) {
      try {
        const response = await axios.put(`/roadmaps/${roadmapId}`, roadmap);
        const index = this.roadmaps.findIndex(r => r.id === roadmapId);
        if (index !== -1) {
          this.roadmaps[index] = response.data;
          useAlertStore().setAlert('Roadmap updated successfully', 'success');
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to update roadmap', 'danger');
      }
    },
    async deleteRoadmap(roadmapId: number) {
      try {
        await axios.delete(`/roadmaps/${roadmapId}`);
        this.roadmaps = this.roadmaps.filter(r => r.id !== roadmapId);
        useAlertStore().setAlert('Roadmap deleted successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to delete roadmap', 'danger');
      }
    },
    subscribeToSocketEvents() {
      socket.on('roadmap:create', (roadmap) => {
        this.roadmaps.push(roadmap);
      });
      socket.on('roadmap:update', (updatedRoadmap) => {
        const index = this.roadmaps.findIndex(roadmap => roadmap.id === updatedRoadmap.id);
        if (index !== -1) {
          this.roadmaps[index] = updatedRoadmap;
        }
      });
      socket.on('roadmap:delete', ({ id }) => {
        this.roadmaps = this.roadmaps.filter(roadmap => roadmap.id !== id);
      });
    }
  },
});
