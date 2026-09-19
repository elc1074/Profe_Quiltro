<script setup>
defineProps({
  size: { type: Number, default: 220 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Profe Michi, a mascote gata segurando um peixinho"
  >
    <defs>
      <filter id="sketchy" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>

    <g filter="url(#sketchy)" stroke-linecap="round" stroke-linejoin="round">
      <!-- shadow -->
      <ellipse cx="160" cy="292" rx="78" ry="10" class="fill-lagoon/10 dark:fill-black/30" />

      <!-- tail -->
      <path
        d="M228 250c26-4 44-28 40-54-3-20-20-32-36-28"
        class="fill-none stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />

      <!-- body -->
    
      <path
        d="M96 300c-8-44 2-92 18-118 20-32 54-46 76-30 24 18 30 58 22 96-6 30-16 52-20 62-30 10-72 8-96-10Z"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />
    

      <!-- tabby patches on body -->
      <path d="M118 210c14-6 30-4 40 6" class="fill-none stroke-rosewood/70" stroke-width="5" />
      <path d="M112 236c16-4 34 0 46 10" class="fill-none stroke-rosewood/70" stroke-width="5" />
      <path d="M150 168c10 6 16 16 16 26" class="fill-none stroke-sage/80" stroke-width="5" />

      <!-- front paw holding fish -->
      <path
        d="M96 246c-10 8-16 20-14 32 2 14 14 22 28 20 10-2 18-10 20-20"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />
      <ellipse cx="104" cy="278" rx="14" ry="10" class="fill-blush/80 dark:fill-rosewood/40" />

      <!-- back paw -->
      <path
        d="M186 292c8 6 20 8 30 2 10-6 14-16 10-26"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />

      <!-- fish -->
      <g transform="translate(38 214) rotate(-8)">
        <path
          d="M10 40c14-24 44-38 70-34 20 3 34 18 36 34-2 16-16 31-36 34-26 4-56-10-70-34Z"
          class="fill-misty dark:fill-misty-dark stroke-lagoon dark:stroke-cream-soft"
          stroke-width="6"
        />
        <path d="M6 40 L-16 24 L-14 40 L-16 56 Z" class="fill-misty dark:fill-misty-dark stroke-lagoon dark:stroke-cream-soft" stroke-width="6" />
        <circle cx="60" cy="32" r="4" class="fill-lagoon dark:fill-cream-soft" />
        <path d="M52 50c8 4 18 4 26 0" class="fill-none stroke-lagoon/70 dark:stroke-cream-soft/70" stroke-width="4" />
      </g>

      <!-- head -->
      <circle
        cx="176"
        cy="128"
        r="66"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />

      <!-- ears -->
      <path
        d="M132 84c-6-20-4-40 4-48 10 6 22 22 24 40"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />
      <path
        d="M222 84c8-20 8-40 0-48-10 6-24 22-26 40"
        class="fill-cream-soft dark:fill-lagoon-light stroke-lagoon dark:stroke-cream-soft"
        stroke-width="6"
      />
      <path d="M140 78c2-10 8-20 14-24" class="fill-none stroke-blush" stroke-width="6" />
      <path d="M214 78c-2-10-8-20-14-24" class="fill-none stroke-blush" stroke-width="6" />

      <!-- tabby patch on head -->
      <path d="M150 96c10-8 26-10 36-4" class="fill-none stroke-rosewood/70" stroke-width="5" />

      <!-- eyes -->
      <circle cx="156" cy="126" r="5" class="fill-lagoon dark:fill-cream-soft" />
      <circle cx="200" cy="126" r="5" class="fill-lagoon dark:fill-cream-soft" />

      <!-- blush cheeks -->
      <ellipse cx="142" cy="148" rx="12" ry="8" class="fill-blush/80 dark:fill-rosewood/40" />
      <ellipse cx="212" cy="148" rx="12" ry="8" class="fill-blush/80 dark:fill-rosewood/40" />

      <!-- nose & mouth -->
      <path d="M172 142c2 3 6 3 8 0" class="fill-none stroke-lagoon dark:stroke-cream-soft" stroke-width="4" />
      <path d="M176 145v4" class="fill-none stroke-lagoon dark:stroke-cream-soft" stroke-width="4" />
      <path d="M176 149c-5 5-11 6-16 4M176 149c5 5 11 6 16 4" class="fill-none stroke-lagoon dark:stroke-cream-soft" stroke-width="4" />

      <!-- whiskers -->
      <path d="M118 132h-24M118 140h-26M234 132h24M234 140h26" class="stroke-lagoon/60 dark:stroke-cream-soft/60" stroke-width="3" />
    </g>
  </svg>
</template>
