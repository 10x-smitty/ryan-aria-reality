<script setup lang="ts">
import { ref } from 'vue';

type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'url' }
  | { key: string; label: string; type: 'list'; hint?: string }
  | { key: string; label: string; type: 'toggle'; hint?: string };

const props = defineProps<{
  slug: string;
  title: string;
  initialContent: Record<string, any>;
  fields: Field[];
}>();

const content = ref<Record<string, any>>(JSON.parse(JSON.stringify(props.initialContent)));
const saving = ref(false);
const saved = ref(false);
const error = ref('');

// Helpers for list fields
function listVal(key: string): string[] {
  return Array.isArray(content.value[key]) ? content.value[key] : [];
}
function listStr(key: string): string {
  return listVal(key).join('\n');
}
function updateList(key: string, val: string) {
  content.value[key] = val.split('\n').map((s) => s.trim()).filter(Boolean);
}

async function save() {
  saving.value = true;
  saved.value = false;
  error.value = '';
  try {
    const res = await fetch(`/api/cms/${props.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content.value),
    });
    if (!res.ok) throw new Error(await res.text());
    saved.value = true;
    setTimeout(() => (saved.value = false), 3000);
  } catch (e: any) {
    error.value = e.message || 'Save failed.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="surface-card space-y-6 rounded-3xl p-8">
    <div class="flex items-center justify-between gap-4">
      <h2 class="font-display text-[1.7rem]">{{ title }}</h2>
      <div class="flex items-center gap-3">
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <button
          @click="save"
          :disabled="saving"
          class="rounded-xl bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--page)] transition hover:opacity-90 disabled:opacity-50"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <template v-for="field in fields" :key="field.key">
        <div :class="field.type === 'textarea' || field.type === 'list' ? 'md:col-span-2' : ''">
          <label class="field-label">{{ field.label }}</label>
          <textarea
            v-if="field.type === 'textarea'"
            v-model="content[field.key]"
            rows="4"
            class="field-input resize-y"
          ></textarea>
          <textarea
            v-else-if="field.type === 'list'"
            :value="listStr(field.key)"
            @input="updateList(field.key, ($event.target as HTMLTextAreaElement).value)"
            rows="4"
            class="field-input resize-y font-mono text-xs"
            :placeholder="(field as any).hint ?? 'One item per line'"
          ></textarea>
          <button
            v-else-if="field.type === 'toggle'"
            type="button"
            role="switch"
            :aria-checked="!!content[field.key]"
            @click="content[field.key] = !content[field.key]"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              content[field.key] ? 'bg-[var(--accent-deep)]' : 'bg-[var(--border)]',
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200',
                content[field.key] ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
          <input
            v-else
            v-model="content[field.key]"
            :type="field.type"
            class="field-input"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.field-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}
.field-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: transparent;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus {
  border-color: var(--accent-deep);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}
</style>
