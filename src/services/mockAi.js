import { getMistakeTypeLabel } from "../data/mockMistakes";

const DEFAULT_ANALYSIS = {
  knowledgePoint: "题目核心知识点",
  mistakeType: "method",
  mistakeTypeLabel: "方法不熟",
  aiReason: "这道题的错误主要来自解题方法不够明确，建议先回到基础概念和标准步骤。",
  reviewSuggestion: "先复习对应知识点，再完成 1 道同类型基础题。"
};

const ANALYSIS_RULES = [
  {
    keywords: ["函数", "单调", "f(x)", "x^2", "二次函数", "抛物线"],
    result: {
      knowledgePoint: "二次函数单调性",
      mistakeType: "concept",
      aiReason: "你没有结合抛物线开口和对称轴判断单调区间，误以为函数始终递增。",
      reviewSuggestion: "先复习二次函数对称轴 x = -b/2a，再完成 1 道同类题。"
    }
  },
  {
    keywords: ["分数", "/", "通分", "约分"],
    result: {
      knowledgePoint: "分数通分计算",
      mistakeType: "careless",
      aiReason: "你的错误集中在分数计算规则，可能把分子和分母直接相加，忽略了通分步骤。",
      reviewSuggestion: "先复习异分母分数加减法，再完成 1 道通分练习。"
    }
  },
  {
    keywords: ["应用题", "至少", "最多", "不超过", "不少于", "条件"],
    result: {
      knowledgePoint: "题干条件提取",
      mistakeType: "reading",
      aiReason: "你可能没有完整提取题干限制条件，导致列式方向和题目要求不一致。",
      reviewSuggestion: "先圈出题干关键词，再重新列出已知条件和要求。"
    }
  },
  {
    keywords: ["方程", "移项", "解方程", "未知数"],
    result: {
      knowledgePoint: "一元一次方程求解",
      mistakeType: "steps",
      aiReason: "你的错误可能出现在移项或合并同类项步骤，导致后续结果偏差。",
      reviewSuggestion: "按“去括号、移项、合并同类项、系数化为 1”的步骤重做 1 遍。"
    }
  }
];

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function matchRule(questionText, studentAnswer) {
  const text = `${questionText} ${studentAnswer}`;
  return ANALYSIS_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );
}

export async function mockAnalyzeMistake(questionText, studentAnswer) {
  await delay(800);

  const matchedRule = matchRule(questionText, studentAnswer);
  const result = matchedRule ? matchedRule.result : DEFAULT_ANALYSIS;
  const mistakeTypeLabel = getMistakeTypeLabel(result.mistakeType);

  return {
    knowledgePoint: result.knowledgePoint,
    mistakeType: result.mistakeType,
    mistakeTypeLabel,
    aiReason: result.aiReason,
    reviewSuggestion: result.reviewSuggestion
  };
}
