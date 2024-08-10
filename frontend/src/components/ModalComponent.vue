<template>
  <div v-if="isOpen" class="modal-backdrop fade show" @click="closeModal"></div>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="modal fade"
      :class="[pos, { show: isOpen }]"
      tabindex="-1"
      role="dialog"
      style="display: block"
      @click.self="closeModal"
    >
      <div
        class="modal-dialog"
        :class="{ 'modal-dialog-aside': pos === 'fixed-left' || pos === 'fixed-right' }"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  pos: String
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }
)

const emits = defineEmits(['close'])

const closeModal = () => {
  emits('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

/* Анимация для плавного появления и скрытия модального окна */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.1s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Стили для анимации боковых модальных окон */
.modal .modal-dialog-aside {
  width: 500px;
  max-width: 80%;
  height: 100%;
  margin: 0;
  transform: translate(0);
  transition: transform 0.3s ease-in-out;
}

.modal .modal-dialog-aside .modal-content {
  height: inherit;
  border: 0;
  border-radius: 0;
}

.modal .modal-dialog-aside .modal-content .modal-body {
  overflow-y: auto;
}

.modal.fixed-left .modal-dialog-aside {
  margin-left: auto;
  transform: translateX(100%);
}

.modal.fixed-right .modal-dialog-aside {
  margin-right: auto;
  transform: translateX(-100%);
}

.modal.show .modal-dialog-aside {
  transform: translateX(0);
}

.modal.fade.show {
  display: block;
}

.modal.fade.show .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, 0);
}
</style>
