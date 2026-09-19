<script setup>
defineProps({
  size: { type: Number, default: 36 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Logo Profe Michi"
  >
    <defs>
      <filter id="sketchyLogo" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    <g filter="url(#sketchyLogo)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="56" r="30" class="fill-blush stroke-lagoon dark:stroke-cream-soft" stroke-width="4.5" />
      <path d="M28 36c-3-9-2-18 2-22 5 3 10 10 11 18" class="fill-blush stroke-lagoon dark:stroke-cream-soft" stroke-width="4.5" />
      <path d="M72 36c3-9 2-18-2-22-5 3-10 10-11 18" class="fill-blush stroke-lagoon dark:stroke-cream-soft" stroke-width="4.5" />
      <circle cx="41" cy="54" r="3" class="fill-lagoon dark:fill-cream-soft" />
      <circle cx="59" cy="54" r="3" class="fill-lagoon dark:fill-cream-soft" />
      <path d="M46 66c3 3 5 3 8 0" class="fill-none stroke-lagoon dark:stroke-cream-soft" stroke-width="3" />
      <path d="M34 60c8-4 16-4 24 0" class="fill-none stroke-rosewood/70" stroke-width="3" />
    </g>
  </svg>
</template>
