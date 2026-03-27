<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    county: string | null;
    type: string;
    status: string;
    listPrice: number;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    yearBuilt: number | null;
    description: string | null;
    isFeatured: boolean;
    mlsNumber: string | null;
  };
}>();

const isEdit = !!props.property;
const saving = ref(false);
const error = ref('');

const form = ref({
  address: props.property?.address ?? '',
  city: props.property?.city ?? '',
  state: props.property?.state ?? 'IL',
  zip: props.property?.zip ?? '',
  county: props.property?.county ?? '',
  type: props.property?.type ?? 'single_family',
  status: props.property?.status ?? 'Active',
  listPrice: props.property?.listPrice ?? 0,
  bedrooms: props.property?.bedrooms ?? null,
  bathrooms: props.property?.bathrooms ?? null,
  sqft: props.property?.sqft ?? null,
  yearBuilt: props.property?.yearBuilt ?? null,
  description: props.property?.description ?? '',
  isFeatured: props.property?.isFeatured ?? false,
  mlsNumber: props.property?.mlsNumber ?? '',
});

async function submit() {
  saving.value = true;
  error.value = '';
  try {
    const url = isEdit ? `/api/properties/${props.property!.id}` : '/api/properties';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form.value,
        listPrice: Number(form.value.listPrice),
        bedrooms: form.value.bedrooms ? Number(form.value.bedrooms) : null,
        bathrooms: form.value.bathrooms ? Number(form.value.bathrooms) : null,
        sqft: form.value.sqft ? Number(form.value.sqft) : null,
        yearBuilt: form.value.yearBuilt ? Number(form.value.yearBuilt) : null,
        county: form.value.county || null,
        mlsNumber: form.value.mlsNumber || null,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const id = isEdit ? props.property!.id : data.id;
    window.location.href = `/crm/properties/${id}/`;
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

    <!-- Address -->
    <div class="surface-card space-y-6 rounded-3xl p-8">
      <h2 class="font-display text-[1.7rem]">Location</h2>
      <div class="grid gap-5 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="field-label">Street Address</label>
          <input v-model="form.address" required class="field-input" placeholder="742 Evergreen Terrace" />
        </div>
        <div>
          <label class="field-label">City</label>
          <input v-model="form.city" required class="field-input" placeholder="Joliet" />
        </div>
        <div>
          <label class="field-label">ZIP Code</label>
          <input v-model="form.zip" required class="field-input" placeholder="60432" />
        </div>
        <div>
          <label class="field-label">State</label>
          <input v-model="form.state" class="field-input" placeholder="IL" />
        </div>
        <div>
          <label class="field-label">County</label>
          <select v-model="form.county" class="field-input">
            <option value="">— Select county —</option>
            <option>Will</option>
            <option>Cook</option>
            <option>DuPage</option>
            <option>Kankakee</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Listing details -->
    <div class="surface-card space-y-6 rounded-3xl p-8">
      <h2 class="font-display text-[1.7rem]">Listing Details</h2>
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label class="field-label">Property Type</label>
          <select v-model="form.type" class="field-input">
            <option value="single_family">Single Family</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="multi_family">Multi Family</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label class="field-label">Status</label>
          <select v-model="form.status" class="field-input">
            <option>Active</option>
            <option>Coming Soon</option>
            <option>Under Contract</option>
            <option>Closed</option>
            <option>Expired</option>
            <option>Withdrawn</option>
          </select>
        </div>
        <div>
          <label class="field-label">List Price ($)</label>
          <input v-model="form.listPrice" type="number" min="0" required class="field-input" placeholder="500000" />
        </div>
        <div>
          <label class="field-label">Bedrooms</label>
          <input v-model="form.bedrooms" type="number" min="0" class="field-input" placeholder="4" />
        </div>
        <div>
          <label class="field-label">Bathrooms</label>
          <input v-model="form.bathrooms" type="number" min="0" step="0.5" class="field-input" placeholder="2.5" />
        </div>
        <div>
          <label class="field-label">Sq. Footage</label>
          <input v-model="form.sqft" type="number" min="0" class="field-input" placeholder="2400" />
        </div>
        <div>
          <label class="field-label">Year Built</label>
          <input v-model="form.yearBuilt" type="number" min="1800" class="field-input" placeholder="2005" />
        </div>
        <div>
          <label class="field-label">MLS Number</label>
          <input v-model="form.mlsNumber" class="field-input" placeholder="12345678" />
        </div>
      </div>
      <div>
        <label class="field-label">Description</label>
        <textarea v-model="form.description" rows="4" class="field-input resize-y" placeholder="Property description..."></textarea>
      </div>
      <label class="flex cursor-pointer items-center gap-3 text-sm">
        <input v-model="form.isFeatured" type="checkbox" class="size-4 accent-[var(--accent)]" />
        <span class="text-[var(--ink)]">Feature on landing page</span>
      </label>
    </div>

    <div class="flex gap-3">
      <button
        type="submit"
        :disabled="saving"
        class="rounded-xl bg-[var(--ink)] px-8 py-3 text-sm font-semibold text-[var(--page)] transition hover:opacity-90 disabled:opacity-50"
      >
        {{ saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Property' }}
      </button>
      <a
        :href="isEdit ? `/crm/properties/${property!.id}/` : '/crm/properties/'"
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
