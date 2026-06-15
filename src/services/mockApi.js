import { mockAnalyzeMistake } from "./mockAi";
import { demoMistakes, getRecommendationReason } from "../data/mockMistakes";

function withRecommendationReason(card) {
  return {
    ...card,
    recommendationReason: getRecommendationReason(card)
  };
}

let mistakeStore = demoMistakes.map(withRecommendationReason);

function createMistakeId() {
  return `m_${Date.now()}`;
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function getMistakeStore() {
  return [...mistakeStore];
}

export async function analyzeMistake({ questionText, studentAnswer }) {
  const analysisResult = await mockAnalyzeMistake(questionText, studentAnswer);

  return withRecommendationReason({
    id: createMistakeId(),
    questionText,
    studentAnswer,
    ...analysisResult,
    masteryStatus: "unreviewed",
    createdAt: new Date().toISOString()
  });
}

export async function createMistakeCard(card) {
  await delay(200);
  const cardWithReason = withRecommendationReason(card);
  mistakeStore = [cardWithReason, ...mistakeStore];
  return cardWithReason;
}

export async function getTodayReviews() {
  await delay(200);

  return {
    items: [...mistakeStore]
  };
}

export async function updateMasteryStatus(id, masteryStatus) {
  await delay(200);

  mistakeStore = mistakeStore.map((item) =>
    item.id === id ? withRecommendationReason({ ...item, masteryStatus }) : item
  );

  return {
    id,
    masteryStatus
  };
}

export function resetMockStore() {
  mistakeStore = demoMistakes.map(withRecommendationReason);
}
