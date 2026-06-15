<template>
  <div class="common-layout">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="brand-block">
          <span class="brand-mark" aria-hidden="true">
            <span></span>
          </span>
          <h1>AI错题本</h1>
          <span class="brand-version">MVP</span>
        </div>
      </el-header>

      <el-container class="body-container">
        <el-aside width="220px" class="app-aside">
          <el-menu
            :default-active="activePage"
            class="page-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="overview">
              <span>总览</span>
            </el-menu-item>
            <el-menu-item index="mistake-input">
              <span>错题输入</span>
            </el-menu-item>
            <el-menu-item index="ai-analysis">
              <span>AI 分析卡片</span>
            </el-menu-item>
            <el-menu-item index="review-queue">
              <span>今日复习</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <span>统计</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-container class="content-container">
          <el-main class="app-main">
            <section v-if="activePage === 'overview'" class="page-panel overview-panel">
              <div class="overview-head">
                <div>
                  <h2>错题学习工作台</h2>
                </div>

                <el-button round type="primary" size="large" @click="activePage = 'mistake-input'">
                  输入错题
                </el-button>
              </div>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="12" :md="8" class="mb-4">
                  <div class="statistic-card clickable-card" @click="goReview('pending')">
                    <el-statistic :value="reviewItems.length">
                      <template #title>
                        <div class="statistic-title">
                          今日复习错题
                          <el-tooltip
                            effect="dark"
                            content="当前仍在今日复习队列中的错题数量"
                            placement="top"
                          >
                            <el-icon class="title-icon" :size="12">
                              <Warning />
                            </el-icon>
                          </el-tooltip>
                        </div>
                      </template>
                    </el-statistic>
                    <div class="statistic-footer">
                      <div class="footer-item">
                        <span>待处理</span>
                        <span class="green">
                          {{ pendingCount }}
                          <el-icon>
                            <CaretTop />
                          </el-icon>
                        </span>
                      </div>
                      <div class="footer-item action-link">
                        <span>查看</span>
                        <el-icon :size="14">
                          <ArrowRight />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="12" :md="8" class="mb-4">
                  <div class="statistic-card clickable-card" @click="goReview('mastered')">
                    <el-statistic :value="masteredCount">
                      <template #title>
                        <div class="statistic-title">
                          已掌握错题
                          <el-tooltip
                            effect="dark"
                            content="已被标记为掌握的错题数量"
                            placement="top"
                          >
                            <el-icon class="title-icon" :size="12">
                              <Warning />
                            </el-icon>
                          </el-tooltip>
                        </div>
                      </template>
                    </el-statistic>
                    <div class="statistic-footer">
                      <div class="footer-item">
                        <span>掌握率</span>
                        <span class="green">
                          {{ masteryRate }}%
                          <el-icon>
                            <CaretTop />
                          </el-icon>
                        </span>
                      </div>
                      <div class="footer-item action-link">
                        <span>查看</span>
                        <el-icon :size="14">
                          <ArrowRight />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="12" :md="8" class="mb-4">
                  <div class="statistic-card">
                    <el-statistic :value="allMistakes.length">
                      <template #title>
                        <div class="statistic-title">累计错题</div>
                      </template>
                    </el-statistic>
                    <div class="statistic-footer">
                      <div class="footer-item">
                        <span>进入错题输入</span>
                      </div>
                      <div class="footer-item action-link" @click="activePage = 'mistake-input'">
                        <el-icon :size="14">
                          <ArrowRight />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="status-progress-card">
                <div class="progress-card-head">
                  <div>
                    <h3>错题状态分布</h3>
                    <p>按当前错题池统计未复习、仍未掌握和已掌握的数量。</p>
                  </div>
                  <span>共 {{ allMistakes.length }} 道</span>
                </div>

                <div class="overview-progress">
                  <div class="stacked-progress" aria-label="错题状态占比">
                    <template v-if="allMistakes.length">
                      <div
                        v-for="item in overviewProgressRows"
                        v-show="item.count > 0"
                        :key="item.key"
                        class="stacked-segment"
                        :class="item.className"
                        :style="{ width: `${item.rawPercentage}%` }"
                        :title="`${item.label}：${item.count} 道，占 ${item.percentage}%`"
                        @click="goReview(item.filter)"
                      >
                        <span v-if="item.rawPercentage >= 14">{{ item.percentage }}%</span>
                      </div>
                    </template>
                    <span v-else class="empty-progress">暂无错题</span>
                  </div>

                  <div
                    v-for="item in overviewProgressRows"
                    :key="item.key"
                    class="progress-row"
                    @click="goReview(item.filter)"
                  >
                    <div class="progress-meta">
                      <span>
                        <i :class="item.className"></i>
                        {{ item.label }}
                      </span>
                      <strong>{{ item.count }} 道 / {{ item.percentage }}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activePage === 'mistake-input'" class="page-panel">
              <MistakeInput :loading="isAnalyzing" @submit="handleAnalyze" />
            </section>

            <section v-else-if="activePage === 'ai-analysis'" class="page-panel">
              <AiAnalysisCard
                :card="analysisCard"
                :loading="isAnalyzing"
                @confirm="confirmCard"
              />
            </section>

            <section v-else-if="activePage === 'review-queue'" class="page-panel">
              <ReviewQueue
                :items="filteredReviewItems"
                :selected-id="selectedReview?.id"
                :active-filter="reviewFilter"
                @select="selectReview"
                @update-status="handleUpdateStatus"
                @change-filter="reviewFilter = $event"
              />
            </section>

            <section v-else-if="activePage === 'statistics'" class="page-panel stats-panel">
              <div class="section-head">
                <h2>{{ currentStats.title }}</h2>
              </div>

              <div class="stats-tabs">
                <button
                  v-for="tab in statsTabs"
                  :key="tab.value"
                  type="button"
                  :class="{ active: activeStatsTab === tab.value }"
                  @click="activeStatsTab = tab.value"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div v-if="activeStatsTab === 'forgetting'" class="chart-card dark-chart">
                <svg viewBox="0 0 760 360" class="line-chart" role="img">
                  <g class="grid-lines">
                    <line
                      v-for="tick in percentTicks"
                      :key="`fg-${tick}`"
                      x1="56"
                      x2="720"
                      :y1="chartY(tick, 100)"
                      :y2="chartY(tick, 100)"
                    />
                    <line
                      v-for="(_, index) in forgettingLabels"
                      :key="`fv-${index}`"
                      :x1="chartX(index, forgettingLabels.length)"
                      :x2="chartX(index, forgettingLabels.length)"
                      y1="24"
                      y2="284"
                    />
                  </g>
                  <text
                    v-for="tick in percentTicks"
                    :key="`fl-${tick}`"
                    x="14"
                    :y="chartY(tick, 100) + 5"
                    class="axis-label"
                  >
                    {{ tick }}%
                  </text>
                  <text
                    v-for="(label, index) in forgettingLabels"
                    :key="label"
                    :x="chartX(index, forgettingLabels.length)"
                    y="326"
                    text-anchor="middle"
                    class="axis-label"
                  >
                    {{ label }}
                  </text>
                  <polyline
                    :points="linePoints(forgettingUser, 100)"
                    class="series-line orange-line chart-draw"
                  />
                  <polyline
                    :points="linePoints(forgettingEbbinghaus, 100)"
                    class="series-line teal-line chart-draw"
                  />
                  <circle
                    v-for="(value, index) in forgettingUser"
                    :key="`fu-${index}`"
                    :cx="chartX(index, forgettingUser.length)"
                    :cy="chartY(value, 100)"
                    r="4"
                    class="orange-dot chart-dot"
                    :style="{ animationDelay: `${index * 70}ms` }"
                  />
                  <circle
                    v-for="(value, index) in forgettingEbbinghaus"
                    :key="`fe-${index}`"
                    :cx="chartX(index, forgettingEbbinghaus.length)"
                    :cy="chartY(value, 100)"
                    r="4"
                    class="teal-dot chart-dot"
                    :style="{ animationDelay: `${index * 70}ms` }"
                  />
                </svg>

                <div class="chart-legend">
                  <span><i class="legend-orange"></i>你的学习遗忘曲线</span>
                  <span><i class="legend-teal"></i>艾宾浩斯参考曲线</span>
                </div>
              </div>

              <div v-else-if="activeStatsTab === 'learning'" class="chart-card dark-chart">
                <svg viewBox="0 0 760 360" class="bar-chart" role="img">
                  <g class="grid-lines">
                    <line
                      v-for="tick in learningTicks"
                      :key="`lg-${tick}`"
                      x1="56"
                      x2="720"
                      :y1="chartY(tick, learningMax)"
                      :y2="chartY(tick, learningMax)"
                    />
                  </g>
                  <text
                    v-for="tick in learningTicks"
                    :key="`ll-${tick}`"
                    x="22"
                    :y="chartY(tick, learningMax) + 5"
                    class="axis-label"
                  >
                    {{ tick }}
                  </text>
                  <g v-for="(bar, index) in learningBars" :key="bar.label">
                    <rect
                      :x="chartX(index, learningBars.length) - 14"
                      :y="barStackY(bar, 'unreviewed')"
                      width="28"
                      :height="barHeight(bar.unreviewed, learningMax)"
                      class="bar-pending chart-bar"
                    />
                    <rect
                      :x="chartX(index, learningBars.length) - 14"
                      :y="barStackY(bar, 'needs_practice')"
                      width="28"
                      :height="barHeight(bar.needs_practice, learningMax)"
                      class="bar-fuzzy chart-bar"
                    />
                    <rect
                      :x="chartX(index, learningBars.length) - 14"
                      :y="barStackY(bar, 'mastered')"
                      width="28"
                      :height="barHeight(bar.mastered, learningMax)"
                      class="bar-known chart-bar"
                    />
                    <text
                      :x="chartX(index, learningBars.length)"
                      y="326"
                      text-anchor="middle"
                      class="axis-label"
                    >
                      {{ bar.label }}
                    </text>
                  </g>
                </svg>

                <div class="chart-legend legend-grid">
                  <span><i class="legend-known"></i>已掌握：{{ learningToday.mastered }}</span>
                  <span><i class="legend-fuzzy"></i>仍不会：{{ learningToday.needs_practice }}</span>
                  <span><i class="legend-pending"></i>未复习：{{ learningToday.unreviewed }}</span>
                </div>
              </div>

              <div v-else class="chart-card dark-chart">
                <svg viewBox="0 0 760 360" class="line-chart" role="img">
                  <g class="grid-lines">
                    <line
                      v-for="tick in retentionTicks"
                      :key="`rg-${tick}`"
                      x1="56"
                      x2="720"
                      :y1="chartY(tick, retentionMax)"
                      :y2="chartY(tick, retentionMax)"
                    />
                    <line
                      v-for="(_, index) in retentionLabels"
                      :key="`rv-${index}`"
                      :x1="chartX(index, retentionLabels.length)"
                      :x2="chartX(index, retentionLabels.length)"
                      y1="24"
                      y2="284"
                    />
                  </g>
                  <text
                    v-for="tick in retentionTicks"
                    :key="`rl-${tick}`"
                    x="22"
                    :y="chartY(tick, retentionMax) + 5"
                    class="axis-label"
                  >
                    {{ tick }}
                  </text>
                  <text
                    v-for="(label, index) in retentionLabels"
                    :key="label"
                    :x="chartX(index, retentionLabels.length)"
                    y="326"
                    text-anchor="middle"
                    class="axis-label"
                  >
                    {{ label }}
                  </text>
                  <g v-for="series in retentionSeries" :key="series.name">
                    <polyline
                      :points="linePoints(series.values, retentionMax)"
                      class="series-line chart-draw"
                      :style="{ stroke: series.color }"
                    />
                    <circle
                      v-for="(value, index) in series.values"
                      :key="`${series.name}-${index}`"
                      :cx="chartX(index, series.values.length)"
                      :cy="chartY(value, retentionMax)"
                      r="4"
                      class="chart-dot"
                      :style="{ fill: series.color, animationDelay: `${index * 70}ms` }"
                    />
                  </g>
                </svg>

                <div class="chart-legend retention-legend">
                  <span v-for="series in retentionSeries" :key="series.name">
                    <i :style="{ background: series.color }"></i>{{ series.name }}
                  </span>
                </div>
              </div>
            </section>

          </el-main>

          <el-footer class="app-footer">
            <span>纯前端演示 MVP</span>
            <span>默认使用模拟 AI</span>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { ArrowRight, CaretTop, Warning } from "@element-plus/icons-vue";
