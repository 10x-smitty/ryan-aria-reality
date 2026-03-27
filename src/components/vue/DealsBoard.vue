<script setup lang="ts">
import { ref } from 'vue';

type Deal = {
  id: string;
  title: string;
  stage: string;
  dealValue: number | null;
  contactName: string | null;
  propertyAddress: string | null;
};

type Lane = {
  stage: string;
  deals: Deal[];
};

const props = defineProps<{ lanes: Lane[] }>();
const localLanes = ref<Lane[]>(props.lanes.map((l) => ({ ...l, deals: [...l.deals] })));

const STAGES = ['New Lead', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed', 'Lost'];

function fmt(n: number | null) {
  if (!n) return '—';
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
}

async function moveStage(deal: Deal, direction: 1 | -1) {
  const idx = STAGES.indexOf(deal.stage);
  const next = STAGES[idx + direction];
  if (!next) return;

  const res = await fetch(`/api/deals/${deal.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: next }),
  });
  if (!res.ok) return;

  // Move card optimistically between lanes
  const fromLane = localLanes.value.find((l) => l.stage === deal.stage);
  const toLane = localLanes.value.find((l) => l.stage === next);
  if (fromLane && toLane) {
    fromLane.deals = fromLane.deals.filter((d) => d.id !== deal.id);
    deal.stage = next;
    toLane.deals.push(deal);
  }
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-5">
    <article
      v-for="lane in localLanes"
      :key="lane.stage"
      class="cream-card rounded-[1.1rem] p-4"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-[var(--ink)]">{{ lane.stage }}</h3>
        <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {{ lane.deals.length }}
        </span>
      </div>

      <div class="space-y-3">
        <article
          v-for="deal in lane.deals"
          :key="deal.id"
          class="surface-card rounded-xl p-3"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#5c4033]">{{ fmt(deal.dealValue) }}</span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-semibold text-[var(--ink)]">{{ deal.title }}</h4>
            <p v-if="deal.contactName" class="text-xs leading-5 text-[var(--muted)]">{{ deal.contactName }}</p>
            <p v-if="deal.propertyAddress" class="text-xs leading-5 text-[var(--muted)]">{{ deal.propertyAddress }}</p>
          </div>
          <div class="mt-3 flex gap-1">
            <button
              v-if="STAGES.indexOf(deal.stage) > 0"
              @click="moveStage(deal, -1)"
              class="rounded-md px-2 py-1 text-[10px] text-[var(--muted)] hover:bg-[var(--page-alt)] hover:text-[var(--ink)]"
              title="Move back"
            >← Back</button>
            <button
              v-if="STAGES.indexOf(deal.stage) < STAGES.length - 1"
              @click="moveStage(deal, 1)"
              class="rounded-md px-2 py-1 text-[10px] text-[var(--muted)] hover:bg-[var(--page-alt)] hover:text-[var(--ink)]"
              title="Advance stage"
            >Advance →</button>
          </div>
        </article>

        <p v-if="lane.deals.length === 0" class="py-4 text-center text-xs text-[var(--muted)]">
          No deals
        </p>
      </div>
    </article>
  </div>
</template>
