<template>
  <div class="comment-card card mt-3">
    <div class="card-body">
      <h5 class="card-title">{{ comment.user.username }}</h5>
      <p class="card-text" v-html="parsedContent"></p>
      <p v-if="comment.attachment">
        <a :href="`/uploads/${comment.attachment}`" target="_blank">Attachment</a>
      </p>
      <button @click="editComment" class="btn btn-secondary">Edit</button>
      <button @click="deleteComment" class="btn btn-danger">Delete</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import { useTaskStore } from '@/stores/taskStore';

interface Comment {
  id: number;
  content: string;
  attachment?: string;
  user: {
    username: string;
  };
}

const props = defineProps<{ comment: Comment }>();
const taskStore = useTaskStore();
const comment = ref({ ...props.comment });

const parsedContent = computed(() => marked(comment.value.content));

const editComment = () => {
  // Implement edit comment logic here
};

const deleteComment = async () => {
  await taskStore.deleteComment(comment.value.id);
};

</script>

<style>
.comment-card {
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
</style>