import AiAnalysisCard from "./components/AiAnalysisCard.vue";
import MistakeInput from "./components/MistakeInput.vue";
import ReviewQueue from "./components/ReviewQueue.vue";
import {
  analyzeMistake,
  createMistakeCard,
  getMistakeStore,
  getTodayReviews,
  updateMasteryStatus
} from "./services/mockApi";

const activePage = ref("overview");
const isAnalyzing = ref(false);
const analysisCard = ref(null);
const analysisCardConfirmed = ref(false);
const reviewItems = ref([]);
const reviewFilter = ref("pending");
const selectedReview = ref(null);
const allMistakes = ref(getMistakeStore());
const activeStatsTab = ref("forgetting");
const statsTabs = [
  { value: "forgetting", label: "遗忘曲线" },
  { value: "learning", label: "学习情况" },
  { value: "retention", label: "记忆持久度" }
];
const statsPages = {
  forgetting: {
    title: "遗忘曲线"
  },
  learning: {
    title: "学习情况"
  },
  retention: {
    title: "记忆持久度"
  }
};

const pendingCount = computed(
  () => reviewItems.value.filter((item) => item.masteryStatus === "unreviewed").length
);

const filteredReviewItems = computed(() => {
  if (reviewFilter.value === "needs_practice") {
    return reviewItems.value.filter((item) => item.masteryStatus === "needs_practice");
  }

  if (reviewFilter.value === "mastered") {
    return reviewItems.value.filter((item) => item.masteryStatus === "mastered");
  }

  return reviewItems.value.filter((item) => item.masteryStatus === "unreviewed");
});

