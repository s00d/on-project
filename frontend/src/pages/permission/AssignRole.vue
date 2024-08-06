<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Assign Roles</h1>
          <form @submit.prevent="assignRole" class="mt-3">
            <div class="mb-3">
              <label for="userId" class="form-label">User ID</label>
              <input v-model="userId" type="number" id="userId" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="roleId" class="form-label">Role</label>
              <select v-model="roleId" id="roleId" class="form-control">
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="projectId" class="form-label">Project ID</label>
              <input v-model="projectId" type="number" id="projectId" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Assign Role</button>
          </form>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import Tabs from '@/components/Tabs.vue'

export default defineComponent({
  name: 'AssignRole',
  components: { Tabs },
  setup() {
    const roleStore = useRoleStore()
    const userId = ref<number | null>(null)
    const roleId = ref<number | null>(null)
    const projectId = ref<number | null>(null)

    const assignRole = async () => {
      if (userId.value && roleId.value && projectId.value) {
        await roleStore.assignRole({
          userId: userId.value,
          roleId: roleId.value,
          projectId: projectId.value
        })
        userId.value = null
        roleId.value = null
        projectId.value = null
      }
    }

    onMounted(async () => {
      await roleStore.fetchRoles()
    })

    return { userId, roleId, projectId, roles: roleStore.roles, assignRole }
  }
})
</script>
