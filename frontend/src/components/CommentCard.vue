<template>
  <div class="comment-card card mt-3">
    <div class="card-body position-relative">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title mb-1">{{ comment.User.username }}</h5>
          <small class="text-muted">{{ new Date(comment.createdAt).toLocaleString() }}</small>
        </div>
        <div class="comment-actions">
          <button @click="editComment" class="btn btn-link p-0"><i class="fas fa-edit"></i></button>
          <button @click="deleteComment" class="btn btn-link p-0 text-danger">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <p class="card-text mt-2" v-html="parsedContent"></p>
      <p v-if="comment.attachment">
        <a :href="`/uploads/${comment.attachment}`" target="_blank">Attachment</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { type Comment as CommentOriginal, useTaskStore } from '@/stores/taskStore'
import type { User } from '@/stores/authStore'

export interface Comment extends CommentOriginal {
  User: User
}

const props = defineProps<{
  comment: Comment
  projectId: string
}>()
const taskStore = useTaskStore()
const comment = ref({ ...props.comment })

const parsedContent = computed(() => marked.parse(comment.value.content))

const editComment = () => {
  // Implement edit comment logic here
}

const deleteComment = async () => {
  await taskStore.deleteComment(parseInt(props.projectId), comment.value.id)
}
</script>

<style>
@import '@fortawesome/fontawesome-free/css/all.css';

.comment-card {
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.comment-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.comment-actions button {
  display: flex;
  align-items: center;
}
</style>