const masteredCount = computed(
  () => allMistakes.value.filter((item) => item.masteryStatus === "mastered").length
);

const masteryRate = computed(() => {
  if (allMistakes.value.length === 0) return 0;
  return Math.round((masteredCount.value / allMistakes.value.length) * 100);
});

const stillWrongCount = computed(
  () => allMistakes.value.filter((item) => item.masteryStatus === "needs_practice").length
);

const unreviewedCount = computed(
  () => allMistakes.value.filter((item) => item.masteryStatus === "unreviewed").length
);

const reviewedCount = computed(() => masteredCount.value + stillWrongCount.value);

const overviewProgressRows = computed(() => {
  const total = allMistakes.value.length;

  return [
    {
      key: "unreviewed",
      label: "未复习错题",
      count: unreviewedCount.value,
      rawPercentage: toRawPercentage(unreviewedCount.value, total),
      percentage: toProgressPercentage(unreviewedCount.value, total),
      className: "segment-unreviewed",
      filter: "pending"
    },
    {
      key: "needs_practice",
      label: "仍未掌握错题",
      count: stillWrongCount.value,
      rawPercentage: toRawPercentage(stillWrongCount.value, total),
      percentage: toProgressPercentage(stillWrongCount.value, total),
      className: "segment-needs-practice",
      filter: "needs_practice"
    },
    {
      key: "mastered",
      label: "已掌握错题",
      count: masteredCount.value,
      rawPercentage: toRawPercentage(masteredCount.value, total),
      percentage: toProgressPercentage(masteredCount.value, total),
      className: "segment-mastered",
      filter: "mastered"
    }
  ];
});

