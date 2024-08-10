<template>
  <ModalComponent :isOpen="isOpen" :title="modalTitle" @close="close">
    <template #body>
      <div class="modal-body">
        <p>{{ modalMessage }}</p>
      </div>
    </template>
    <template #footer>
      <button type="button" class="btn btn-secondary me-2" @click="close">Cancel</button>
      <button type="button" :class="buttonClass" @click="confirm">{{ buttonText }}</button>
    </template>
  </ModalComponent>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
import ModalComponent from "@/components/ModalComponent.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  actionType: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  buttonClass: {
    type: String,
    default: 'btn btn-danger'
  },
  buttonText: {
    type: String,
    default: 'Delete'
  }
})

const emit = defineEmits(['confirm', 'close'])

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
}

const modalTitle = computed(() => {
  return `Confirm ${props.actionType}`
})

const modalMessage = computed(() => {
  return `Are you sure you want to ${props.actionType.toLowerCase()} ${props.itemName}?`
})
</script>
