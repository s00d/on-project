<template>
  <div class="task-card card mt-3">
    <div class="card-body">
      <h5 class="card-title">{{ task.title }}</h5>
      <p class="card-text">{{ task.description }}</p>
      <p>Status: {{ task.status }}</p>
      <p v-if="task.assignee">Assigned to: {{ task.assignee.username }}</p>
      <p v-if="task.label">Label: <span :style="{ backgroundColor: task.label.color }">{{ task.label.name }}</span></p>
      <p v-if="task.dueDate">Due Date: {{ new Date(task.dueDate).toLocaleDateString() }}</p>
      <div v-if="canEditTask" class="mb-3">
        <label for="status" class="form-label">Change Status</label>
        <select v-model="task.status" @change="updateTaskStatus" class="form-select">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <button v-if="canEditTask" @click="editTask" class="btn btn-secondary">Edit</button>
      <button v-if="canDeleteTask" @click="deleteTask" class="btn btn-danger">Delete</button>
      <div class="mt-3">
        <h5>Comments</h5>
        <CommentCard v-for="comment in comments" :key="comment.id" :comment="comment" />
        <form @submit.prevent="addComment" class="mt-3">
          <div class="mb-3">
            <label for="content" class="form-label">New Comment</label>
            <textarea v-model="newCommentContent" id="content" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label for="attachment" class="form-label">Attachment</label>
            <input type="file" id="attachment" class="form-control" @change="handleFileUpload" />
          </div>
          <button type="submit" class="btn btn-primary">Add Comment</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import CommentCard from './CommentCard.vue';

export default defineComponent({
  name: 'TaskCard',
  components: {
    CommentCard,
  },
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const taskStore = useTaskStore();
    const authStore = useAuthStore();
    const task = ref({ ...props.task });
    const comments = ref([]);
    const newCommentContent = ref('');
    const attachment = ref(null);

    const updateTaskStatus = async () => {
      await taskStore.updateTask(task.value.id, { status: task.value.status });
    };

    const editTask = () => {
      // Implement edit task logic here
    };

    const deleteTask = async () => {
      await taskStore.deleteTask(task.value.id);
    };

    const fetchComments = async () => {
      await taskStore.fetchComments(task.value.id);
      comments.value = taskStore.getComments;
    };

    const addComment = async () => {
      await taskStore.addComment({ content: newCommentContent.value, taskId: task.value.id, userId: authStore.getUser.id }, attachment.value);
      newCommentContent.value = '';
      attachment.value = null;
      await fetchComments();
    };

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        attachment.value = target.files[0];
      }
    };

    onMounted(() => {
      fetchComments();
      taskStore.subscribeToSocketEvents();
    });

    const canEditTask = computed(() => authStore.getUserRoles.includes('Developer') || authStore.getUser.id === task.value.assigneeId);
    const canDeleteTask = computed(() => authStore.getUserRoles.includes('Developer'));

    return { task, comments, newCommentContent, attachment, updateTaskStatus, editTask, deleteTask, addComment, handleFileUpload, canEditTask, canDeleteTask };
  },
});
</script>

<style>
.task-card {
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
</style>
