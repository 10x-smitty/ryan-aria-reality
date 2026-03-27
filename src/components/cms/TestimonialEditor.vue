<script setup lang="ts">
import { ref } from 'vue';

type Testimonial = {
  id: string;
  name: string;
  quote: string;
  initials: string;
  sortOrder: number;
  isActive: boolean;
};

const props = defineProps<{ initialTestimonials: Testimonial[] }>();
const items = ref<Testimonial[]>(JSON.parse(JSON.stringify(props.initialTestimonials)));
const saving = ref<string | null>(null);
const error = ref('');

function blank(): Testimonial {
  return { id: '', name: '', quote: '', initials: '', sortOrder: items.value.length, isActive: true };
}
const editing = ref<Testimonial | null>(null);

function startEdit(t: Testimonial) {
  editing.value = JSON.parse(JSON.stringify(t));
}
function startNew() {
  editing.value = blank();
}
function cancelEdit() {
  editing.value = null;
}

async function saveEdit() {
  if (!editing.value) return;
  saving.value = editing.value.id || 'new';
  error.value = '';
  try {
    const method = editing.value.id ? 'PUT' : 'POST';
    const res = await fetch('/api/cms/testimonials', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing.value),
    });
    if (!res.ok) throw new Error(await res.text());
    const { id } = await res.json();
    // Update local list
    const idx = items.value.findIndex((t) => t.id === editing.value!.id);
    if (idx >= 0) {
      items.value[idx] = { ...editing.value!, id };
    } else {
      items.value.push({ ...editing.value!, id });
    }
    editing.value = null;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    saving.value = null;
  }
}

async function remove(t: Testimonial) {
  if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
  saving.value = t.id;
  try {
    const res = await fetch('/api/cms/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id }),
    });
    if (!res.ok) throw new Error(await res.text());
    items.value = items.value.filter((x) => x.id !== t.id);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    saving.value = null;
  }
}
</script>

<template>
  <div class="surface-card space-y-6 rounded-3xl p-8">
    <div class="flex items-center justify-between gap-4">
      <h2 class="font-display text-[1.7rem]">Testimonials</h2>
      <button
        @click="startNew"
        class="rounded-xl bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--page)] transition hover:opacity-90"
      >
        + Add
      </button>
    </div>

    <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

    <!-- Edit form -->
    <div v-if="editing" class="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--page-alt)] p-6">
      <h3 class="text-sm font-semibold">{{ editing.id ? 'Edit' : 'New' }} Testimonial</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label">Name</label>
          <input v-model="editing.name" class="field-input" placeholder="Jane & John Smith" />
        </div>
        <div>
          <label class="field-label">Initials</label>
          <input v-model="editing.initials" class="field-input" maxlength="2" placeholder="JS" />
        </div>
        <div class="md:col-span-2">
          <label class="field-label">Quote</label>
          <textarea v-model="editing.quote" rows="3" class="field-input resize-y"></textarea>
        </div>
        <div>
          <label class="field-label">Sort Order</label>
          <input v-model="editing.sortOrder" type="number" class="field-input" />
        </div>
        <div class="flex items-center gap-3 pt-5">
          <input v-model="editing.isActive" type="checkbox" id="is-active" class="size-4 accent-[var(--accent)]" />
          <label for="is-active" class="text-sm text-[var(--ink)]">Active (show on site)</label>
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button
          @click="saveEdit"
          :disabled="!!saving"
          class="rounded-xl bg-[var(--ink)] px-6 py-2 text-sm font-semibold text-[var(--page)] disabled:opacity-50"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
        <button @click="cancelEdit" class="rounded-xl border border-[var(--border)] px-6 py-2 text-sm">Cancel</button>
      </div>
    </div>

    <!-- List -->
    <div class="divide-y divide-[var(--border)]">
      <div v-for="t in items" :key="t.id" class="flex items-start gap-4 py-4">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--page-alt)] text-xs font-semibold text-[var(--ink)]">
          {{ t.initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[var(--ink)]">{{ t.name }}</p>
          <p class="mt-0.5 text-xs leading-5 text-[var(--muted)] line-clamp-2">{{ t.quote }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span :class="t.isActive ? 'bg-green-100 text-green-700' : 'bg-[var(--page-alt)] text-[var(--muted)]'" class="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {{ t.isActive ? 'Active' : 'Hidden' }}
          </span>
          <button @click="startEdit(t)" class="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--page-alt)]">Edit</button>
          <button @click="remove(t)" :disabled="saving === t.id" class="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
        </div>
      </div>
      <p v-if="items.length === 0" class="py-8 text-center text-sm text-[var(--muted)]">No testimonials yet.</p>
    </div>
  </div>
</template>

<style scoped>
.field-label { display: block; margin-bottom: 0.375rem; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
.field-input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--border); background: transparent; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--ink); outline: none; }
.field-input:focus { border-color: var(--accent-deep); }
</style>
