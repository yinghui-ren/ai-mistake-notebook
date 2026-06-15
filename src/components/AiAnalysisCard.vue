<template>
  <section class="section-stack">
    <div class="section-head">
      <h2>错因归纳结果</h2>
    </div>

    <el-empty v-if="!card && !loading" description="还没有分析结果，请先输入错题。" />

    <el-skeleton v-else-if="loading" :rows="5" animated />

    <article v-else class="analysis-card">
      <div class="card-top">
        <div>
          <span class="card-label">题目</span>
          <el-input
            v-model="editableCard.questionText"
            type="textarea"
            :rows="2"
            placeholder="请确认或修正题目内容"
          />
        </div>
        <el-tag effect="dark">{{ editableCard.mistakeTypeLabel }}</el-tag>
      </div>

      <dl class="analysis-grid">
        <div>
          <dt>我的错误答案</dt>
          <dd>
            <el-input
              v-model="editableCard.studentAnswer"
              type="textarea"
              :rows="2"
              placeholder="请确认或修正你的错误答案"
            />
          </dd>
        </div>
        <div>
          <dt>知识点</dt>
          <dd>
            <el-input
              v-model="editableCard.knowledgePoint"
              placeholder="请输入或修正知识点"
            />
          </dd>
        </div>
        <div>
          <dt>错因类型</dt>
          <dd>
            <el-select
              v-model="editableCard.mistakeType"
              placeholder="请选择错因类型"
              @change="syncMistakeTypeLabel"
            >
              <el-option
                v-for="item in mistakeTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </dd>
        </div>
        <div>
          <dt>AI 错因解释</dt>
          <dd>
            <el-input
              v-model="editableCard.aiReason"
              type="textarea"
              :rows="3"
              placeholder="请确认或修正错因解释"
            />
          </dd>
        </div>
        <div>
          <dt>复习建议</dt>
          <dd>
            <el-input
              v-model="editableCard.reviewSuggestion"
              type="textarea"
              :rows="3"
              placeholder="请确认或修正复习建议"
            />
          </dd>
        </div>
      </dl>

      <div class="action-row">
        <el-button round type="primary" @click="$emit('confirm', editableCard)">
          生成错题卡并加入今日复习
        </el-button>
      </div>
    </article>
  </section>
</template>

<script setup>
import { reactive, watch } from "vue";
import { getMistakeTypeLabel, mistakeTypes } from "../data/mockMistakes";

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(["confirm"]);

const editableCard = reactive({});

watch(
  () => props.card,
  (card) => {
    Object.keys(editableCard).forEach((key) => {
      delete editableCard[key];
    });

    if (card) {
      Object.assign(editableCard, card);
    }
  },
  { immediate: true }
);

function syncMistakeTypeLabel() {
  editableCard.mistakeTypeLabel = getMistakeTypeLabel(editableCard.mistakeType);
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

.analysis-card {
  display: grid;
  gap: 22px;
  max-width: 860px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-soft);
  padding: 22px;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.card-top > div {
  flex: 1;
}

.card-label {
  display: block;
  margin-bottom: 8px;
  color: var(--app-accent);
  font-size: 13px;
  font-weight: 900;
}

.analysis-grid {
  display: grid;
  gap: 14px;
  margin: 0;
}

.analysis-grid div {
  border-top: 1px solid var(--app-border);
  padding-top: 14px;
}

.analysis-grid dt {
  margin-bottom: 6px;
  color: var(--app-muted);
  font-size: 13px;
  font-weight: 800;
}

.analysis-grid dd {
  margin: 0;
  color: var(--app-text);
  line-height: 1.7;
}

.analysis-grid :deep(.el-input__wrapper),
.analysis-grid :deep(.el-select__wrapper),
.analysis-grid :deep(.el-textarea__inner),
.card-top :deep(.el-textarea__inner) {
  border: 1px solid var(--app-border);
  background-color: #15181b !important;
  box-shadow: none;
}

.analysis-grid :deep(.el-input__inner),
.analysis-grid :deep(.el-textarea__inner),
.analysis-grid :deep(.el-select__placeholder),
.analysis-grid :deep(.el-select__selected-item),
.card-top :deep(.el-textarea__inner) {
  color: var(--app-text);
}

.analysis-grid :deep(.el-textarea__inner),
.card-top :deep(.el-textarea__inner) {
  resize: vertical;
  caret-color: var(--app-accent);
}

.analysis-grid :deep(.el-textarea__inner::placeholder),
.card-top :deep(.el-textarea__inner::placeholder) {
  color: #6f7a84;
}

.analysis-grid :deep(.el-select) {
  width: 100%;
}

.action-row {
  display: flex;
  justify-content: flex-end;
}

.action-row :deep(.el-button) {
  border-radius: 999px;
  font-weight: 800;
}
</style>
