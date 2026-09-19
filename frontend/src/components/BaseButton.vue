<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' }, // md | lg
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
defineEmits(['click'])

const variants = {
  primary:
    'bg-rosewood text-cream-soft hover:bg-rosewood-dark active:scale-[0.98] shadow-soft disabled:bg-lagoon/20 disabled:text-lagoon/40 dark:disabled:bg-cream-soft/10 dark:disabled:text-cream-soft/30',
  secondary:
    'bg-misty/40 text-lagoon hover:bg-misty/60 active:scale-[0.98] dark:bg-misty-dark/30 dark:text-cream-soft dark:hover:bg-misty-dark/50',
  ghost:
    'bg-transparent text-lagoon hover:bg-lagoon/5 dark:text-cream-soft dark:hover:bg-cream-soft/10',
  danger:
    'bg-error/10 text-error hover:bg-error/20 dark:bg-error/20 dark:text-blush',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
    class="inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-none"
    :class="[
      variants[variant],
      size === 'lg' ? 'px-8 py-4 text-lg' : 'px-5 py-2.5 text-base',
    ]"
  >
    <slot />
  </button>
</template>
