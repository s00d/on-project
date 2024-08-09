<template>

  <div class="comment-card card my-3">
    <div class="card-body p-2">
      <div class="d-flex flex-start">
        <div style="width: 100%">
          <h6 v-if="comment.user" class="fw-bold mb-1" style="text-align: left;" v-text="comment.user.username"></h6>
          <div class="d-flex align-items-center mb-3">
            <p class="mb-0">
              {{ new Date(comment.createdAt).toLocaleString() }}
            </p>
            <a @click.prevent="editComment" class="link-muted"><i class="fas fa-pencil-alt ms-2"></i></a>
            <a @click.prevent="deleteComment" class="link-muted"><i class="fas fa-trash-alt ms-2"></i></a>
          </div>
          <span class="mb-0" v-html="parsedContent"></span>
          <span v-if="comment.attachment" class="mt-2">
            <a :href="`/uploads/${comment.attachment}`" target="_blank">Attachment</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { type Comment, useTaskStore } from '@/stores/taskStore'

const props = defineProps<{
  comment: Comment
  projectId: string
}>()

const taskStore = useTaskStore()
const comment = ref({ ...props.comment })

const parsedContent = computed(() => marked.parse(comment.value.content))

const editComment = () => {
  // Логика редактирования комментария
}

const deleteComment = async () => {
  await taskStore.deleteComment(parseInt(props.projectId), comment.value.id)
}
</script>

<style scoped>

.link-muted { color: #aaa; } .link-muted:hover { color: #1266f1; }
</style>
