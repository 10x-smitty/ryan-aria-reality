<script setup lang="ts">
import { computed } from 'vue';
import {
  ArrowUpDown,
  Award,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Facebook,
  Filter,
  House,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Plus,
  Search,
  Zap,
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
    strokeWidth?: number;
  }>(),
  {
    size: 16,
    strokeWidth: 1.8,
  }
);

const icons = {
  'arrow-up-down': ArrowUpDown,
  award: Award,
  check: Check,
  'chevron-right': ChevronRight,
  'credit-card': CreditCard,
  download: Download,
  facebook: Facebook,
  filter: Filter,
  house: House,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
  plus: Plus,
  search: Search,
  zap: Zap,
} as const;

const icon = computed(() => icons[props.name.toLowerCase() as keyof typeof icons] ?? House);
</script>

<template>
  <component :is="icon" :size="size" :stroke-width="strokeWidth" v-bind="$attrs" />
</template>
