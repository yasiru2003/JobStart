# 🧠 HirePath AI Architecture & Development Guidelines

## 1. AI-First Context & Clarification Principle (CRITICAL)
- **Zero Hardcoded Assumptions**: Never assume candidate input is a strict answer or fixed machine state.
- **Clarification Protection**: In ALL flows (Screening Questions, 3-Step Qualification, Job Selection, Slot Allocation), candidate messages MUST be checked for questions or clarification requests (e.g. *"what do you mean by notice period?"*, *"why do you need my experience?"*).
- **Gemini 3.6 Flash Response**: If the candidate asks a question, route to Gemini 3.6 Flash to answer their question warmly with full conversation history and politely re-prompt for their response without advancing or corrupting the stage.

## 2. Robust Multi-Device Phone Matching
- Always use `extract_phone_deep()` to recursively scan incoming WhatsApp JSON payloads for phone numbers.
- Filter out internal `@lid` identifiers and match against `conversation_store._sessions`.

## 3. Fast-Path + Context-Aware Intent Classifier
- Use 0ms Fast-Path guards for pure numeric/emoji replies (`1`, `2️⃣`, `3.`).
- Use fast AI intent classification (JSON mode) with full conversation history for natural language & Singlish queries.
