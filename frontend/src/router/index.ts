import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/auth/LoginPage.vue'
import RegisterPage from '../pages/auth/RegisterPage.vue'
import TwoFactorAuth from '../pages/auth/TwoFactorAuth.vue'
import RequestPasswordReset from '../pages/auth/RequestPasswordReset.vue'
import ResetPassword from '../pages/auth/ResetPassword.vue'

import Profile from '../pages/Profile.vue'
import ProjectList from '../pages/project/ProjectList.vue'
import AddProject from '../pages/project/AddProject.vue'
import EditProject from '../pages/project/EditProject.vue'
import KanbanBoard from '../pages/project/KanbanBoard.vue'
import RoadmapList from '../pages/project/RoadmapList.vue'
import SprintList from '../pages/project/SprintList.vue'
import TaskList from '../pages/project/TaskList.vue'

import InviteUser from '../pages/InviteUser.vue'
import RoleList from '../pages/permission/RoleList.vue'
import PermissionList from '../pages/permission/PermissionList.vue'
import AssignRole from '../pages/permission/AssignRole.vue'

import ProjectReport from '../pages/report/ProjectReport.vue'
import PriorityReport from '../pages/report/PriorityReport.vue'
import OverdueReport from '../pages/report/OverdueReport.vue'
import TeamPerformanceReport from '../pages/report/TeamPerformanceReport.vue'
import PriorityDistributionReport from '../pages/report/PriorityDistributionReport.vue'
import ProgressReport from '../pages/report/ProgressReport.vue'
import TeamWorkloadReport from '../pages/report/TeamWorkloadReport.vue'

import Calendar from '../pages/CalendarPage.vue'
import ImportExport from '../pages/ImportExport.vue'
import TaskTemplates from '../pages/project/TaskTemplates.vue'

import { useAuthStore } from '@/stores/authStore'

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import CreateTask from '@/pages/project/CreateTask.vue'

const routes = [
  { path: '/', component: Home },
  {
    path: '/auth/login',
    component: LoginPage,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next()
      } else {
        next('/cabinet')
      }
    }
  },
  {
    path: '/auth/register',
    component: RegisterPage,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next()
      } else {
        next('/cabinet')
      }
    }
  },
  {
    path: '/auth/2fa',
    component: TwoFactorAuth,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/auth/request-password-reset',
    component: RequestPasswordReset,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next()
      } else {
        next('/cabinet')
      }
    }
  },
  {
    path: '/auth/reset-password',
    component: ResetPassword,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next()
      } else {
        next('/cabinet')
      }
    }
  },

  {
    path: '/cabinet',
    component: ProjectList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/profile',
    component: Profile,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/add',
    component: AddProject,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/:id/edit',
    component: EditProject,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/:projectId/invite',
    component: InviteUser,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/:projectId',
    component: TaskList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/:projectId/tasks/add',
    component: CreateTask,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/templates',
    component: TaskTemplates,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/priority',
    component: PriorityReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/report',
    component: ProjectReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/overdue',
    component: OverdueReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/performance',
    component: TeamPerformanceReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },

  {
    path: '/cabinet/reports/:projectId/priority-distribution',
    component: PriorityDistributionReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/progress',
    component: ProgressReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/reports/:projectId/workload',
    component: TeamWorkloadReport,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },

  {
    path: '/cabinet/:projectId/kanban',
    component: KanbanBoard,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/projects/:projectId/roadmaps',
    component: RoadmapList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/roadmaps/:roadmapId/sprints',
    component: SprintList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/roles',
    component: RoleList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/roles/:roleId/permissions',
    component: PermissionList,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        next('/auth/login')
      } else {
        next()
      }
    }
  },
  {
    path: '/cabinet/assign-role',
    component: AssignRole,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || !authStore.getUserRoles.includes('Project Creator')) {
        next('/auth/login')
      } else {
        next()
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
