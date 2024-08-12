import { defineStore } from 'pinia'
import axios from 'axios'
import { useAlertStore } from './alertStore'
import { socket } from '@/plugins/socketPlugin'
import type { User } from '@/stores/authStore'

export interface TaskBase {
  title: string
  description: string // Описание теперь обязательно, с значением по умолчанию ''
  status: string // Статус теперь обязателен, с значением по умолчанию ''
  projectId: number // Проект обязателен
  assignees?: {id: number}[] // Массив идентификаторов пользователей (опционально)
  assigneesIds?: number[]
  order: number
  sprintId?: number | null // Идентификатор метки (опционально)
  labelId?: number | null // Идентификатор метки (опционально)
  startDate?: Date | null // Дата завершения (опционально)
  stopDate?: Date | null // Дата завершения (опционально)
  dueDate?: Date | null // Дата завершения (опционально)
  priority: string // Приоритет теперь обязателен, с значением по умолчанию 'Medium'
  estimatedTime: number // Оценочное время теперь обязательно, с значением по умолчанию 0
  actualTime: number // Фактическое время теперь обязательно, с значением по умолчанию 0
  type: string // Тип задачи теперь обязателен, с значением по умолчанию ''
  plannedDate?: Date | null // Запланированная дата (опционально)
  relatedTaskId?: number | null // Идентификатор связанной задачи (опционально)
  tags?: string[] | null // Метки (опционально)
  customFields?: { [name: string]: string } // Кастомные поля (опционально)
}

export interface Task extends TaskBase {
  id: number
  label?: { name: string; color: string; id: number }
}

export interface Label {
  id: number
  name: string
  color: string
}

export interface Comment {
  id: number
  content: string
  attachment?: string | null
  taskId: number
  userId: number
  createdAt: string
  updatedAt: string
  user?: User
}

interface TaskState {
  tasks: Task[]
  labels: Label[]
  comments: Comment[]
}

interface TaskFilters {
  search?: string
  status?: string
  sprintId?: number | null
  priority?: string
  assignee?: string
  pageSize?: number
  relatedTaskId?: number
  page?: number
  startDate?: string
  endDate?: string
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    labels: [],
    comments: []
  }),
  actions: {
    async fetchTasks(projectId: number, filters: TaskFilters) {
      try {
        const response = await axios.get(`/tasks/${projectId}`, { params: filters })
        this.tasks = response.data.tasks
        return { tasks: response.data.tasks, total: response.data.total }
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch tasks', 'danger')
        return { tasks: [], total: 0 }
      }
    },
    async fetchTask(projectId: number, taskId: number) {
      try {
        const response = await axios.get(`/tasks/${projectId}/${taskId}`)
        return response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch tasks', 'danger')
      }
    },
    async fetchLabels(projectId: number) {
      try {
        const response = await axios.get(`/labels/${projectId}`)
        this.labels = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch labels', 'danger')
      }
    },
    async createTask(projectId: number, task: TaskBase) {
      try {
        const response = await axios.post(`/tasks/${projectId}`, task)
        this.tasks.push(response.data)
        useAlertStore().setAlert('Task created successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to create task', 'danger')
      }
    },
    async updateTask(projectId: number, taskId: number, task: Partial<TaskBase>) {
      try {
        const response = await axios.put(`/tasks/${projectId}/${taskId}`, task)
        useAlertStore().setAlert('Task updated successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to update task', 'danger')
      }
    },
    async deleteTask(projectId: number, taskId: number) {
      try {
        await axios.delete(`/tasks/${projectId}/${taskId}`)
        this.tasks = this.tasks.filter((t) => t.id !== taskId)
        useAlertStore().setAlert('Task deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete task', 'danger')
      }
    },
    async createLabel(projectId: number, label: { name: string; color: string }) {
      try {
        const response = await axios.post(`/labels/${projectId}`, label)
        this.labels.push(response.data)
        useAlertStore().setAlert('Label created successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to create label', 'danger')
      }
    },
    async updateLabel(projectId: number, labelId: number, label: { name: string; color: string }) {
      try {
        const response = await axios.put(`/labels/${projectId}/${labelId}`, label)
        const index = this.labels.findIndex((l) => l.id === labelId)
        if (index !== -1) {
          this.labels[index] = response.data
          useAlertStore().setAlert('Label updated successfully', 'success')
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to update label', 'danger')
      }
    },
    async deleteLabel(projectId: number, labelId: number) {
      try {
        await axios.delete(`/labels/${projectId}/${labelId}`)
        this.labels = this.labels.filter((l) => l.id !== labelId)
        useAlertStore().setAlert('Label deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete label', 'danger')
      }
    },
    async fetchComments(projectId: number, taskId: number) {
      try {
        const response = await axios.get(`/comments/${projectId}/${taskId}`)
        this.comments = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch comments', 'danger')
      }
    },
    async addComment(
      projectId: number,
      taskId: number,
      comment: { content: string; userId: number },
      attachment: File | null
    ) {
      try {
        const formData = new FormData()
        formData.append('content', comment.content)
        formData.append('userId', comment.userId.toString())
        if (attachment) {
          formData.append('attachment', attachment)
        }
        const response = await axios.post(`/comments/${projectId}/${taskId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.comments.push(response.data)
        useAlertStore().setAlert('Comment added successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to add comment', 'danger')
      }
    },
    async updateComment(projectId: number, commentId: number, content: string) {
      try {
        const response = await axios.put(`/comments/${projectId}/${commentId}`, { content })
        const index = this.comments.findIndex((c) => c.id === commentId)
        if (index !== -1) {
          this.comments[index] = response.data
          useAlertStore().setAlert('Comment updated successfully', 'success')
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to update comment', 'danger')
      }
    },
    async deleteComment(projectId: number, commentId: number) {
      try {
        await axios.delete(`/comments/${projectId}/${commentId}`)
        this.comments = this.comments.filter((c) => c.id !== commentId)
        useAlertStore().setAlert('Comment deleted successfully', 'success')
      } catch (error) {
        useAlertStore().setAlert('Failed to delete comment', 'danger')
      }
    },
    subscribeToSocketEvents() {
      socket.on('task:create', (task) => {
        this.tasks.push(task)
      })
      socket.on('task:update', (updatedTask) => {
        const index = this.tasks.findIndex((task) => task.id === updatedTask.id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }
      })
      socket.on('task:delete', ({ id }) => {
        this.tasks = this.tasks.filter((task) => task.id !== id)
      })
      socket.on('comment:create', (comment) => {
        this.comments.push(comment)
      })
      socket.on('comment:update', (updatedComment) => {
        const index = this.comments.findIndex((comment) => comment.id === updatedComment.id)
        if (index !== -1) {
          this.comments[index] = updatedComment
        }
      })
      socket.on('comment:delete', ({ id }) => {
        this.comments = this.comments.filter((comment) => comment.id !== id)
      })
    },
    setTasks(tasks: Task[]) {
      this.tasks = tasks
    }
  },
  getters: {
    getComments: (state) => state.comments
  }
})
