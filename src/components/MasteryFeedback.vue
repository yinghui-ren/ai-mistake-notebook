<template>
  <section class="section-stack">
    <div class="section-head">
      <h2>复练后更新状态</h2>
    </div>

    <el-empty v-if="!card" description="请先从今日复习中选择一道错题。" />

    <article v-else class="feedback-card">
      <div>
        <span class="card-label">当前复练题</span>
        <h3>{{ card.questionText }}</h3>
        <p>{{ card.reviewSuggestion }}</p>
      </div>

      <div class="action-row">
        <el-button round type="success" @click="$emit('update-status', card.id, 'mastered')">
          已掌握
        </el-button>
        <el-button round type="warning" @click="$emit('update-status', card.id, 'needs_practice')">
          仍不会
        </el-button>
      </div>
    </article>
  </section>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    default: null
  }
});

defineEmits(["update-status"]);
</script>

<style scoped>
.section-stack {
  display: grid;
  gap: 22px;
}

.section-head h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 28px;
}

.feedback-card {
  display: grid;
  gap: 18px;
  max-width: 760px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-soft);
  padding: 22px;
}

.card-label {
  display: block;
  margin-bottom: 8px;
  color: var(--app-accent);
  font-size: 13px;
  font-weight: 900;
}

.feedback-card h3 {
  margin: 0 0 10px;
  color: var(--app-text);
  font-size: 20px;
  line-height: 1.5;
}

.feedback-card p {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.7;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-row :deep(.el-button) {
  border-radius: 999px;
  font-weight: 800;
}
</style>
