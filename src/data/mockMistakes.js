export const mistakeTypes = [
  { value: "concept", label: "概念不清" },
  { value: "careless", label: "粗心计算" },
  { value: "reading", label: "审题错误" },
  { value: "method", label: "方法不熟" },
  { value: "steps", label: "步骤缺失" }
];

export const masteryStatusLabels = {
  unreviewed: "未复习",
  needs_practice: "仍不会",
  mastered: "已掌握"
};

export function getMistakeTypeLabel(mistakeType) {
  return mistakeTypes.find((item) => item.value === mistakeType)?.label || "方法不熟";
}

export function getRecommendationReason(card) {
  if (card.masteryStatus === "needs_practice") {
    return `该题复练后仍未掌握，建议优先巩固“${card.knowledgePoint}”。`;
  }

  if (card.masteryStatus === "mastered") {
    return `该题已标记掌握，后续可作为“${card.mistakeTypeLabel}”类错因的低频回顾题。`;
  }

  return `该题还没有完成二次练习，建议今天优先复练，避免错题只记录不消化。`;
}

function daysAgo(dayOffset, hour = 21, minute = 10) {
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const demoMistakes = [
  {
    id: "m_001",
    questionText: "已知函数 f(x)=x^2-2x，求其单调区间。",
    studentAnswer: "我认为它在全体实数上递增。",
    knowledgePoint: "二次函数单调性",
    mistakeType: "concept",
    mistakeTypeLabel: "概念不清",
    aiReason: "你没有结合抛物线开口和对称轴判断单调区间，误以为函数始终递增。",
    reviewSuggestion: "先复习二次函数对称轴 x = -b/2a，再完成 1 道同类题。",
    masteryStatus: "unreviewed",
    createdAt: daysAgo(0, 21, 10)
  },
  {
    id: "m_002",
    questionText: "计算 3/4 + 2/5 的结果。",
    studentAnswer: "我写成了 5/9。",
    knowledgePoint: "分数通分计算",
    mistakeType: "careless",
    mistakeTypeLabel: "粗心计算",
    aiReason: "你把分子和分母直接相加，没有先通分，属于分数加法规则使用错误。",
    reviewSuggestion: "先复习异分母分数加法，再完成 1 道通分计算题。",
    masteryStatus: "needs_practice",
    createdAt: daysAgo(0, 21, 18)
  },
  {
    id: "m_003",
    questionText: "阅读题中问“下列说法不正确的是”，选择正确选项。",
    studentAnswer: "我只看到了“正确的是”，选了 B。",
    knowledgePoint: "题干关键词识别",
    mistakeType: "reading",
    mistakeTypeLabel: "审题错误",
    aiReason: "你漏看了否定词“不正确”，导致判断方向相反。",
    reviewSuggestion: "做选择题时先圈出否定词、条件词，再开始判断选项。",
    masteryStatus: "mastered",
    createdAt: daysAgo(1, 20, 45)
  },
  {
    id: "m_004",
    questionText: "解方程 2(x-3)=10。",
    studentAnswer: "我算成 x=2。",
    knowledgePoint: "一元一次方程去括号",
    mistakeType: "steps",
    mistakeTypeLabel: "步骤缺失",
    aiReason: "你去括号后没有继续移项和合并，解题步骤中断。",
    reviewSuggestion: "按“去括号-移项-合并-系数化为1”的顺序重做 1 道题。",
    masteryStatus: "unreviewed",
    createdAt: daysAgo(1, 21, 30)
  },
  {
    id: "m_005",
    questionText: "判断一次函数 y=-2x+3 的图像随 x 增大如何变化。",
    studentAnswer: "我写成随 x 增大而增大。",
    knowledgePoint: "一次函数增减性",
    mistakeType: "concept",
    mistakeTypeLabel: "概念不清",
    aiReason: "你没有根据 k 的正负判断增减性，k<0 时函数随 x 增大而减小。",
    reviewSuggestion: "复习一次函数 k 值与图像趋势的关系，再完成 1 道判断题。",
    masteryStatus: "mastered",
    createdAt: daysAgo(2, 19, 55)
  },
  {
    id: "m_006",
    questionText: "计算 48÷6×2 的结果。",
    studentAnswer: "我先算 6×2，得到 4。",
    knowledgePoint: "混合运算顺序",
    mistakeType: "method",
    mistakeTypeLabel: "方法不熟",
    aiReason: "你把同级运算错误地按优先级处理，乘除同级应从左到右计算。",
    reviewSuggestion: "复习同级运算从左到右规则，再完成 2 道混合运算题。",
    masteryStatus: "needs_practice",
    createdAt: daysAgo(3, 21, 5)
  },
  {
    id: "m_007",
    questionText: "三角形两边分别为 3 和 5，第三边 x 的取值范围。",
    studentAnswer: "我写成 2≤x≤8。",
    knowledgePoint: "三角形三边关系",
    mistakeType: "concept",
    mistakeTypeLabel: "概念不清",
    aiReason: "你把严格不等式写成了包含端点，忽略了两边之和必须大于第三边。",
    reviewSuggestion: "记住第三边范围是“两边差 < 第三边 < 两边和”。",
    masteryStatus: "mastered",
    createdAt: daysAgo(4, 20, 20)
  },
  {
    id: "m_008",
    questionText: "根据图形求阴影部分面积。",
    studentAnswer: "我把长方形面积直接当成答案。",
    knowledgePoint: "组合图形面积",
    mistakeType: "method",
    mistakeTypeLabel: "方法不熟",
    aiReason: "你没有拆分图形，也没有扣除空白部分，导致面积计算范围错误。",
    reviewSuggestion: "先标出整体和空白区域，再用“整体-空白”的方法计算。",
    masteryStatus: "unreviewed",
    createdAt: daysAgo(5, 21, 40)
  }
];
