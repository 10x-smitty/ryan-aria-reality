<template>
  <div class="flex flex-col gap-6">
    <!-- Messages -->
    <div ref="scrollEl" class="flex flex-col gap-4 overflow-y-auto" style="max-height: 500px">
      <div
        v-if="messages.length === 0"
        class="rounded-2xl bg-[var(--page-alt)] p-8 text-center text-sm text-[var(--muted)]"
      >
        No messages yet. Send a message to your agent below.
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'flex flex-col gap-1',
          msg.senderId === currentUserId ? 'items-end' : 'items-start',
        ]"
      >
        <div
          :class="[
            'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
            msg.senderId === currentUserId
              ? 'bg-[var(--ink)] text-[var(--page)]'
              : 'bg-[var(--page-alt)] text-[var(--ink)]',
          ]"
        >
          {{ msg.body }}
        </div>
        <p class="text-xs text-[var(--muted)]">
          {{ msg.senderName ?? 'Unknown' }} ·
          {{ new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}
        </p>
      </div>
    </div>

    <!-- Composer -->
    <form @submit.prevent="sendMessage" class="flex gap-3">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type a message..."
        class="flex-1 rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent-deep)] focus:ring-2 focus:ring-[var(--accent)]/20"
      />
      <button
        type="submit"
        :disabled="!newMessage.trim() || sending"
        class="rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--page)] transition hover:opacity-90 disabled:opacity-40"
      >
        Send
      </button>
    </form>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

interface Message {
  id: string;
  body: string;
  senderId: string;
  recipientId: string;
  dealId: string | null;
  readAt: string | null;
  createdAt: string;
  senderName: string | null;
}

const props = defineProps<{
  currentUserId: string;
  withUserId: string;
  dealId?: string;
}>();

const messages = ref<Message[]>([]);
const newMessage = ref('');
const sending = ref(false);
const error = ref('');
const scrollEl = ref<HTMLElement | null>(null);
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function loadMessages() {
  const params = new URLSearchParams({ withUserId: props.withUserId });
  if (props.dealId) params.set('dealId', props.dealId);
  const res = await fetch(`/api/messages?${params}`);
  if (!res.ok) return;
  const data: Message[] = await res.json();
  // Messages come back newest first, reverse for display
  messages.value = [...data].reverse();
  await nextTick();
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return;
  sending.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: props.withUserId,
        body: newMessage.value.trim(),
        dealId: props.dealId ?? null,
      }),
    });
    if (!res.ok) throw new Error('Failed to send');
    newMessage.value = '';
    await loadMessages();
  } catch {
    error.value = 'Failed to send message. Please try again.';
  } finally {
    sending.value = false;
  }
}

onMounted(async () => {
  await loadMessages();
  // Poll every 10 seconds for new messages
  pollInterval = setInterval(loadMessages, 10_000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
