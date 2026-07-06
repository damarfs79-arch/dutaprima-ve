<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  message: String,
  type: { type: String, default: 'success' },
})
</script>

<template>
  <div
    :class="[
      'inline-flex items-center gap-3 rounded-3xl px-4 py-3 shadow-lg text-sm font-medium transition',
      type === 'success' ? 'bg-emerald-600/95 text-white' : 'bg-red-600/95 text-white',
    ]"
  >
    <span>{{ message }}</span>
  </div>
</template>
