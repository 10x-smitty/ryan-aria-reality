<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  contact?: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    leadScore: number | null;
    notes: string | null;
  };
}>();

const isEdit = !!props.contact;
const saving = ref(false);
const error = ref('');

const form = ref({
  fullName: props.contact?.fullName ?? '',
  email: props.contact?.email ?? '',
  phone: props.contact?.phone ?? '',
  status: props.contact?.status ?? 'New Lead',
  source: props.contact?.source ?? '',
  budgetMin: props.contact?.budgetMin ?? null,
  budgetMax: props.contact?.budgetMax ?? null,
  leadScore: props.contact?.leadScore ?? null,
  notes: props.contact?.notes ?? '',
});

async function submit() {
  saving.value = true;
  error.value = '';
  try {
    const url = isEdit ? `/api/contacts/${props.contact!.id}` : '/api/contacts';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form.value,
        email: form.value.email || null,
        phone: form.value.phone || null,
        source: form.value.source || null,
        notes: form.value.notes || null,
        budgetMin: form.value.budgetMin ? Number(form.value.budgetMin) : null,
        budgetMax: form.value.budgetMax ? Number(form.value.budgetMax) : null,
        leadScore: form.value.leadScore ? Number(form.value.leadScore) : null,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const id = isEdit ? props.contact!.id : data.id;
    window.location.href = `/crm/contacts/${id}/`;
  } catch (e: any) {
    error.value = e.message || 'Something went wrong.';
    saving.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-8">
    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="surface-card space-y-6 rounded-3xl p-8">
      <h2 class="font-display text-[1.7rem]">Contact Information</h2>
      <div class="grid gap-5 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="field-label">Full Name</label>
          <input v-model="form.fullName" required class="field-input" placeholder="Jane Smith" />
        </div>
        <div>
          <label class="field-label">Email</label>
          <input v-model="form.email" type="email" class="field-input" placeholder="jane@email.com" />
        </div>
        <div>
          <label class="field-label">Phone</label>
          <input v-model="form.phone" type="tel" class="field-input" placeholder="+1 (555) 123-4567" />
        </div>
        <div>
          <label class="field-label">Status</label>
          <select v-model="form.status" class="field-input">
            <option>New Lead</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Active Client</option>
            <option>Under Contract</option>
            <option>Won</option>
            <option>Lost</option>
          </select>
        </div>
        <div>
          <label class="field-label">Source</label>
          <select v-model="form.source" class="field-input">
            <option value="">— Select source —</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Zillow</option>
            <option>Realtor.com</option>
            <option>Social</option>
            <option>Cold Call</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label class="field-label">Budget Min ($)</label>
          <input v-model="form.budgetMin" type="number" min="0" class="field-input" placeholder="400000" />
        </div>
        <div>
          <label class="field-label">Budget Max ($)</label>
          <input v-model="form.budgetMax" type="number" min="0" class="field-input" placeholder="700000" />
        </div>
        <div>
          <label class="field-label">Lead Score (0–100)</label>
          <input v-model="form.leadScore" type="number" min="0" max="100" class="field-input" placeholder="75" />
        </div>
        <div class="md:col-span-2">
          <label class="field-label">Notes</label>
          <textarea v-model="form.notes" rows="4" class="field-input resize-y" placeholder="Client preferences, timeline, pre-approval status..."></textarea>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <button
        type="submit"
        :disabled="saving"
        class="rounded-xl bg-[var(--ink)] px-8 py-3 text-sm font-semibold text-[var(--page)] transition hover:opacity-90 disabled:opacity-50"
      >
        {{ saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Contact' }}
      </button>
      <a
        :href="isEdit ? `/crm/contacts/${contact!.id}/` : '/crm/contacts/'"
        class="rounded-xl border border-[var(--border)] px-8 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--page-alt)]"
      >
        Cancel
      </a>
    </div>
  </form>
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
