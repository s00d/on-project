<template>
  <div class="admin-panel">
    <div class="content">
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
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";

const route = useRoute()

const projectId = ref(route.params.projectId.toString())
const userId = ref(0)

const inviteUser = async () => {
  try {
    await axios.post(`/projects/${projectId.value}/invite`, { userId: userId.value })
    alert('User invited successfully')
  } catch (error: any) {
    console.log(111, error)
    alert(`Failed to invite user: ${error.response?.data?.error}`)
  }
}
</script>
