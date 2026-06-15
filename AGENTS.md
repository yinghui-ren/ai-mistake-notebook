# AI Mistake Notebook Development Guide

This repository implements the AI Mistake Notebook MVP described in `pmd.md`.

The project is an interview/demo MVP, not a full production system. Optimize for a clear, runnable product flow over backend completeness.

## Product Scope

Build a demo that validates one core loop:

```text
Input a mistake -> Mock AI analysis -> Generate mistake card -> Add to today's review -> Mark mastery status
```

The MVP contains only three core capabilities:

1. Mistake input
   - Manual question text input.
   - Manual student wrong answer input.
   - Photo upload may exist as a UI-only entry point.
   - Do not implement real OCR in MVP.

2. Mock AI mistake analysis
   - Output one knowledge point.
   - Output one mistake type.
   - Output one short mistake explanation.
   - Output one review suggestion.
   - Allow user confirmation/editing where practical.

3. Review queue and feedback
   - Generated cards are added to today's review queue.
   - User can start review.
   - User can mark a card as `mastered` or `needs_practice`.

Do not implement teacher features, class management, login, payment, social sharing, real OCR, real LLM calls, complex recommendation algorithms, full knowledge graph logic, or multi-round variant question generation.

## Recommended Architecture

Use a frontend-only architecture for the MVP.

Recommended stack:

- Vue 3
- Vite
- JavaScript
- Single File Components (`.vue`)
- Scoped component styles plus one optional global stylesheet
- Vue local component state for MVP data
- Optional `localStorage` only if useful for preserving demo state

Suggested source structure:

```text
src/
  main.js
  App.vue
  data/
    mockMistakes.js
  services/
    mockAi.js
    mockApi.js
  components/
    MistakeInput.vue
    AiAnalysisCard.vue
    ReviewQueue.vue
    MasteryFeedback.vue
  styles/
    main.css
```

Keep the implementation small. Prefer one clear screen with three sections over routing unless routing already exists in the project.

Style guidance:

- Put component-specific styles in each `.vue` file using `<style scoped>`.
- Put page reset, theme variables, and shared layout/button styles in `src/styles/main.css`.
- Import global styles from `src/main.js`.

## UI Flow

The UI should make the MVP loop obvious:

1. Mistake input section
   - Question text field.
   - Student wrong answer field.
   - UI-only photo upload button.
   - "Analyze with AI" action.

2. AI analysis / mistake card section
   - Show analyzing/loading state briefly.
   - Show question, knowledge point, mistake type, AI reason, and review suggestion.
   - Confirm/generate card action.

3. Today's review / feedback section
   - Show generated cards.
   - Let user start review.
   - Let user mark `mastered` or `needs_practice`.
   - Show visible status changes after feedback.

The product principle is: few inputs, fast generation, direct review.

## Data Model

Use this canonical model unless there is a strong reason to change it. In this Vue + JavaScript MVP, document the shape with JSDoc or comments instead of requiring TypeScript.

```js
/**
 * MistakeCard shape:
 * {
 *   id: string,
 *   questionText: string,
 *   studentAnswer: string,
 *   knowledgePoint: string,
 *   mistakeType: "concept" | "careless" | "reading" | "method" | "steps",
 *   mistakeTypeLabel: string,
 *   aiReason: string,
 *   reviewSuggestion: string,
 *   recommendationReason: string,
 *   masteryStatus: "unreviewed" | "needs_practice" | "mastered",
 *   createdAt: string
 * }
 */
```

Mistake type labels:

- `concept`: 概念不清
- `careless`: 粗心计算
- `reading`: 审题错误
- `method`: 方法不熟
- `steps`: 步骤缺失

## Mock AI Policy

MVP must use Mock AI by default. Do not require API keys or external services to run the demo.

`mockAnalyzeMistake(questionText, studentAnswer)` should simulate a real real AI response and return structured data:

```js
{
  knowledgePoint: "二次函数单调性",
  mistakeType: "concept",
  mistakeTypeLabel: "概念不清",
  aiReason: "学生没有结合抛物线开口和对称轴判断单调区间，误以为函数始终递增。",
  reviewSuggestion: "先复习二次函数对称轴 x = -b/2a，再完成 1 道同类题。"
}
```

It is acceptable to:

- Return a fixed sample analysis.
- Add simple keyword rules for better demo behavior.
- Add a short artificial delay to show "AI analyzing".

It is not necessary to:

- Call a real LLM.
- Implement prompt engineering.
- Implement OCR.
- Implement scoring or complex recommendations.

## Interface Contract

There is no required backend for MVP. The following API contracts document the intended boundary and should be implemented as frontend Mock functions if needed.

### Submit Mistake And Trigger 智能 Analysis

```http
POST /api/mistakes/analyze
```

Request:

```json
{
  "questionText": "已知函数 f(x)=x^2-2x，求单调区间",
  "studentAnswer": "全体实数上递增"
}
```

Response:

```json
{
  "id": "m_001",
  "questionText": "已知函数 f(x)=x^2-2x，求单调区间",
  "studentAnswer": "全体实数上递增",
  "knowledgePoint": "二次函数单调性",
  "mistakeType": "concept",
  "mistakeTypeLabel": "概念不清",
  "aiReason": "学生没有结合抛物线开口和对称轴判断单调区间，误以为函数始终递增。",
  "reviewSuggestion": "先复习二次函数对称轴 x = -b/2a，再完成 1 道同类题。",
  "recommendationReason": "该题还没有完成二次练习，建议今天优先复练，避免错题只记录不消化。",
  "masteryStatus": "unreviewed",
  "createdAt": "2026-06-14T21:10:00.000Z"
}
```

### Get Today's Review Queue

```http
GET /api/reviews/today
```

Response:

```json
{
  "items": [
    {
      "id": "m_001",
      "questionText": "已知函数 f(x)=x^2-2x，求单调区间",
      "knowledgePoint": "二次函数单调性",
      "mistakeTypeLabel": "概念不清",
      "masteryStatus": "unreviewed"
    }
  ]
}
```

### Update Mastery Result

```http
PATCH /api/mistakes/{id}/mastery
```

Request:

```json
{
  "masteryStatus": "mastered"
}
```

Response:

```json
{
  "id": "m_001",
  "masteryStatus": "mastered"
}
```

`masteryStatus` values are `unreviewed`, `needs_practice`, and `mastered`.

## Engineering Standards

- Keep the demo runnable with one or two commands.
- Do not add backend infrastructure unless explicitly requested.
- Do not add database dependencies for MVP.
- Avoid over-engineering state management; Vue `ref` / `reactive` state is enough.
- Do not add Pinia or Vue Router unless explicitly needed.
- Keep functions small and named by product intent.
- Use clear Chinese UI copy aligned with `pmd.md`.
- All user-facing interface text must be in Chinese.
- Keep the happy path polished before adding edge cases.
- Add empty/loading states where they support the demo flow.
- Avoid hidden dependencies on network, API keys, or private services.

## Verification Checklist

Before considering the MVP done, verify:

- User can input question text and wrong answer.
- Clicking "AI 分析" shows an analyzing state.
- Mock AI returns knowledge point, mistake type, reason, and review suggestion.
- User can generate a mistake card.
- Generated card appears in today's review queue.
- User can mark the card as `已掌握` or `仍不会`.
- Mastery status updates visibly in the UI.
- The app can run without backend, database, OCR, or 智能 API keys.
