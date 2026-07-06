<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ya, lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const close = () => emit('update:modelValue', false)
const handleConfirm = () => {
  emit('confirm')
  close()
}
const handleCancel = () => {
  emit('cancel')
  close()
}
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div class="px-6 py-5 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
        <div class="px-6 py-5">
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button @click="handleCancel" class="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
