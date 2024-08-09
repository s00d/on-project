<template>
  <div class="bootstrap-tagsinput">
    <div class="d-inline-block">
      <template v-for="(tag, index) in modelValue" :key="index">
        <div
          v-if="dragOverIndex === index"
          class="placeholder"
          @dragover.prevent
          @drop.prevent="onDrop(index)"
        ></div>
        <span
          class="badge bg-primary mr-2"
          :class="{ 'dragging': draggingIndex === index }"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragend="onDragEnd"
          @dragover.prevent="onDragOver(index)"
        >
          {{ tag }}
          <span class="ml-2" @click="removeTag(index)" style="cursor: pointer;">&times;</span>
        </span>
      </template>
      <!-- Добавляем placeholder в конец списка, если перетаскиваем в конец -->
      <div
        v-if="dragOverIndex === modelValue.length"
        class="placeholder"
        @dragover.prevent
        @drop.prevent="onDrop(modelValue.length)"
      ></div>
    </div>
    <input
      v-model="newTag"
      @keyup.enter.stop.prevent="addTag"
      type="text"
      class="form-control d-inline-block"
      :placeholder="placeholder"
      style="border: none; box-shadow: none; outline: none; background-color: transparent; padding: 0 6px; margin: 0; width: 100%; max-width: inherit;"
    />
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Add a tag',
  },
});

const emit = defineEmits(['update:modelValue']);

const newTag = ref('');
let draggedIndex = -1;
const draggingIndex = ref(-1);
const dragOverIndex = ref(-1);

const addTag = () => {
  if (newTag.value.trim()) {
    emit('update:modelValue', [...props.modelValue, newTag.value.trim()]);
    newTag.value = '';
  }
};

const removeTag = (index: number) => {
  const updatedTags = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', updatedTags);
};

const onDragStart = (index: number) => {
  draggedIndex = index;
  draggingIndex.value = index;
};

const onDragEnd = () => {
  resetDragState();
};

const onDragOver = (index: number) => {
  if (dragOverIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const onDrop = (index: number) => {
  if (draggedIndex !== -1 && draggedIndex !== index) {
    const updatedTags = [...props.modelValue];
    const [movedTag] = updatedTags.splice(draggedIndex, 1);
    updatedTags.splice(index, 0, movedTag);
    emit('update:modelValue', updatedTags);
  }
  resetDragState();
};

const resetDragState = () => {
  draggingIndex.value = -1;
  dragOverIndex.value = -1;
  draggedIndex = -1;
};
</script>

<style scoped>
.bootstrap-tagsinput {
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  display: inline-block;
  padding: 4px 6px;
  color: #555;
  vertical-align: middle;
  border-radius: 4px;
  width: 100%;
  line-height: 22px;
  cursor: text;
}

.bootstrap-tagsinput .badge {
  margin: 2px 0;
  padding: 5px 8px;
  cursor: move;
  transition: all 0.2s ease;
}

.bootstrap-tagsinput .badge.dragging {
  opacity: 0.5;
  background-color: #d3d3d3;
}

.bootstrap-tagsinput .placeholder {
  display: inline-block;
  width: auto;
  min-width: 50px;
  height: 32px;
  background-color: rgba(0, 123, 255, 0.2);
  border: 2px dashed #007bff;
  margin: 2px 0;
  vertical-align: middle;
}

.bootstrap-tagsinput .badge span {
  margin-left: 8px;
  cursor: pointer;
}

.bootstrap-tagsinput .form-control {
  border: none;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  padding: 0 6px;
  margin: 0;
  width: auto;
  max-width: inherit;
}
</style>
