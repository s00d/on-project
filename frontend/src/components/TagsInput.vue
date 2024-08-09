<template>
  <div class="bootstrap-tagsinput">
    <div class="d-inline-block">
      <span v-for="(tag, index) in modelValue" :key="index" class="badge bg-primary mr-2">
        {{ tag }}
        <span class="ml-2" @click="removeTag(index)" style="cursor: pointer;">&times;</span>
      </span>
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
</script>

<style>
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
