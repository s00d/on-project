<template>
  <div class="admin-panel">
    <Tabs>
      <div class="container mt-5">
        <h1>Invite User to Project</h1>
        <form @submit.prevent="inviteUser" class="mt-3">
          <div class="mb-3">
            <label for="userId" class="form-label">User ID</label>
            <input v-model="userId" type="number" id="userId" class="form-control" placeholder="User ID" />
          </div>
          <button type="submit" class="btn btn-primary" :class="{disabled: userId === 0}">Invite User</button>
        </form>
        <hr class="mt-5" />
        <h2>Invited Users</h2>
        <table class="table table-striped mt-3">
          <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">Username</th>
            <th scope="col">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in invitedUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>
              <button v-if="user.id !== authUserId" @click="deActiveUser(user.id)" class="btn btn-danger btn-sm">Remove</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from 'vue-router'
import { useAuthStore, type User } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import {useAlertStore} from "@/stores/alertStore";

const route = useRoute()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const authUserId = computed(() => authStore.getUserId)

const projectId = ref(route.params.projectId.toString())
const userId = ref(0)
const invitedUsers = ref<User[]>([])

const fetchInvitedUsers = async () => {
  invitedUsers.value = await projectStore.fetchUsers(parseInt(projectId.value))
}

const inviteUser = async () => {
  try {
    await axios.post(`/projects/${projectId.value}/invite`, { userId: userId.value })
    useAlertStore().setAlert('User invited successfully', 'success')
    fetchInvitedUsers()  // Refresh the list after inviting
  } catch (error: any) {
    useAlertStore().setAlert(`Failed to invite user: ${error.response?.data?.error}`, 'danger')
  }
}

const deActiveUser = async (id: number) => {
  try {
    await axios.delete(`/projects/${projectId.value}/users/${id}`)
    useAlertStore().setAlert('User removed successfully', 'success')
    fetchInvitedUsers()  // Refresh the list after removing
  } catch (error: any) {
    useAlertStore().setAlert(`Failed to remove user: ${error.response?.data?.error}`, 'danger')
  }
}

onMounted(() => {
  fetchInvitedUsers();
})
</script>

<style scoped>
.admin-panel {
  padding: 20px;
}
.content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
