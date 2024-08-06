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

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useTaskStore } from '@/store';
import { marked } from 'marked';

export default defineComponent({
  name: 'CommentCard',
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const taskStore = useTaskStore();
    const comment = ref({ ...props.comment });

    const parsedContent = ref(marked(comment.value.content));

    const editComment = () => {
      // Implement edit comment logic here
    };

    const deleteComment = async () => {
      await taskStore.deleteComment(comment.value.id);
    };

    return { comment, parsedContent, editComment, deleteComment };
  },
});
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
