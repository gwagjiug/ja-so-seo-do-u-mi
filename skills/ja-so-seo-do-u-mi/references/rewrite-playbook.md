# Rewrite Playbook

Use this when turning the diagnosis into final submission prose.

## Default Structure

```text
Answer thesis
→ evidence experience
→ user's action
→ result/change
→ JD relevance
→ contribution/learning if needed
```

Do not show labels like Situation, Task, Action, Result.

## Concreteness Anchors

Every main paragraph should contain concrete anchors that make the claim interview-safe. Choose anchors that fit the role instead of forcing a single pattern.

Usable anchors:

- target: customer, user, colleague, team, student, partner, candidate, patient, operator, reader
- context: recurring problem, request, bottleneck, complaint, deadline, risk, constraint
- action: what the applicant checked, changed, organized, tested, wrote, explained, proposed, negotiated, built, measured, or followed up on
- output: document, checklist, report, proposal, campaign, prototype, guide, dashboard, experiment, class, process, policy, content, code, design
- evidence: number from draft, before/after change, feedback, adoption, reduced repetition, faster handoff, clearer decision, fewer errors

Do not require all anchors. Use enough to keep the paragraph grounded. Field-specific artifacts are valid only when the user supplied that angle.

## Anti-Abstractness Rule

Do not end a paragraph with only `개선하겠습니다`, `기여하겠습니다`, or `성장하겠습니다`. Replace it with one realistic first action or contribution area.

Weak:

```text
입사 후 데이터 기반으로 업무를 개선하겠습니다.
```

Better:

```text
입사 후에는 반복 문의와 이탈 지점을 먼저 정리해, 어디에서 설명이 부족한지 확인하는 일부터 시작하겠습니다.
```

Adapt the same rule to the field: customer conversation, campaign planning, operating process, quality check, teaching material, research note, sales proposal, internal documentation, or another work output grounded in the draft.

## Transformations

| Weak draft                 | Rewrite direction                                           |
| -------------------------- | ----------------------------------------------------------- |
| 저는 책임감이 강합니다     | 책임감을 보여준 concrete action                             |
| 소통을 중시합니다          | what the user clarified, aligned, documented, or negotiated |
| 문제를 해결했습니다        | what problem, what hypothesis, what action, what changed    |
| 팀 프로젝트를 성공했습니다 | user's role inside the team result                          |
| 귀사에 기여하겠습니다      | JD-based first contribution                                 |
| 성장하고 싶습니다          | specific capability to build through the role               |
| 도구/방법론으로 개선하겠습니다 | role-specific problem, target, action, and output       |

## Length Strategy

When over limit:

1. delete company praise
2. delete duplicate reflection
3. shorten background
4. combine sentences
5. keep action and result

When under target:

1. add user action detail from draft
2. add JD relevance from available JD
3. add reflection only if prompt needs it
4. do not add new facts

## Tone

Default tone:

- professional
- concrete
- modestly confident
- not literary
- not over-formal
- not casual

Avoid:

- excessive slogans
- emotional drama
- "AI consultant" business prose
- fake humility

## Subtitles

Use subtitles only when:

- the application field supports line breaks
- the answer is long enough to benefit
- the subtitle states evidence, not a slogan

Good:

```text
반복 지연을 줄인 일정 관리
```

Bad:

```text
도전을 향한 끝없는 열정
```

## Missing Evidence

If the draft lacks required evidence:

- produce the best conservative revision
- add a short `확인 필요` note
- never fill the gap with invented numbers or experiences
