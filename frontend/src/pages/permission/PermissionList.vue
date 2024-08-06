<template>
  <div class="container mt-5">
    <h1>Permissions</h1>
    <form v-if="isDeveloper" @submit.prevent="addPermission" class="mt-3">
      <div class="mb-3">
        <label for="entity" class="form-label">Entity</label>
        <input v-model="newPermissionEntity" type="text" id="entity" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="action" class="form-label">Action</label>
        <input v-model="newPermissionAction" type="text" id="action" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary">Add Permission</button>
    </form>
    <ul class="list-group mt-3">
      <li v-for="permission in permissions" :key="permission.id" class="list-group-item">
        <h5>{{ permission.entity }} - {{ permission.action }}</h5>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoleStore } from '@/stores/roleStore';
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'PermissionList',
  setup() {
    const roleStore = useRoleStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const newPermissionEntity = ref('');
    const newPermissionAction = ref('');
    const roleId = Number(route.params.roleId);

    const fetchPermissions = async () => {
      await roleStore.fetchPermissions(roleId);
    };

    const addPermission = async () => {
      await roleStore.createPermission({
        roleId,
        entity: newPermissionEntity.value,
        action: newPermissionAction.value,
      });
      newPermissionEntity.value = '';
      newPermissionAction.value = '';
    };

    const isDeveloper = computed(() => {
      return authStore.getUserRoles.includes('Developer');
    });

    onMounted(() => {
      fetchPermissions();
      roleStore.subscribeToSocketEvents();
    });

    return { permissions: roleStore.permissions, newPermissionEntity, newPermissionAction, addPermission, isDeveloper };
  },
});
</script>
