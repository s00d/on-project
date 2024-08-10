import { defineStore } from 'pinia'
import axios from 'axios'
import { socket } from '@/plugins/socketPlugin'
import { useAlertStore } from './alertStore'
import type { Task } from '@/stores/taskStore'

export interface Sprint {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  roadmapId: number
  tasks: Task[]
}

interface SprintState {
  sprints: Sprint[]
}

export const useSprintStore = defineStore('sprint', {
  state: (): SprintState => ({
    sprints: []
  }),
  actions: {
    async fetchSprints(projectId: number, roadmapId: number) {
      try {
        const response = await axios.get(`/sprints/${projectId}/${roadmapId}`)
        this.sprints = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch sprints', 'danger')
      }
    },
    async createSprint(
      projectId: number,
      sprint: {
        title: string
        description?: string
        startDate: Date
        endDate: Date
        roadmapId: number
      }
    ) {
      try {
        const response = await axios.post(`/sprints/${projectId}`, sprint)
        this.sprints.push(response.data)
        useAlertStore().setAlert('Sprint created successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to create sprint', 'danger')
      }
    },
    async updateSprint(
      projectId: number,
      sprintId: number,
      sprint: { title: string; description?: string; startDate: Date; endDate: Date }
    ) {
      try {
        const response = await axios.put(`/sprints/${projectId}/${sprintId}`, sprint)
        const index = this.sprints.findIndex((s) => s.id === sprintId)
        useAlertStore().setAlert('Sprint updated successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to update sprint', 'danger')
      }
    },
    async deleteSprint(projectId: number, sprintId: number) {
      try {
        await axios.delete(`/sprints/${projectId}/${sprintId}`)
        this.sprints = this.sprints.filter((s) => s.id !== sprintId)
        useAlertStore().setAlert('Sprint deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete sprint', 'danger')
      }
    },
    subscribeToSocketEvents() {
      socket.on('sprint:create', (sprint) => {
        this.sprints.push(sprint)
      })
      socket.on('sprint:update', (updatedSprint) => {
        const index = this.sprints.findIndex((sprint) => sprint.id === updatedSprint.id)
        if (index !== -1) {
          this.sprints[index] = updatedSprint
        }
      })
      socket.on('sprint:delete', ({ id }) => {
        this.sprints = this.sprints.filter((sprint) => sprint.id !== id)
      })
    }
  },
  getters: {
    getSprints: (state) => state.sprints
  }
})
