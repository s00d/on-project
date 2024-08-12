<template>
  <div class="modal">
    <div class="modal-content">
      <h2>{{ document ? 'Edit Document' : 'Create Document' }}</h2>

      <form @submit.prevent="saveDocument">
        <input v-model="form.title" placeholder="Title" required />
        <textarea v-model="form.description" placeholder="Description"></textarea>
        <input type="file" @change="handleFileUpload" />

        <button type="submit">{{ document ? 'Save' : 'Create' }}</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import type {Document} from "@/pages/documents/List.vue";

// Типизация для входящих свойств (props)
interface DocumentProps {
  id?: number;
  title: string;
  description?: string;
  filePath?: string;
  userId: number;
}

const props = defineProps<{
  projectId: string,
  document?: Document | null;
}>()

const emit = defineEmits(['close'])

const form = ref({
  title: props.document?.title || '',
  description: props.document?.description || '',
  filePath: '' as string | File
})

// Обработка загрузки файла
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    form.value.filePath = files[0];
  }
}

// Сохранение документа
const saveDocument = async () => {
  const formData = new FormData();
  formData.append('title', form.value.title);
  formData.append('description', form.value.description);

  if (form.value.filePath && form.value.filePath instanceof File) {
    formData.append('file', form.value.filePath);
  }

  try {
    if (props.document) {
      await axios.put(`/documents/${props.projectId}/${props.document.id!}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      await axios.post(`/documents/${props.projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    emit('close');
  } catch (error) {
    console.error('Failed to save document', error);
    // Можно добавить уведомление об ошибке
  }
}
</script>

<style scoped>
.modal {
  /* Пример стилей для модального окна */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
}

input,
textarea {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
