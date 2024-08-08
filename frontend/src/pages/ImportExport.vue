<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Import/Export Data</h1>
          <div class="mb-3">
            <label for="importFile" class="form-label">Import Data</label>
            <input type="file" id="importFile" class="form-control" @change="handleFileImport" />
          </div>
          <button class="btn btn-primary" @click="exportData">Export Data</button>
          <GitHubImport />
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import GitHubImport from '../components/GitHubImport.vue'
import Tabs from '@/components/Tabs.vue'

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    await axios.post('/api/import', formData)
  }
}

const exportData = async () => {
  const response = await axios.get('/api/import-export/export', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'data.json')
  document.body.appendChild(link)
  link.click()
}
</script>
