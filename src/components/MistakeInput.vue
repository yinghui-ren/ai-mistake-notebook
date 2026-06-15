<template>
  <section class="section-stack">
    <div class="section-head">
      <h2>输入一道刚做错的题</h2>
    </div>

    <el-form label-position="top" class="input-form" @submit.prevent>
      <el-form-item label="题干">
        <el-input
          v-model="questionText"
          type="textarea"
          :rows="5"
          placeholder="例如：已知函数 f(x)=x^2-2x，求其单调区间。"
        />
      </el-form-item>

      <el-form-item label="我的错误答案">
        <el-input
          v-model="studentAnswer"
          type="textarea"
          :rows="3"
          placeholder="例如：我认为它在全体实数上递增。"
        />
      </el-form-item>

      <div class="action-row">
        <el-button round plain disabled>拍照上传（演示入口）</el-button>
        <el-button round type="primary" :loading="loading" @click="submitMistake">
          AI 分析
        </el-button>
      </div>
    </el-form>
  </section>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["submit"]);

const questionText = ref("已知函数 f(x)=x^2-2x，求其单调区间。");
const studentAnswer = ref("我认为它在全体实数上递增。");

function submitMistake() {
  emit("submit", {
    questionText: questionText.value.trim(),
    studentAnswer: studentAnswer.value.trim()
  });
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

.input-form :deep(.el-form-item__label) {
  color: var(--app-text);
}

.input-form :deep(.el-textarea__inner) {
  border-color: var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-text);
  box-shadow: none;
}

.input-form :deep(.el-textarea__inner::placeholder) {
  color: #68727c;
}

.input-form {
  max-width: 760px;
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

@media (max-width: 680px) {
  .action-row {
    flex-direction: column;
  }
}
</style>
