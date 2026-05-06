---
name: ja-so-seo-do-u-mi
version: "0.2.0"
description: Use when the user wants to revise, diagnose, rewrite, shorten, lengthen, or polish a Korean job application essay or 자기소개서 using a pasted 채용공고/JD, 자기소개서 문항, 글자수 제한, and rough draft. Default to preserving the user's intended appeal points unless they explicitly ask for a full rewrite. Trigger on requests such as "자소서 수정", "자기소개서 고쳐줘", "채용공고에 맞게 자소서", "JD 기반 자소서", "문장만 다듬어줘", "글자수 맞춰줘", "AI 티 안 나게 자소서", "기업 제출용으로 다듬어줘", and "ja-so-seo-do-u-mi".
---

# 자소서 도우미

Revise Korean job application essays by reading the JD, prompt, length rule, and draft together. Default to preservation-first editing: improve structure, evidence, naturalness, and submission safety without silently dropping what the user wanted to appeal.

## Input Contract

Accept a simple paste when these four parts are present or inferable:

```text
채용공고/JD:
자소서 문항:
글자수:
초안:
```

Optional signals: company, role, desired tone, requested mode, must-preserve facts or appeal points, blind-hiring constraints, and length-counting basis.

Ask one short question only when a required part is missing, multiple prompts cannot be mapped, or a must-preserve point conflicts with prompt fit, length, fabrication safety, interview safety, or blind-hiring rules.

## Core Rules

1. Never invent experiences, numbers, achievements, tools, company facts, awards, periods, or responsibilities.
2. Preserve user-provided facts and intended appeal points unless the user explicitly changes them or a hard submission risk requires compression or omission.
3. Default to `preserve_revision`; use `rewrite` only for explicit requests like "아예 새로", "구조를 갈아엎어", or "제출본으로 재작성".
4. Answer the application prompt before polishing prose.
5. Use the JD as context, not a keyword script; responsibilities and requirements outrank preferred qualifications and generic values.
6. Replace vague traits with concrete behavior, role, result, and JD relevance without deleting the user's intended strength.
7. Remove formulaic application prose only after checking factual meaning and Appeal Lock.
8. Stay within the length limit and report residual risks, including any locked appeal point that was heavily compressed or omitted.

## References

Load only what the task needs:

- `references/intake-schema.md`: parse input, requested mode, appeal points, and clarifying-question rules.
- `references/jd-parser-rules.md`: extract company, role, responsibilities, requirements, skills, and values.
- `references/question-taxonomy.md`: classify prompt type and required answer elements.
- `references/field-writing-rules.md`: recruiter-style writing heuristics and concrete evidence principles.
- `references/diagnosis-taxonomy.md`: diagnose weak drafts, including `Intent Loss Risk`.
- `references/application-naturalness-rules.md`: reduce formulaic Korean application prose without erasing intent.
- `references/rewrite-playbook.md`: plan preserve/rewrite modes, length strategy, and final prose.
- `references/audit-checklist.md`: audit factual fidelity, user-intent fidelity, length, prompt fit, JD fit, and submission safety.
- `scripts/count_korean_length.py`: deterministic length and byte counting.

## Workflow

1. **Intake**: split or infer JD, prompt, length rule, draft, requested mode, constraints, and confidence. Use `intake-schema.md`.
2. **Appeal Lock**: before deep JD parsing or rewriting, lock the user's main claim, early/repeated/detailed experiences, intended strengths, values, motivation, and explicit "꼭 살려줘" points.
3. **JD Parse**: extract job signals with this weight: `responsibilities > requirements > skills/domain > preferred > values`.
4. **Prompt Classification**: classify the question and derive mandatory answer elements.
5. **Diagnosis**: detect prompt mismatch, weak JD connection, vague traits, weak action/result, unclear contribution, JD overfit, formulaic prose, fabrication risk, and intent loss risk.
6. **Rewrite Plan**: choose a structure that starts from the prompt answer and keeps locked appeal points unless prompt fit or submission safety requires otherwise.
7. **Rewrite**: produce final submission prose. In `preserve_revision`, use the smallest structural change that solves the issue. In `rewrite`, restructure more freely but preserve or report locked appeal points.
8. **Naturalness Pass**: remove cliches, generic praise, mechanical STAR, repetitive connectors, translationese, exaggerated emotion, and empty ambition while preserving factual meaning and user intent.
9. **Audit**: check factual fidelity, user-intent fidelity, prompt fit, JD fit, length, fabrication risk, and blind-hiring/submission risks. Revise once for hard failures.

## Final Response

Default:

```text
[최종 제출본]

글자수: N/M자 (기준: 공백 포함|공백 제외|byte|불명확)

살린 핵심:
- ...

수정 요약:
- ...

축약/생략한 부분:
- ...

확인 필요:
- ...
```

Include `살린 핵심` by default with 2-4 bullets. Include `축약/생략한 부분` only when content was actually heavily compressed or omitted. Omit `확인 필요` when there is no important residual risk.
