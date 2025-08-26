<template>
  <div v-if="visible" class="ltips-modal">
    <div class="ltips-backdrop" @click="close"></div>
    <div class="ltips-content" role="dialog" aria-modal="true">
      <div class="ltips-header">
        <h3>New Tips for You</h3>
        <button class="ltips-close" @click="close" aria-label="Close">×</button>
      </div>

      <div v-if="tips && tips.length" class="ltips-body">
        <div class="ltips-item">
          <div class="ltips-meta">
            <span class="ltips-chip">{{ current.category || "general" }}</span>
            <span v-if="current.priority" class="ltips-chip alt">{{
              current.priority
            }}</span>
          </div>
          <h4 class="ltips-title">{{ current.title }}</h4>
          <p class="ltips-text">{{ current.content }}</p>
          <details v-if="current.detailedContent" class="ltips-details">
            <summary>Read more</summary>
            <p>{{ current.detailedContent }}</p>
          </details>
        </div>
      </div>

      <div class="ltips-footer">
        <div class="ltips-steps">{{ index + 1 }} / {{ tips.length }}</div>
        <div class="ltips-actions">
          <button class="ltips-btn" @click="next">
            {{ index < tips.length - 1 ? "Next" : "Done" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  tips: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "seen"]);

const index = ref(0);

const current = computed(() => props.tips?.[index.value] || {});

function close() {
  emit(
    "seen",
    props.tips.map((t) => t.id)
  );
  emit("close");
  index.value = 0;
}

function next() {
  if (index.value < props.tips.length - 1) {
    index.value++;
  } else {
    close();
  }
}
</script>

<style scoped>
.ltips-modal {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: grid;
  place-items: center;
}
.ltips-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.ltips-content {
  position: relative;
  background: #fff;
  width: min(92vw, 560px);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.ltips-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.ltips-close {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}
.ltips-body {
  padding: 16px;
}
.ltips-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.ltips-chip {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
}
.ltips-chip.alt {
  background: #ecfeff;
  color: #0891b2;
}
.ltips-title {
  margin: 4px 0 8px;
  font-size: 18px;
}
.ltips-text {
  color: #374151;
  line-height: 1.5;
}
.ltips-details {
  margin-top: 8px;
}
.ltips-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
.ltips-btn {
  background: #22c55e;
  color: #fff;
  border: 0;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.ltips-steps {
  font-size: 12px;
  color: #6b7280;
}
:global(body.dark-mode) .ltips-content {
  background: #23272f;
  color: #f3f4f6;
}
:global(body.dark-mode) .ltips-footer {
  border-color: #3b3f47;
}
</style>
