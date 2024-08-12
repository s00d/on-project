<template>
  <div class="container mt-5">
    <h1>Импорт из проектов GitHub</h1>

    <div class="mb-3">
      <label for="organization" class="form-label">organization</label>
      <input v-model="organization" type="text" id="organization" class="form-control" />
    </div>

    <div class="mb-3">
      <label for="projectNumber" class="form-label">projectNumber</label>
      <input v-model="projectNumber" type="number" id="projectNumber" class="form-control" />
    </div>

    <div class="mb-3">
      <label for="token" class="form-label">GitHub Token</label>
      <input v-model="token" type="text" id="token" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Сопоставление пользователей (GitHub Username -> User ID)</label>
      <div v-for="(mapping, index) in userMappings" :key="index" class="input-group mb-2">
        <input v-model="mapping.githubUsername" type="text" class="form-control" placeholder="GitHub Username" />
        <input v-model="mapping.userId" type="number" class="form-control" placeholder="User ID" />
        <button class="btn btn-danger" @click="removeMapping(index)">Удалить</button>
      </div>
      <button class="btn btn-secondary" @click="addMapping">Добавить сопоставление</button>
    </div>

    <button class="btn btn-primary" @click="importFromGitHub">Импортировать</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = Number(route.params.projectId)

const organization = ref('on-org')
const projectNumber = ref(1)
const token = ref('')
const userMappings = reactive([{ githubUsername: '', userId: null as number | null }])

const addMapping = () => {
  userMappings.push({ githubUsername: '', userId: null })
}

const removeMapping = (index: number) => {
  userMappings.splice(index, 1)
}

const importFromGitHub = async () => {
  try {
    const userMappingObject = userMappings.reduce((acc, mapping) => {
      if (mapping.githubUsername && mapping.userId) {
        acc[mapping.githubUsername] = mapping.userId
      }
      return acc
    }, {} as { [key: string]: number })

    await axios.post(`/import-export/${projectId}/github-import`, {
      token: token.value,
      organization: organization.value,
      projectNumber: projectNumber.value,
      userMapping: userMappingObject
    })

    alert('Импорт успешно завершен!')
  } catch (error) {
    console.error('Ошибка при импорте из GitHub', error)
    alert('Ошибка импорта. Подробности в консоли.')
  }
}
</script>
