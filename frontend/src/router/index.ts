import {createRouter, createWebHistory} from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';
import TwoFactorAuth from '../pages/auth/TwoFactorAuth.vue';
import RequestPasswordReset from '../pages/auth/RequestPasswordReset.vue';
import ResetPassword from '../pages/auth/ResetPassword.vue';

import AdminPanel from '../pages/AdminPanel.vue';

import Profile from '../pages/Profile.vue';
import ProjectList from '../pages/project/ProjectList.vue';
import AddProject from '../pages/project/AddProject.vue';
import EditProject from '../pages/project/EditProject.vue';
import KanbanBoard from '../pages/project/KanbanBoard.vue';
import RoadmapList from '../pages/project/RoadmapList.vue';
import SprintList from '../pages/project/SprintList.vue';
import TaskList from '../pages/project/TaskList.vue';

import InviteUser from '../pages/InviteUser.vue';
import RoleList from '../pages/permission/RoleList.vue';
import PermissionList from '../pages/permission/PermissionList.vue';
import AssignRole from '../pages/permission/AssignRole.vue';

import ProjectReport from '../pages/report/ProjectReport.vue';
import PriorityReport from '../pages/report/PriorityReport.vue';
import OverdueReport from '../pages/report/OverdueReport.vue';
import TeamPerformanceReport from '../pages/report/TeamPerformanceReport.vue';
import PriorityDistributionReport from '../pages/report/PriorityDistributionReport.vue';
import ProgressReport from '../pages/report/ProgressReport.vue';
import TeamWorkloadReport from '../pages/report/TeamWorkloadReport.vue';

import Calendar from '../pages/Calendar.vue';
import ImportExport from '../pages/ImportExport.vue';
import TaskTemplates from '../pages/TaskTemplates.vue';

import {useAuthStore} from '@/stores/authStore';

import type {NavigationGuardNext, RouteLocationNormalized} from 'vue-router';

const routes = [
  {path: '/', component: Home},
  {path: '/login', component: Login},
  {path: '/register', component: Register},
  {
    path: '/2fa',
    component: TwoFactorAuth,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        next('/login');
      } else {
        next();
      }
    }
  },
  {path: '/request-password-reset', component: RequestPasswordReset},
  {path: '/reset-password', component: ResetPassword},


  {
    path: '/admin',
    component: AdminPanel,
    children: [
      {
        path: '/',
        component: AdminPanel,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {path: '/profile', component: Profile},
      {
        path: '/projects',
        component: ProjectList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/projects/add',
        component: AddProject,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/projects/:id/edit',
        component: EditProject,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/projects/invite',
        component: InviteUser,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/projects/tasks',
        component: TaskList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/priority',
        component: PriorityReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/report',
        component: ProjectReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/overdue',
        component: OverdueReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/performance',
        component: TeamPerformanceReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },

      {
        path: '/reports/:projectId/priority-distribution',
        component: PriorityDistributionReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/progress',
        component: ProgressReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/reports/:projectId/workload',
        component: TeamWorkloadReport,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },


      {
        path: '/kanban',
        component: KanbanBoard,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/projects/:projectId/roadmaps',
        component: RoadmapList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/roadmaps/:roadmapId/sprints',
        component: SprintList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/roles',
        component: RoleList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/roles/:roleId/permissions',
        component: PermissionList,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated) {
            next('/login');
          } else {
            next();
          }
        }
      },
      {
        path: '/assign-role',
        component: AssignRole,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
          const authStore = useAuthStore();
          if (!authStore.isAuthenticated || !authStore.getUserRoles.includes('Project Creator')) {
            next('/login');
          } else {
            next();
          }
        }
      }

    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