const currentStats = computed(() => statsPages[activeStatsTab.value] || statsPages.forgetting);

const forgettingLabels = ["今天", "明天", "后天", "3天后", "4天后", "5天后", "6天后"];
const forgettingEbbinghaus = [100, 34, 28, 27, 26, 25.2, 25];
const percentTicks = [100, 80, 60, 40, 20, 0];

const forgettingUser = computed(() => {
  const baseRetention = allMistakes.value.length === 0 ? 40 : Math.max(30, masteryRate.value);
  const penalty = stillWrongCount.value * 4 + unreviewedCount.value * 3;
  return forgettingLabels.map((_, index) => {
    const decay = index * (8 + penalty / 10);
    return Math.max(5, Math.round(baseRetention - decay));
  });
});

const learningBars = computed(() => {
  const days = buildRecentDays(6);
  return days.map((day) => {
    const dayItems = allMistakes.value.filter((item) => formatDay(item.createdAt) === day.key);
    return {
      label: day.label,
      unreviewed: dayItems.filter((item) => item.masteryStatus === "unreviewed").length,
      needs_practice: dayItems.filter((item) => item.masteryStatus === "needs_practice").length,
      mastered: dayItems.filter((item) => item.masteryStatus === "mastered").length
    };
  });
});

const learningMax = computed(() => {
  const max = Math.max(
    1,
    ...learningBars.value.map((bar) => bar.unreviewed + bar.needs_practice + bar.mastered)
  );
  return Math.max(4, max);
});

