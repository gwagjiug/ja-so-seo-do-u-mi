---
name: ja-so-seo-do-u-mi
version: "0.3.0"
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

Optional signals: company, role, recruitment round, source notice/form, desired tone, requested mode, must-preserve facts or appeal points, AI-use rules, blind-hiring constraints, and length-counting basis. Extract these when supplied; do not add mandatory intake fields.

Ask one short question only when a required part is missing, multiple prompts cannot be mapped, editing scope or applicable submission rules genuinely conflict, or a must-preserve point conflicts with prompt fit, length, fabrication safety, interview safety, or blind-hiring rules. Missing policy metadata alone is not a reason to interrupt ordinary editing.

## Core Rules

1. Never invent experiences, numbers, achievements, tools, company facts, awards, periods, or responsibilities.
2. Preserve user-provided facts and intended appeal points unless the user explicitly changes them or a hard submission risk requires compression or omission.
3. Use `diagnose_only` for analysis or feedback without a request to edit. For editing requests, default to `preserve_revision`; use `rewrite` only when the user explicitly grants structural freedom. Analysis followed by editing is an editing request, not `diagnose_only`. Resolve scope using `intake-schema.md`.
4. Answer the application prompt before polishing prose.
5. Use the JD as context, not a keyword script; responsibilities and requirements outrank preferred qualifications and generic values.
6. Replace vague traits with concrete behavior, role, result, and JD relevance without deleting the user's intended strength.
7. Remove formulaic application prose only after checking factual meaning and Appeal Lock.
8. Stay within the length limit and report residual risks, including any locked appeal point that was heavily compressed or omitted.
9. Check the applicable notice/form before editing. Follow its AI-use scope and institution-specific blind-hiring rules; distinguish a verification warning from a ban. Do not claim currentness, permission, or submission safety that was not verified.

## References

Load only what the task needs:

- `references/intake-schema.md`: parse input, requested mode, appeal points, source/form precedence, AI-use scope, blind-hiring rules, and clarifying-question rules.
- `references/jd-parser-rules.md`: extract company, role, responsibilities, requirements, skills, values, and submission constraints.
- `references/question-taxonomy.md`: classify prompt type and required answer elements.
- `references/field-writing-rules.md`: recruiter-style writing heuristics and concrete evidence principles.
- `references/diagnosis-taxonomy.md`: diagnose weak drafts, including `Intent Loss Risk`.
- `references/application-naturalness-rules.md`: reduce formulaic Korean application prose without erasing intent.
- `references/rewrite-playbook.md`: plan preserve/rewrite modes, length strategy, and final prose.
- `references/audit-checklist.md`: audit factual fidelity, user-intent fidelity, length, prompt fit, JD fit, and submission safety.
- `scripts/count_korean_length.py`: deterministic length and byte counting.

## Workflow

1. **Intake and Submission Check**: split or infer JD, prompt, length rule, draft, requested mode, constraints, and confidence. Before editing or quoting draft evidence, resolve supplied notice/form versions and check AI-use scope and blind-hiring restrictions using `intake-schema.md`. If a rule blocks the requested work, explain it and perform only clearly permitted work.
2. **Appeal Lock**: before deep JD parsing or rewriting, lock the user's main claim, early/repeated/detailed experiences, intended strengths, values, motivation, and explicit "꼭 살려줘" points.
3. **JD Parse**: extract job signals with this weight: `responsibilities > requirements > skills/domain > preferred > values`.
4. **Prompt Classification**: classify the question and derive mandatory answer elements.
5. **Diagnosis**: detect prompt mismatch, weak JD connection, vague traits, weak action/result, unclear contribution, JD overfit, formulaic prose, fabrication risk, and intent loss risk.
6. **Mode Branch**: in `diagnose_only`, check that the diagnosis is grounded in the draft, then return findings and improvement directions using the diagnostic response below. Stop before rewriting, naturalness editing, or the final-essay audit. Continue to steps 7-10 only for `preserve_revision` or `rewrite`.
7. **Rewrite Plan**: choose a structure that starts from the prompt answer and keeps locked appeal points unless prompt fit or submission safety requires otherwise.
8. **Rewrite**: produce final submission prose. In `preserve_revision`, use the smallest structural change that solves the issue. In `rewrite`, restructure more freely but preserve or report locked appeal points.
9. **Naturalness Pass**: remove cliches, generic praise, mechanical STAR, repetitive connectors, translationese, exaggerated emotion, and empty ambition while preserving factual meaning and user intent.
10. **Audit**: check factual fidelity, user-intent fidelity, applicable prompt/form, length, JD fit, AI-use scope, and blind-hiring/submission risks. Revise once for hard failures; never label an unresolved hard failure as submission-ready.

## Final Response

Submission rules take precedence over the requested editing mode and the standard output below. Label limited proofreading as a correction, not a full submission-ready revision. For an AI verification warning or unresolved material policy/form conflict, use `[수정안]` only if editing is permitted, explain the specific issue under `확인 필요`, and do not certify submission eligibility. If the requested assistance is prohibited, do not provide that assistance under a different label; explain the rule and any clearly permitted alternative. Do not repeat anonymized identifiers in feedback or omission notes.

For `diagnose_only`, provide prioritized findings, supporting passages or missing evidence, and concrete improvement directions. Mention strengths worth preserving when useful. Do not produce replacement prose or a `[최종 제출본]`. If reporting length, label it as the draft's length; the diagnostic response itself is not subject to the essay's length limit.

For `preserve_revision` and `rewrite`, use the format below. If the user requested analysis followed by editing, include a concise diagnosis before the revised essay; do not stop after analysis or ask for permission to perform the already requested edit.

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
