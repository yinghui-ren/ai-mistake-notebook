<template>
  <section class="section-stack">
    <div class="section-head">
      <h2>{{ filterCopy.title }}</h2>
    </div>

    <div class="filter-tabs">
      <button
        type="button"
        :class="{ active: activeFilter === 'pending' }"
        @click="$emit('change-filter', 'pending')"
      >
        待复习
      </button>
      <button
        type="button"
        :class="{ active: activeFilter === 'needs_practice' }"
        @click="$emit('change-filter', 'needs_practice')"
      >
        仍需练习
      </button>
      <button
        type="button"
        :class="{ active: activeFilter === 'mastered' }"
        @click="$emit('change-filter', 'mastered')"
      >
        已掌握
      </button>
    </div>

    <el-empty
      v-if="items.length === 0"
      :description="filterCopy.empty"
    />

    <div v-else class="review-list">
      <article
        v-for="item in items"
        :key="item.id"
        class="review-card"
        :class="{ active: selectedId === item.id }"
      >
        <div class="review-card-top">
          <div>
            <h3>{{ item.questionText }}</h3>
            <p>{{ item.knowledgePoint }} · {{ item.mistakeTypeLabel }}</p>
            <p class="recommendation-line">{{ recommendationText(item) }}</p>
          </div>
          <div class="review-card-side">
            <el-tag :type="tagType(item.masteryStatus)">
              {{ statusText(item.masteryStatus) }}
            </el-tag>
            <el-button round plain size="small" @click="openDetail(item)">
              查看详情
            </el-button>
          </div>
        </div>

        <el-collapse
          v-if="activeFilter !== 'mastered'"
          v-model="activeNames"
          class="review-collapse"
          @change="handleChange"
        >
          <el-collapse-item title="复习反馈" :name="item.id">
            <div class="feedback-content">
              <p>复习这道题后，选择当前掌握状态。</p>
              <div class="feedback-actions">
                <el-button round type="success" @click="$emit('update-status', item.id, 'mastered')">
                  已掌握
                </el-button>
                <el-button round type="warning" @click="$emit('update-status', item.id, 'needs_practice')">
                  仍不会
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </article>
    </div>

    <el-drawer
      v-model="detailVisible"
      title="错题详情"
      size="460px"
      class="mistake-detail-drawer"
    >
      <div v-if="selectedDetail" class="detail-panel">
        <section class="detail-block">
          <h3>题目内容</h3>
          <div class="detail-field">
            <span>原题题干</span>
            <p>{{ selectedDetail.questionText }}</p>
          </div>
          <div class="detail-field">
            <span>我的错误答案</span>
            <p>{{ selectedDetail.studentAnswer }}</p>
          </div>
        </section>

        <section class="detail-block">
          <h3>AI 归纳</h3>
          <div class="detail-tags">
            <el-tag type="success">{{ selectedDetail.knowledgePoint }}</el-tag>
            <el-tag :type="tagType(selectedDetail.masteryStatus)">
              {{ selectedDetail.mistakeTypeLabel }}
            </el-tag>
          </div>
          <div class="detail-field">
            <span>错因分析</span>
            <p>{{ selectedDetail.aiReason }}</p>
          </div>
        </section>

        <section class="detail-block">
          <h3>复习建议</h3>
          <p class="suggestion-text">{{ selectedDetail.reviewSuggestion }}</p>
        </section>

        <section class="detail-block">
          <h3>推荐原因</h3>
          <p class="suggestion-text">{{ recommendationText(selectedDetail) }}</p>
        </section>

        <section class="detail-block">
          <h3>当前状态</h3>
          <div class="status-line">
            <el-tag :type="tagType(selectedDetail.masteryStatus)">
              {{ statusText(selectedDetail.masteryStatus) }}
            </el-tag>
            <span>{{ formatCreatedAt(selectedDetail.createdAt) }}</span>
          </div>
        </section>

        <div class="detail-actions">
          <el-button round type="success" @click="markFromDetail('mastered')">
            标记已掌握
          </el-button>
          <el-button round type="warning" @click="markFromDetail('needs_practice')">
            标记仍需练习
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { getRecommendationReason, masteryStatusLabels } from "../data/mockMistakes";

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: String,
    default: ""
  },
  activeFilter: {
    type: String,
    default: "pending"
  }
});

const emit = defineEmits(["select", "update-status", "change-filter"]);