const learningTicks = computed(() => {
  const max = learningMax.value;
  return [max, Math.ceil(max * 0.75), Math.ceil(max * 0.5), Math.ceil(max * 0.25), 0];
});

const learningToday = computed(() => {
  return learningBars.value[learningBars.value.length - 1] || {
    unreviewed: 0,
    needs_practice: 0,
    mastered: 0
  };
});

const retentionLabels = ["9天前", "8天前", "7天前", "6天前", "5天前", "4天前", "3天前", "前天", "昨天", "今天"];
const retentionMax = computed(() => Math.max(4, allMistakes.value.length));
const retentionTicks = computed(() => [
  retentionMax.value,
  Math.ceil(retentionMax.value * 0.66),
  Math.ceil(retentionMax.value * 0.33),
  0
]);
const retentionSeries = computed(() => {
  const total = allMistakes.value.length;
  const over10Days = reviewedCount.value;
  const over30Days = masteredCount.value;
  const over60Days = Math.floor(masteredCount.value * 0.5);
  const over90Days = Math.floor(masteredCount.value * 0.2);

  return [
    {
      name: `已加入记忆规划的全部错题 ${total}`,
      color: "#ef704f",
      values: buildRetentionTrend(total)
    },
    {
      name: `记忆持久度>10天的错题量 ${over10Days} | ${formatRetentionPercent(over10Days, total)}%`,
      color: "#f4a62a",
      values: buildRetentionTrend(over10Days, 0.2)
    },
    {
      name: `记忆持久度>30天的错题量 ${over30Days} | ${formatRetentionPercent(over30Days, total)}%`,
      color: "#35c2aa",
      values: buildRetentionTrend(over30Days, 0.15)
    },
    {
      name: `记忆持久度>60天的错题量 ${over60Days} | ${formatRetentionPercent(over60Days, total)}%`,
      color: "#18a999",
      values: buildRetentionTrend(over60Days, 0.08)
    },
    {
      name: `记忆持久度>90天的错题量 ${over90Days} | ${formatRetentionPercent(over90Days, total)}%`,
      color: "#4a766c",
      values: buildRetentionTrend(over90Days)
    }
  ];
});

function buildRetentionTrend(count, decayStep = 0) {
  return retentionLabels.map((_, index) => Math.max(0, count - Math.floor(index * decayStep)));
}

function formatRetentionPercent(count, total) {
  if (!total) {
    return "0.00";
  }

  return ((count / total) * 100).toFixed(2);
}

function toProgressPercentage(count, total) {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function toRawPercentage(count, total) {
  if (!total) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(2));
}

onMounted(() => {
  refreshReviews();
});

async function refreshReviews() {
  const result = await getTodayReviews();
  reviewItems.value = result.items;
  allMistakes.value = getMistakeStore();

  if (selectedReview.value) {
    selectedReview.value =
      allMistakes.value.find((item) => item.id === selectedReview.value.id) || null;
  }
}

async function handleAnalyze(payload) {
  if (!payload.questionText || !payload.studentAnswer) {
    ElMessage.warning("请先填写题干和你的错误答案。");
    return;
  }

  isAnalyzing.value = true;
  activePage.value = "ai-analysis";

  try {
    analysisCard.value = await analyzeMistake(payload);
    analysisCardConfirmed.value = false;
    ElMessage.success("AI 分析完成，请确认后生成错题卡。");
  } finally {
    isAnalyzing.value = false;
  }
}

async function confirmCard(editedCard) {
  if (!analysisCard.value) return;
  if (analysisCardConfirmed.value) {
    activePage.value = "review-queue";
    return;
  }

  const createdCard = await createMistakeCard(editedCard || analysisCard.value);
  analysisCardConfirmed.value = true;
  await refreshReviews();
  selectedReview.value = createdCard;
  activePage.value = "review-queue";
  ElMessage.success("错题卡已加入今日复习。");
}

function selectReview(item) {
  selectedReview.value = item;
}

function goReview(filter) {
  reviewFilter.value = filter;
  activePage.value = "review-queue";
}

function handleMenuSelect(index) {
  activePage.value = index;

  if (index === "statistics" && !activeStatsTab.value) {
    activeStatsTab.value = "status";
  }
}

