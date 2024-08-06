<template>
  <div class="container mt-5">
    <h1>Import from GitHub Projects</h1>
    <div class="mb-3">
      <label for="repoUrl" class="form-label">GitHub Repository URL</label>
      <input v-model="repoUrl" type="text" id="repoUrl" class="form-control" />
    </div>
    <button class="btn btn-primary" @click="importFromGitHub">Import</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'GitHubImport',
  setup() {
    const repoUrl = ref('');

    const importFromGitHub = async () => {
      await axios.post('/api/mport-export/github-import', { repoUrl: repoUrl.value });
    };

    return { repoUrl, importFromGitHub };
  },
});
</script>
