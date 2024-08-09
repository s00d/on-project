import { defineStore } from 'pinia'
import axios from 'axios'
import { socket } from '@/plugins/socketPlugin'
import { useAlertStore } from './alertStore'

export interface Roadmap {
  id: number
  title: string
  description: string
  projectId: number
}

interface RoadmapState {
  roadmaps: Roadmap[]
}

export const useRoadmapStore = defineStore('roadmap', {
  state: (): RoadmapState => ({
    roadmaps: []
  }),
  actions: {
    async fetchRoadmaps(projectId: number) {
      try {
        const response = await axios.get(`/roadmaps/${projectId}`)
        this.roadmaps = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch roadmaps', 'danger')
      }
    },
    async createRoadmap(projectId: number, roadmap: { title: string; description?: string; projectId: number }) {
      try {
        const response = await axios.post(`/roadmaps/${projectId}`, roadmap)
        this.roadmaps.push(response.data)
        useAlertStore().setAlert('Roadmap created successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to create roadmap', 'danger')
      }
    },
    async updateRoadmap(projectId: number, roadmapId: number, roadmap: { title: string; description?: string }) {
      try {
        const response = await axios.put(`/roadmaps/${projectId}/${roadmapId}`, roadmap)
        useAlertStore().setAlert('Roadmap updated successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to update roadmap', 'danger')
      }
    },
    async deleteRoadmap(projectId: number, roadmapId: number) {
      try {
        await axios.delete(`/roadmaps/${projectId}/${roadmapId}`)
        this.roadmaps = this.roadmaps.filter((r) => r.id !== roadmapId)
        useAlertStore().setAlert('Roadmap deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete roadmap', 'danger')
      }
    },
    subscribeToSocketEvents() {
      socket.on('roadmap:create', (roadmap) => {
        this.roadmaps.push(roadmap)
      })
      socket.on('roadmap:update', (updatedRoadmap) => {
        const index = this.roadmaps.findIndex((roadmap) => roadmap.id === updatedRoadmap.id)
        if (index !== -1) {
          this.roadmaps[index] = updatedRoadmap
        }
      })
      socket.on('roadmap:delete', ({ id }) => {
        this.roadmaps = this.roadmaps.filter((roadmap) => roadmap.id !== id)
      })
    }
  },
  getters: {
    getRoadmaps: (state) => state.roadmaps,
  }
})
