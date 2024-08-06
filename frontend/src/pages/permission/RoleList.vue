<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Roles</h1>
          <form v-if="isDeveloper" @submit.prevent="addRole" class="mt-3">
            <div class="mb-3">
              <label for="name" class="form-label">Role Name</label>
              <input v-model="newRoleName" type="text" id="name" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Add Role</button>
          </form>
          <ul class="list-group mt-3">
            <li v-for="role in roles" :key="role.id" class="list-group-item">
              <h5>{{ role.name }}</h5>
              <button v-if="isDeveloper" @click="viewPermissions(role.id)" class="btn btn-info">
                View Permissions
              </button>
            </li>
          </ul>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { useAuthStore } from '@/stores/authStore'
import Tabs from '@/components/Tabs.vue'

export default defineComponent({
  name: 'RoleList',
  components: { Tabs },
  setup() {
    const roleStore = useRoleStore()
    const authStore = useAuthStore()
    const newRoleName = ref('')

    const fetchRoles = async () => {
      await roleStore.fetchRoles()
    }

    const addRole = async () => {
      await roleStore.createRole({ name: newRoleName.value })
      newRoleName.value = ''
    }

    const viewPermissions = (roleId: number) => {
      // Implement view permissions logic here
    }

    const isDeveloper = computed(() => {
      return authStore.getUserRoles.includes('Developer')
    })

    onMounted(() => {
      fetchRoles()
      roleStore.subscribeToSocketEvents()
    })

    return { roles: roleStore.roles, newRoleName, addRole, viewPermissions, isDeveloper }
  }
})
</script>
