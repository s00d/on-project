import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/auth/LoginPage.vue'
import RegisterPage from '../pages/auth/RegisterPage.vue'
import TwoFactorAuth from '../pages/auth/TwoFactorAuth.vue'
import RequestPasswordReset from '../pages/auth/RequestPasswordReset.vue'
import ResetPassword from '../pages/auth/ResetPassword.vue'

import ProfilePage from '../pages/ProfilePage.vue'
import ProjectList from '../pages/project/ProjectList.vue'
import AddProject from '../pages/project/AddProject.vue'
import EditProject from '../pages/project/EditProject.vue'
import KanbanBoard from '../pages/project/KanbanBoard.vue'
import RoadmapList from '../pages/project/RoadmapList.vue'
import SprintList from '../pages/project/SprintList.vue'
import TaskList from '../pages/project/TaskList.vue'

import InviteUser from '../pages/InviteUser.vue'

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

import {authGuard} from "@/middleware/authGuard";
import {guestGuard} from "@/middleware/guestGuard";

const routes = [
  { path: '/', component: Home, name: 'Home' },
  {
    path: '/auth/login',
    component: LoginPage,
    name: 'Login',
    beforeEnter: guestGuard
  },
  {
    path: '/auth/register',
    component: RegisterPage,
    name: 'Register',
    beforeEnter: guestGuard
  },
  {
    path: '/auth/2fa',
    component: TwoFactorAuth,
    name: 'TwoFactorAuth',
    beforeEnter: guestGuard
  },
  {
    path: '/auth/request-password-reset',
    component: RequestPasswordReset,
    name: 'RequestPasswordReset',
    beforeEnter: guestGuard
  },
  {
    path: '/auth/reset-password',
    component: ResetPassword,
    name: 'ResetPassword',
    beforeEnter: guestGuard
  },
  {
    path: '/cabinet',
    component: ProjectList,
    name: 'ProjectList',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/profile',
    component: ProfilePage,
    name: 'ProfilePage',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/add',
    component: AddProject,
    name: 'AddProject',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/:projectId/edit',
    component: EditProject,
    name: 'EditProject',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/:projectId/invite',
    component: InviteUser,
    name: 'InviteUser',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/:projectId',
    component: TaskList,
    name: 'TaskList',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/:projectId/templates',
    component: TaskTemplates,
    name: 'TaskTemplates',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/priority',
    component: PriorityReport,
    name: 'PriorityReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/report',
    component: ProjectReport,
    name: 'ProjectReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/overdue',
    component: OverdueReport,
    name: 'OverdueReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/performance',
    component: TeamPerformanceReport,
    name: 'TeamPerformanceReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/priority-distribution',
    component: PriorityDistributionReport,
    name: 'PriorityDistributionReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/progress',
    component: ProgressReport,
    name: 'ProgressReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/reports/:projectId/workload',
    component: TeamWorkloadReport,
    name: 'TeamWorkloadReport',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/:projectId/kanban',
    component: KanbanBoard,
    name: 'KanbanBoard',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/projects/:projectId/roadmaps',
    component: RoadmapList,
    name: 'RoadmapList',
    beforeEnter: authGuard
  },
  {
    path: '/cabinet/roadmaps/:roadmapId/sprints',
    component: SprintList,
    name: 'SprintList',
    beforeEnter: authGuard
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
