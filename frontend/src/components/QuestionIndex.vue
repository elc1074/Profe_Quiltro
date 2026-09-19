<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  questions: { type: Array, required: true },
  recordings: { type: Object, required: true },
  currentIndex: { type: Number, required: true },
})
defineEmits(['select'])

const { t } = useI18n()

function stateFor(index, id) {
  if (index === props.currentIndex) return 'current'
  return props.recordings[id]?.status === 'recorded' ? 'answered' : 'unanswered'
}
</script>

<template>
  <nav :aria-label="t('quiz.index')" class="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
    <button
      v-for="(q, index) in questions"
      :key="q.id"
      type="button"
      @click="$emit('select', index)"
      class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-semibold transition"
      :class="{
        'border-rosewood bg-rosewood text-cream-soft shadow-soft': stateFor(index, q.id) === 'current',
        'border-sage/60 bg-sage/15 text-sage-dark dark:text-sage-light': stateFor(index, q.id) === 'answered',
        'border-dashed border-lagoon/25 bg-transparent text-lagoon/50 dark:border-cream-soft/25 dark:text-cream-soft/50':
          stateFor(index, q.id) === 'unanswered',
      }"
      :aria-current="stateFor(index, q.id) === 'current' ? 'step' : undefined"
      :title="t(`quiz.state.${stateFor(index, q.id)}`)"
    >
      {{ index + 1 }}
      <span
        v-if="stateFor(index, q.id) === 'answered'"
        class="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-sage text-[9px] text-cream-soft"
      >✓</span>
    </button>
  </nav>
</template>
