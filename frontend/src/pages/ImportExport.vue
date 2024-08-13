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
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = Number(route.params.projectId)

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    await axios.post(`/import-export/${projectId}/import`, formData)
  }
}

const exportData = async () => {
  try {
    const response = await axios.get(`/import-export/${projectId}/export`, {
      responseType: 'blob' // указываем, что ответ будет в виде blob
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data.json') // задаем имя файла
    document.body.appendChild(link)
    link.click()
    link.remove() // удаляем ссылку из DOM после клика
  } catch (error) {
    console.error('Error exporting data:', error)
  }
}
</script>