async function handleUpdateStatus(id, masteryStatus) {
  await updateMasteryStatus(id, masteryStatus);
  await refreshReviews();

  const message = masteryStatus === "mastered" ? "已标记为掌握。" : "已保留在复习队列。";
  ElMessage.success(message);
  reviewFilter.value = masteryStatus === "mastered" ? "mastered" : "needs_practice";
  activePage.value = "review-queue";
}

function chartX(index, count) {
  if (count <= 1) return 56;
  return 56 + (index * 664) / (count - 1);
}

function chartY(value, max) {
  if (max <= 0) return 284;
  return 24 + ((max - value) * 260) / max;
}

function linePoints(values, max) {
  return values.map((value, index) => `${chartX(index, values.length)},${chartY(value, max)}`).join(" ");
}

function barHeight(value, max) {
  if (max <= 0) return 0;
  return (value * 260) / max;
}

function barStackY(bar, key) {
  const order = ["mastered", "needs_practice", "unreviewed"];
  const index = order.indexOf(key);
  const value = order.slice(0, index + 1).reduce((total, item) => total + bar[item], 0);
  return chartY(value, learningMax.value);
}

function buildRecentDays(count) {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return {
      key: formatDay(date.toISOString()),
      label: index === count - 1 ? "今天" : `${count - 1 - index}天前`
    };
  });
}

function formatDay(dateLike) {
  return new Date(dateLike).toISOString().slice(0, 10);
}

</script>

<style scoped>
.common-layout {
  --app-bg: #101214;
  --app-surface: #171a1d;
  --app-surface-soft: #1e2226;
  --app-border: #2b3137;
  --app-text: #eef3f6;
  --app-muted: #8c959e;
  --app-accent: #29b99f;
  --app-accent-soft: rgba(41, 185, 159, 0.14);
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text);
}

.app-container {
  min-height: 100vh;
}

.app-header {
  display: flex;
  height: 72px;
  align-items: center;
  border-bottom: 1px solid var(--app-border);
  background: #15181b;
  padding: 0 28px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  position: relative;
  width: 34px;
  height: 34px;
  border: 4px solid #409eff;
  border-radius: 9px;
  transform: rotate(30deg);
}

.brand-mark::before,
.brand-mark::after,
.brand-mark span {
  position: absolute;
  left: 6px;
  width: 14px;
  height: 4px;
  border-radius: 999px;
  background: #409eff;
  content: "";
}

.brand-mark::before {
  top: 8px;
}

.brand-mark span {
  top: 15px;
}

.brand-mark::after {
  top: 22px;
}

.brand-block h1 {
  margin: 0;
  color: #409eff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.brand-version {
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 800;
}

.body-container {
  min-height: calc(100vh - 72px);
}

.app-aside {
  border-right: 1px solid var(--app-border);
  background: #15181b;
  padding: 18px 12px;
}

.page-menu {
  border-right: 0;
  background: transparent;
}

.page-menu :deep(.el-menu-item) {
  height: 44px;
  border-radius: 8px;
  margin-bottom: 6px;
  background: transparent;
  color: #a3adb7;
  font-weight: 700;
}

.page-menu :deep(.el-sub-menu__title) {
  height: 44px;
  border-radius: 8px;
  margin-bottom: 6px;
  color: #a3adb7;
  font-weight: 700;
}

.page-menu :deep(.el-menu-item:hover),
.page-menu :deep(.el-sub-menu__title:hover) {
  background: var(--app-surface-soft);
  color: var(--app-text);
}

.page-menu :deep(.el-menu-item.is-active) {
  background: var(--app-accent-soft);
  color: var(--app-accent);
}

.content-container {
  min-width: 0;
}

.app-main {
  padding: 28px;
  background: var(--app-bg);
}

.page-panel {
  min-height: calc(100vh - 172px);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
  padding: 28px;
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
}

.overview-panel {
  display: grid;
  align-content: start;
  gap: 24px;
}

.overview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.overview-head h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 28px;
}

.overview-head :deep(.el-button) {
  min-width: 112px;
  border-radius: 999px;
  font-weight: 800;
}

.status-progress-card {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-soft);
  padding: 22px 26px;
}

.progress-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.progress-card-head h3 {
  margin: 0 0 8px;
  color: var(--app-text);
  font-size: 18px;
}

.progress-card-head p {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.7;
}

.progress-card-head > span {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-weight: 800;
}

.overview-progress {
  display: grid;
  gap: 14px;
  max-width: 720px;
}

