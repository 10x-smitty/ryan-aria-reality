<script setup lang="ts">
import { ref } from 'vue';

type PropertyOption = { id: string; label: string };
type FeaturedItem = { propertyId: string; image: string; sortOrder: number };

const props = defineProps<{
  initialItems: FeaturedItem[];
  propertyOptions: PropertyOption[];
}>();

const items = ref<FeaturedItem[]>(JSON.parse(JSON.stringify(props.initialItems)));
const saving = ref(false);
const saved = ref(false);
const error = ref('');

function addSlot() {
  items.value.push({ propertyId: '', image: '', sortOrder: items.value.length });
}
function removeSlot(i: number) {
  items.value.splice(i, 1);
  items.value.forEach((item, idx) => (item.sortOrder = idx));
}

async function save() {
  saving.value = true;
  saved.value = false;
  error.value = '';
  try {
    const payload = items.value
      .filter((item) => item.propertyId)
      .map((item, i) => ({
        propertyId: item.propertyId,
        manualData: item.image ? { image: item.image } : undefined,
        sortOrder: i,
      }));
    const res = await fetch('/api/cms/featured', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    saved.value = true;
    setTimeout(() => (saved.value = false), 3000);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="surface-card space-y-6 rounded-3xl p-8">
    <div class="flex items-center justify-between gap-4">
      <h2 class="font-display text-[1.7rem]">Featured Listings</h2>
      <div class="flex items-center gap-3">
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <button @click="save" :disabled="saving" class="rounded-xl bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--page)] disabled:opacity-50">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>

    <p class="text-sm text-[var(--muted)]">Choose up to 3 properties to feature on the landing page.</p>

    <div class="space-y-4">
      <div v-for="(item, i) in items" :key="i" class="grid gap-4 rounded-2xl border border-[var(--border)] p-5 md:grid-cols-[1fr_1fr_auto]">
        <div>
          <label class="field-label">Property</label>
          <select v-model="item.propertyId" class="field-input">
            <option value="">— Select property —</option>
            <option v-for="opt in propertyOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">Hero Image URL</label>
          <input v-model="item.image" type="url" class="field-input" placeholder="https://..." />
        </div>
        <button @click="removeSlot(i)" class="mt-5 self-start rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50">Remove</button>
      </div>
      <p v-if="items.length === 0" class="py-6 text-center text-sm text-[var(--muted)]">No featured listings. Add one below.</p>
    </div>

    <button
      v-if="items.length < 3"
      @click="addSlot"
      class="rounded-xl border border-[var(--border)] px-5 py-2 text-sm text-[var(--ink)] hover:bg-[var(--page-alt)]"
    >
      + Add slot
    </button>
  </div>
</template>

<style scoped>
.field-label { display: block; margin-bottom: 0.375rem; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
.field-input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--border); background: transparent; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--ink); outline: none; }
.field-input:focus { border-color: var(--accent-deep); }
</style>
