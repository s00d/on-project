<template>
  <div class="container mt-5">
    <h1>Invite User to Project</h1>
    <form @submit.prevent="inviteUser" class="mt-3">
      <div class="mb-3">
        <label for="projectId" class="form-label">Project ID</label>
        <input v-model="projectId" type="text" id="projectId" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="userId" class="form-label">User ID</label>
        <input v-model="userId" type="text" id="userId" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary">Invite User</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'InviteUser',
  setup() {
    const projectId = ref('');
    const userId = ref('');

    const inviteUser = async () => {
      try {
        await axios.post('/projects/invite', { projectId: projectId.value, userId: userId.value });
        alert('User invited successfully');
      } catch (error) {
        alert('Failed to invite user');
      }
    };

    return { projectId, userId, inviteUser };
  }
});
</script>
