<template>
  <div class="admin-panel">
    <Tabs>
      <div class="container mt-5">
        <h1>Invite User to Project</h1>
        <form @submit.prevent="inviteUser" class="mt-3">
          <div class="mb-3">
            <label for="userId" class="form-label">User ID</label>
            <input
              v-model="userId"
              type="number"
              id="userId"
              class="form-control"
              placeholder="User ID"
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="form-control"
              placeholder="Email"
            />
          </div>
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input
              v-model="username"
              type="text"
              id="username"
              class="form-control"
              placeholder="Username"
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ disabled: !userId && !email && !username }"
          >
            Invite User
          </button>
        </form>
        <hr class="mt-5" />
        <h2>Invited Users</h2>
        <table class="table table-striped mt-3">
          <thead>
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Username</th>
              <th scope="col" v-if="project?.ownerId === authUserId">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in invitedUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td v-if="project?.ownerId === authUserId">
                <button
                  v-if="user.id !== authUserId"
                  @click="deActiveUser(user.id)"
                  class="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import { useRoute } from 'vue-router'
import { useAuthStore, type User } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAlertStore } from '@/stores/alertStore'

const route = useRoute()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const authUserId = computed(() => authStore.getUserId)

const projectId = ref(route.params.projectId.toString())
const userId = ref('')
const email = ref('')
const username = ref('')
const invitedUsers = ref<User[]>([])

const project = computed(() => {
  return projectStore.project
})

const fetchInvitedUsers = async () => {
  invitedUsers.value = await projectStore.fetchUsers(parseInt(projectId.value))
}

const inviteUser = async () => {
  try {
    await axios.post(`/projects/${projectId.value}/invite`, {
      userId: userId.value,
      email: email.value,
      username: username.value
    })
    useAlertStore().setAlert('User invited successfully', 'success')
    fetchInvitedUsers() // Refresh the list after inviting
  } catch (error: any) {
    useAlertStore().setAlert(error.response?.data?.message, 'danger')
  }
}

const deActiveUser = async (id: number) => {
  try {
    await axios.delete(`/projects/${projectId.value}/users/${id}`)
    useAlertStore().setAlert('User removed successfully', 'success')
    fetchInvitedUsers() // Refresh the list after removing
  } catch (error: any) {
    useAlertStore().setAlert(error.response?.data?.message, 'danger')
  }
}

onMounted(async () => {
  await projectStore.fetchProject(parseInt(projectId.value))
  await fetchInvitedUsers()
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
