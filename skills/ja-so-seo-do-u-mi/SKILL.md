---
name: ja-so-seo-do-u-mi
version: "0.1.0"
description: Use when the user wants to revise, diagnose, rewrite, shorten, lengthen, or polish a Korean job application essay or 자기소개서 using a pasted 채용공고/JD, 자기소개서 문항, 글자수 제한, and rough draft. Trigger on requests such as "자소서 수정", "자기소개서 고쳐줘", "채용공고에 맞게 자소서", "JD 기반 자소서", "글자수 맞춰줘", "AI 티 안 나게 자소서", "기업 제출용으로 다듬어줘", and "ja-so-seo-do-u-mi".
---

# 자소서 도우미

Korean job application essay workflow for Codex. Turn a rough draft into a submission-ready 자기소개서 by parsing the JD, classifying the prompt, restructuring evidence, removing application-specific formulaic prose, and auditing length and factual fidelity.

## Input Contract

Prefer accepting a simple paste. Do not demand a long template when these four parts are present or inferable:

```text
채용공고/JD:
...

자소서 문항:
...

글자수:
...

초안:
...
```

Optional signals: company name, role name, desired tone, must-preserve facts, blind-hiring constraints, and whether length counts spaces or bytes.

Ask a short clarifying question only when a required item is truly missing or risky to infer, such as no length limit, no prompt, no draft for a revision request, or ambiguous multi-question input.

## Core Rules

1. Do not invent experiences, numbers, achievements, tools, company facts, awards, periods, or responsibilities.
2. Preserve all user-provided facts unless explicitly asked to change them.
3. Answer the application prompt before making the prose pretty.
4. Prioritize JD responsibilities and requirements over preferred qualifications and generic company values.
5. Use the JD as context, not as a keyword script. Do not add role-specific jargon unless the draft supports it.
6. Replace vague traits with concrete behavior, role, result, and job relevance.
7. Keep concreteness role-neutral: anchor claims in the applicant's target, situation, action, decision, output, constraint, or result rather than forcing one occupation's detail pattern onto every role.
8. Remove application-specific formulaic prose and self-introduction cliches, but keep a professional Korean register.
9. Stay within the stated length limit. If unclear, target 90-98 percent of the maximum.
10. Surface residual risks briefly: missing evidence, uncertain length-counting rule, weak JD match, or possible fabrication risk.

## References

Load only what is needed:

- `references/intake-schema.md`: parsing pasted JD, prompt, length, and draft.
- `references/jd-parser-rules.md`: extracting company, role, responsibilities, requirements, skills, and values.
- `references/question-taxonomy.md`: classifying application prompt types and required answer elements.
- `references/field-writing-rules.md`: practical writing principles distilled from recruiter/career-coach guidance.
- `references/diagnosis-taxonomy.md`: detecting weak draft issues.
- `references/application-naturalness-rules.md`: Korean rules for reducing formulaic, AI-like application prose in 자기소개서 drafts.
- `references/rewrite-playbook.md`: rewrite planning and final prose patterns.
- `references/audit-checklist.md`: factual, length, prompt, JD, and submission checks.
- `scripts/count_korean_length.py`: deterministic length and byte counting.

## Workflow

### Phase 0: Intake

1. Split the user paste into JD, application prompt, length rule, and draft.
2. If the user supplied a file path, read only the referenced file.
3. If parts are unlabeled, infer by markers:
   - JD: "주요업무", "담당업무", "자격요건", "우대사항", "전형", "근무지", "Responsibilities", "Requirements".
   - Prompt: question form, "작성해 주세요", "기술해 주세요", "지원동기", "입사 후 포부".
   - Length: "자 이내", "byte", "공백 포함", "공백 제외", "내외".
   - Draft: first-person narrative, "저는", "제가", prior essay paragraphs.
4. Store an internal intake object with confidence. Ask only if confidence is too low to safely proceed.

### Phase 1: JD Parse

Use `jd-parser-rules.md`.

Extract:

- company and role, if present
- responsibilities
- requirements
- preferred qualifications
- skills/tools/domain terms
- attitudes and values

Weight evidence matching in this order:

```text
responsibilities > requirements > skills/domain > preferred > values
```

### Phase 2: Prompt Classification

Use `question-taxonomy.md`.

Classify the prompt into one or more types:

- 지원동기
- 직무역량
- 경험/성과
- 협업/갈등
- 실패/극복
- 성격 장단점
- 성장과정/가치관
- 입사 후 포부
- 자유문항

Derive the mandatory answer elements for the type.

### Phase 3: Diagnose

Use `diagnosis-taxonomy.md` and `application-naturalness-rules.md`.

Detect:

- prompt not answered
- weak JD connection
- vague traits without evidence
- situation-heavy story with little action/result
- unclear personal contribution
- JD keyword stuffing or role-jargon overfit
- abstract promise without a concrete next action
- cliche application language
- fabricated or unsupported claim risk
- application-specific formulaic prose
- length or blind-hiring risks

### Phase 4: Rewrite Plan

Choose a structure before rewriting:

```text
one-sentence answer
→ concrete experience
→ user's specific action
→ result or change
→ JD relevance
→ contribution or learning, only if the prompt needs it
```

Before writing, choose the right concreteness anchors for the role. Examples include stakeholder/customer/user, repeated problem, work context, user's decision, process step, deliverable, document, experiment, campaign, operation, metric, qualitative change, or risk handled. Use field-specific artifacts only when the JD and draft make them relevant.

If the draft lacks evidence, keep the revision conservative and add a short note asking for missing evidence instead of fabricating.

### Phase 5: Rewrite

Use `rewrite-playbook.md`.

Rewrite the essay as final submission prose, not a tutorial. Do not expose STAR labels. Make paragraphs readable and natural. Use subtitles only when the prompt or company form benefits from them.

### Phase 6: Naturalness Pass

Use `application-naturalness-rules.md`.

Remove cliches, generic company praise, mechanical STAR, repetitive connectors, translationese, exaggerated emotion, and empty future ambition. Preserve factual meaning and professional tone.

### Phase 7: Audit

Use `audit-checklist.md`.

Run:

- factual fidelity check
- prompt answer check
- JD match check
- length check with `scripts/count_korean_length.py` when a limit exists
- fabrication risk check
- blind-hiring/submission risk check when relevant

Revise once if any hard failure appears. If unresolved, report the risk clearly.

## Final Response

Default response:

```text
[최종 제출본]

글자수: N/M자 (기준: 공백 포함|공백 제외|byte|불명확)

수정 요약:
- ...
- ...
- ...

확인 필요:
- ...
```

Keep the summary short. If there is no important residual risk, omit `확인 필요`.

For strict analysis requests, add a compact diagnosis table before the final essay.
