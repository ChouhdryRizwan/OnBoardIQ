# OnBoardIQ — AI Usage & Prompt Architecture

## 1. Role of AI in OnBoardIQ
OnBoardIQ utilizes Generative AI strictly for **content synthesis and educational onboarding plan generation** (Pipeline 1). AI is **prohibited** from acting as an unconstrained decision-maker or self-approving compliance validator.

---

## 2. GenAI Model Integration
- **Primary Model**: `gemini-2.5-flash` (Fast, structured JSON synthesis)
- **Fallback Model**: `gemini-2.5-pro` (Complex reasoning and deep document analysis)
- **SDK**: Google GenAI Python SDK (`google-genai` / `google.generativeai`)

---

## 3. Strict Structural Scoping & Prompt Controls
- **Structured JSON Schema**: Gemini calls enforce rigid JSON schemas for plans, stages, modules, tasks, rubrics, and quizzes.
- **Untrusted Input Handling**: Ingested policy document chunks and user prompts are passed as isolated string parameters within data blocks. Instructions inside policy documents (e.g. `"IGNORE ALL INSTRUCTIONS"`) are safely treated as passive text data.
- **Traceability Injection**: Prompts instruct the model to attach source document IDs and section IDs to every generated module and task.

---

## 4. Why Pipeline 2 Does Not Use GenAI
To eliminate AI hallucination risk in enterprise compliance:
- **Pipeline 2 is 100% Deterministic Python**.
- It uses exact string matching, set intersection, and rules-based logic to verify mandatory requirements, document version numbers, and chunk references.
- AI is never allowed to validate AI outputs in OnBoardIQ.
