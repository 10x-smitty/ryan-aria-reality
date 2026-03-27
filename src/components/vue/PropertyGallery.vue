<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import type { PropertyImage } from '../../data/site';

const props = defineProps({
  images: {
    type: Array as PropType<PropertyImage[]>,
    required: true,
  },
});

const activeIndex = ref(0);
const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0]);
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-2xl">
      <img
        :src="activeImage.src"
        :alt="activeImage.alt"
        class="h-[360px] w-full object-cover md:h-[420px]"
      />
    </div>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <button
        v-for="(image, index) in images.slice(1)"
        :key="image.src"
        type="button"
        class="overflow-hidden rounded-xl border transition"
        :class="index + 1 === activeIndex ? 'border-[var(--ink)] shadow-[var(--shadow-soft)]' : 'border-[var(--border)] opacity-80 hover:opacity-100'"
        @click="activeIndex = index + 1"
      >
        <img :src="image.src" :alt="image.alt" class="h-24 w-full object-cover md:h-28" />
      </button>
    </div>
  </div>
</template>