.stacked-progress {
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 30px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: #111417;
}

.stacked-segment {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  min-width: 3px;
  cursor: pointer;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  transition: filter 0.2s;
}

.stacked-segment:hover {
  filter: brightness(1.12);
}

.empty-progress {
  width: 100%;
  color: var(--app-muted);
  font-size: 13px;
  text-align: center;
}

.progress-row {
  cursor: pointer;
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  color: var(--app-muted);
  font-size: 14px;
}

.progress-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.progress-meta i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.progress-meta strong {
  color: var(--app-text);
  font-size: 13px;
}

.segment-unreviewed {
  background: #f56c6c;
}

.segment-needs-practice {
  background: #e6a23c;
}

.segment-mastered {
  background: #29b99f;
}

.mb-4 {
  margin-bottom: 16px;
}

.overview-panel :deep(.el-statistic) {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background-color: var(--app-surface-soft);
  padding: 20px;
}

.clickable-card {
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.clickable-card:hover {
  border-color: var(--app-accent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
  transform: translateY(-1px);
}

.statistic-card :deep(.el-statistic__head) {
  color: var(--app-muted);
}

.statistic-card :deep(.el-statistic__content) {
  color: var(--app-text);
}

.statistic-title {
  display: inline-flex;
  align-items: center;
}

.title-icon {
  margin-left: 4px;
}

.statistic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 16px;
  color: var(--app-muted);
  font-size: 12px;
}

.statistic-footer .footer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--app-accent);
}

.action-link {
  cursor: pointer;
  color: var(--app-accent);
}

.stats-panel {
  display: grid;
  align-content: start;
  gap: 22px;
}

.section-head h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 28px;
}

.chart-card {
  border-radius: 8px;
  padding: 22px;
}

.dark-chart {
  border: 1px solid var(--app-border);
  background: #121416;
  color: #9da3a9;
}

.stats-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 12px;
}

.stats-tabs button {
  min-height: 40px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface-soft);
  color: #a3adb7;
  padding: 0 16px;
  font-weight: 800;
  cursor: pointer;
}

.stats-tabs button.active {
  border-color: var(--app-accent);
  background: var(--app-accent-soft);
  color: var(--app-accent);
}

.line-chart,
.bar-chart {
  display: block;
  width: 100%;
  min-height: 360px;
}

.grid-lines line {
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
}

.axis-label {
  fill: #8b9299;
  font-size: 14px;
}

.series-line {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-draw {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: line-draw 900ms ease forwards;
}

.chart-dot {
  opacity: 0;
  animation: dot-in 360ms ease forwards;
}

.chart-bar {
  transform-origin: center bottom;
  animation: bar-rise 680ms ease both;
}

.orange-line {
  stroke: #ef704f;
}

.teal-line {
  stroke: #35c2aa;
}

.orange-dot {
  fill: #ef704f;
}

.teal-dot {
  fill: #35c2aa;
}

.bar-known {
  fill: #35c2aa;
}

.bar-fuzzy {
  fill: #f4a62a;
}

.bar-pending {
  fill: #5b5d60;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  margin-top: 14px;
  color: #9da3a9;
  font-size: 15px;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chart-legend i {
  display: inline-block;
  width: 28px;
  height: 4px;
  border-radius: 999px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.legend-orange {
  background: #ef704f;
}

.legend-teal,
.legend-known {
  background: #35c2aa;
}

.legend-fuzzy {
  background: #f4a62a;
}

.legend-pending {
  background: #5b5d60;
}

.retention-legend {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@keyframes line-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes dot-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bar-rise {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.app-footer {
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--app-border);
  background: #15181b;
  padding: 0 28px;
  color: var(--app-muted);
  font-size: 13px;
}

@media (max-width: 760px) {
  .body-container {
    flex-direction: column;
  }

  .app-aside {
    width: 100% !important;
    border-right: 0;
    border-bottom: 1px solid var(--app-border);
  }

  .app-main {
    padding: 16px;
  }

  .overview-head {
    flex-direction: column;
  }

  .overview-head :deep(.el-button) {
    width: 100%;
  }

  .chart-card {
    padding: 14px;
  }

  .stats-tabs {
    justify-content: flex-start;
    gap: 22px;
    overflow-x: auto;
    font-size: 15px;
  }

  .legend-grid {
    grid-template-columns: 1fr;
  }

  .app-footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }
}
</style>
