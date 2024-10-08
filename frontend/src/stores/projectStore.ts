import { defineStore } from 'pinia'
import axios from 'axios'
import { useAlertStore } from './alertStore'
import type { Sprint } from '@/stores/sprintStore'

export interface Project {
  id?: number
  name: string
  description: string
  ownerId: number
  customFields: { name: string; description: string; type: string }[]
  savedFilters: { name: string; filters: any }[]
  priorities?: string[]
  statuses?: string[]
  tags?: string[]
  types?: string[]
  sprints?: Sprint[]
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  projects: Project[]
  project: Project | null
}

interface CustomField {
  name: string
  description: string
  type: string
}

interface updateProjectInterface {
  name?: string
  description?: string
  savedFilters?: { name: string; filters: any }[]
  customFields?: CustomField[]
  priorities?: string[]
  statuses?: string[]
  tags?: string[]
  types?: string[]
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    project: null
  }),
  actions: {
    async fetchProjects(showArchived = false) {
      try {
        const response = await axios.get('/projects', { params: { showArchived } })
        this.projects = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch projects', 'danger')
      }
    },
    async archiveProject(projectId: number) {
      try {
        await axios.put(`/projects/${projectId}/archive`)
      } catch (error) {
        console.error('Failed to archive project:', error)
      }
    },
    async fetchProject(id: number) {
      try {
        const response = await axios.get(`/projects/${id}`)
        this.project = response.data
        return this.project
      } catch (error) {
        useAlertStore().setAlert('Failedto fetch project', 'danger')
      }
    },
    async createProject(project: { name: string; description: string }) {
      try {
        const response = await axios.post('/projects', project)
        useAlertStore().setAlert('Project created successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to create project', 'danger')
      }
    },
    async updateProject(id: number, project: updateProjectInterface) {
      try {
        const response = await axios.put(`/projects/${id}`, project)
        useAlertStore().setAlert('Project updated successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to update project', 'danger')
      }
    },
    async deleteProject(id: number) {
      try {
        await axios.delete(`/projects/${id}`)
        this.projects = this.projects.filter((p) => p.id !== id)
        useAlertStore().setAlert('Project deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete project', 'danger')
      }
    },
    async fetchUsers(projectId: number) {
      const response = await axios.get(`/projects/${projectId}/users`)
      return response.data
    }
  }
})
