<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="project-board">
          <div class="board-header">
            <h1 class="board-title">Documents</h1>
            <button class="btn btn-primary" @click="createDocument">+ Add Document</button>
          </div>

          <div class="board-columns">
            <div class="board-column add-column" @click="createDocument">
              <button class="btn btn-link">+ Add Document</button>
            </div>
            <div
              class="board-column"
              v-for="document in documents"
              :key="document.id"
            >
              <div class="board-column-header">
                <h2 class="board-column-title" :title="document.title">{{ document.title }}</h2>
                <div class="actions">
                  <button @click.stop.prevent="editDocument(document)" class="btn btn-primary btn-sm m-0">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button v-if="document.id" @click.stop.prevent="deleteDocument(document.id)" class="btn btn-danger btn-sm m-0 ms-1">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="board-column-content">
                <p>{{ document.description || 'No description available' }}</p>
                <p><strong>File Path:</strong> <a :href="document?.filePath" target="_blank">open</a></p>
                <p><strong>Created At:</strong> {{ formatDate(document?.createdAt) }}</p>
                <p><strong>Updated At:</strong> {{ formatDate(document?.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>

    <DocumentModal v-if="isModalOpen" :document="selectedDocument" @close="closeModal" :project-id="projectId" />
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import DocumentModal from '@/components/DocumentModal.vue'
import Tabs from "@/components/Tabs.vue";

export interface Document {
  id?: number
  title: string
  description?: string
  filePath: string
  projectId: number
  userId: number
  createdAt: string
  updatedAt: string
}

const documents = ref<Document[]>([])
const selectedDocument = ref<Document | null>(null)
const isModalOpen = ref(false)

const route = useRoute()
const projectId = route.params.projectId.toString()

onMounted(async () => {
  await fetchDocuments()
})

const formatDate = (date: Date | string | undefined) => {
  return date ? new Date(date).toLocaleDateString() : ''
}

const fetchDocuments = async () => {
  try {
    const response = await axios.get(`/documents/${projectId}`)
    documents.value = response.data
  } catch (error) {
    console.error('Failed to fetch documents', error)
    // Можно добавить уведомление об ошибке
  }
}

const createDocument = () => {
  selectedDocument.value = null
  isModalOpen.value = true
}

const editDocument = (document: Document) => {
  selectedDocument.value = document
  isModalOpen.value = true
}

const deleteDocument = async (id: number) => {
  try {
    await axios.delete(`/documents/${projectId}/${id}`)
    documents.value = documents.value.filter(d => d.id !== id)
    // Можно добавить уведомление об успешном удалении
  } catch (error) {
    console.error('Failed to delete document', error)
    // Можно добавить уведомление об ошибке
  }
}

const closeModal = () => {
  isModalOpen.value = false
  fetchDocuments()
}
</script>

<style scoped>

</style>
