<script setup lang="ts">
import { ref } from 'vue';

const location = ref('Springfield, IL');
const propertyType = ref('All Types');
const priceRange = ref('$200K - $1M');
const bedrooms = ref('3+');

const locations = ['Springfield, IL', 'Westside', 'Lakeview', 'Downtown'];
const propertyTypes = ['All Types', 'Single Family', 'Condo', 'Townhouse', 'Luxury'];
const priceRanges = ['$200K - $1M', '$1M - $2M', '$2M - $4M', '$4M+'];
const bedroomOptions = ['3+', '2+', '4+', '5+'];

function submitSearch() {
  window.location.href = '/crm/properties/';
}
</script>

<template>
  <form
    class="glass-panel flex flex-col overflow-hidden rounded-[1.75rem] text-[var(--ink)] lg:flex-row"
    @submit.prevent="submitSearch"
  >
    <label class="flex min-w-0 flex-1 flex-col gap-1 px-6 py-5">
      <span class="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Location</span>
      <select
        v-model="location"
        class="bg-transparent text-sm font-medium outline-none"
      >
        <option v-for="option in locations" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <div class="hidden h-12 w-px self-center bg-[var(--border)] lg:block"></div>
    <label class="flex min-w-0 flex-1 flex-col gap-1 px-6 py-5">
      <span class="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Property Type</span>
      <select
        v-model="propertyType"
        class="bg-transparent text-sm font-medium outline-none"
      >
        <option v-for="option in propertyTypes" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <div class="hidden h-12 w-px self-center bg-[var(--border)] lg:block"></div>
    <label class="flex min-w-0 flex-1 flex-col gap-1 px-6 py-5">
      <span class="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Price Range</span>
      <select
        v-model="priceRange"
        class="bg-transparent text-sm font-medium outline-none"
      >
        <option v-for="option in priceRanges" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <div class="hidden h-12 w-px self-center bg-[var(--border)] lg:block"></div>
    <label class="flex min-w-0 flex-1 flex-col gap-1 px-6 py-5">
      <span class="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Bedrooms</span>
      <select
        v-model="bedrooms"
        class="bg-transparent text-sm font-medium outline-none"
      >
        <option v-for="option in bedroomOptions" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <button
      class="m-3 inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-7 py-4 text-sm font-semibold text-black hover:bg-[var(--accent-deep)]"
      type="submit"
    >
      Search Properties
    </button>
  </form>
</template>