const activeNames = ref([]);
const detailVisible = ref(false);
const selectedDetail = ref(null);

const filterCopy = computed(() => {
  const copyMap = {
    pending: {
      title: "待复习错题",
      empty: "暂无待复习错题。"
    },
    needs_practice: {
      title: "仍需练习错题",
      empty: "暂无仍需练习错题。"
    },
    mastered: {
      title: "已掌握错题",
      empty: "暂无已掌握错题。"
    }
  };

  return copyMap[props.activeFilter] || copyMap.pending;
});

function handleChange(value) {
  activeNames.value = value;
}

function statusText(status) {
  return masteryStatusLabels[status] || status;
}

function tagType(status) {
  if (status === "mastered") return "success";
  if (status === "needs_practice") return "warning";
  return "info";
}

function recommendationText(item) {
  return item.recommendationReason || getRecommendationReason(item);
}

function openDetail(item) {
  selectedDetail.value = item;
  detailVisible.value = true;
  emit("select", item);
}

function markFromDetail(masteryStatus) {
  if (!selectedDetail.value) return;

  const nextDetail = {
    ...selectedDetail.value,
    masteryStatus
  };

  selectedDetail.value = {
    ...nextDetail,
    recommendationReason: getRecommendationReason(nextDetail)
  };

  emit("update-status", selectedDetail.value.id, masteryStatus);
}

function formatCreatedAt(dateLike) {
  if (!dateLike) return "创建时间未知";

  return `创建于 ${new Date(dateLike).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}
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

.review-list {
  display: grid;
  gap: 12px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tabs button {
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface-soft);
  color: var(--app-muted);
  padding: 9px 18px;
  font-weight: 800;
  cursor: pointer;
}

.filter-tabs button.active {
  border-color: var(--app-accent);
  background: var(--app-accent-soft);
  color: var(--app-accent);
}

.review-card {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-soft);
  padding: 18px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.review-card.active {
  border-color: var(--app-accent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.review-card:hover {
  border-color: #3a5558;
}

.review-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.review-card-side {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  flex-direction: column;
  gap: 10px;
}

.review-card h3 {
  margin: 0 0 8px;
  color: var(--app-text);
  font-size: 17px;
  line-height: 1.5;
}

.review-card p {
  margin: 0;
  color: var(--app-muted);
}

.recommendation-line {
  margin-top: 8px !important;
  color: var(--app-accent) !important;
  font-size: 13px;
  line-height: 1.6;
}

.review-collapse {
  border-top: 1px solid var(--app-border);
  border-bottom: 0;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
  --el-collapse-border-color: transparent;
}

.review-collapse :deep(.el-collapse-item__header) {
  height: 42px;
  border-bottom: 0;
  color: var(--app-accent);
  font-weight: 800;
}

.review-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: 0;
}

.review-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 0;
  color: var(--app-muted);
}

.feedback-content {
  display: grid;
  gap: 12px;
}

.feedback-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-panel {
  display: grid;
  gap: 18px;
}

.detail-block {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-soft);
  padding: 16px;
}

.detail-block h3 {
  margin: 0 0 14px;
  color: var(--app-text);
  font-size: 16px;
}

.detail-field {
  display: grid;
  gap: 6px;
  margin-top: 12px;
}

.detail-field:first-of-type {
  margin-top: 0;
}

.detail-field span,
.status-line span {
  color: var(--app-muted);
  font-size: 13px;
}

.detail-field p,
.suggestion-text {
  margin: 0;
  color: var(--app-text);
  line-height: 1.7;
}

.detail-tags,
.status-line,
.detail-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-tags {
  margin-bottom: 12px;
}

.detail-actions {
  position: sticky;
  bottom: 0;
  border-top: 1px solid var(--app-border);
  background: #111417;
  padding: 14px 0 0;
}

:global(.mistake-detail-drawer.el-drawer) {
  background: #15181b;
  color: var(--app-text);
}

:global(.mistake-detail-drawer .el-drawer__header) {
  margin-bottom: 0;
  border-bottom: 1px solid var(--app-border);
  color: var(--app-text);
  padding-bottom: 18px;
}

:global(.mistake-detail-drawer .el-drawer__body) {
  padding: 20px;
}

@media (max-width: 640px) {
  .review-card-top {
    flex-direction: column;
  }

  .review-card-side {
    width: 100%;
    align-items: flex-start;
  }

  .feedback-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  .detail-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }
}
</style>
