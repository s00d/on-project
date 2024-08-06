import { defineStore } from 'pinia';
import axios from 'axios';
import { useAlertStore } from './alertStore';

interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
}

interface ProjectState {
  projects: Project[];
  project: Project | null;
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    project: null,
  }),
  actions: {
    async fetchProjects() {
      try {
        const response = await axios.get('/projects');
        this.projects = response.data;
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch projects', 'danger');
      }
    },
    async fetchProject(id: number) {
      try {
        const response = await axios.get(`/projects/${id}`);
        this.project = response.data;
        return this.project;
      } catch (error) {
        useAlertStore().setAlert('Failedto fetch project', 'danger');
      }
    },
    async createProject(project: { name: string, description: string }) {
      try {
        const response = await axios.post('/projects', project);
        this.projects.push(response.data);
        useAlertStore().setAlert('Project created successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to create project', 'danger');
      }
    },
    async updateProject(id: number, project: Project) {
      try {
        const response = await axios.put("/projects/${id}", project);
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = response.data;
          useAlertStore().setAlert('Project updated successfully', 'success');
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to update project', 'danger');
      }
    },
    async deleteProject(id: number) {
      try {
        await axios.delete("/projects/${id}");
        this.projects = this.projects.filter(p => p.id !== id);
        useAlertStore().setAlert('Project deleted successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to delete project', 'danger');
      }
    }
  }
});
