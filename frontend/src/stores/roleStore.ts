import { defineStore } from 'pinia';
import axios from 'axios';
import { socket } from '@/plugins/socketPlugin';
import { useAlertStore } from './alertStore';

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  roleId: number;
  entity: string;
  action: string;
}

interface RoleState {
  roles: Role[];
  permissions: Permission[];
}

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    permissions: [],
  }),
  actions: {
    async fetchRoles() {
      try {
        const response = await axios.get('/roles');
        this.roles = response.data;
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch roles', 'danger');
      }
    },
    async createRole(role: { name: string }) {
      try {
        const response = await axios.post('/roles', role);
        this.roles.push(response.data);
        useAlertStore().setAlert('Role created successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to create role', 'danger');
      }
    },
    async assignRole(userRole: { userId: number, roleId: number, projectId: number }) {
      try {
        const response = await axios.post('/roles/assign', userRole);
        useAlertStore().setAlert('Role assigned successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to assign role', 'danger');
      }
    },
    async fetchPermissions(roleId: number) {
      try {
        const response = await axios.get(`/roles/${roleId}/permissions`);
        this.permissions = response.data;
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch permissions', 'danger');
      }
    },
    async createPermission(permission: { roleId: number, entity: string, action: string }) {
      try {
        const response = await axios.post('/roles/permissions', permission);
        this.permissions.push(response.data);
        useAlertStore().setAlert('Permission created successfully', 'success');
      } catch (error) {
        useAlertStore().setAlert('Failed to create permission', 'danger');
      }
    },
    subscribeToSocketEvents() {
      socket.on('role:create', (role) => {
        this.roles.push(role);
      });
      socket.on('userRole:create', (userRole) => {
        // Handle user role creation if needed
      });
      socket.on('permission:create', (permission) => {
        this.permissions.push(permission);
      });
    }
  },
});
