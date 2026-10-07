# Mode Routing Evals

Use these manual scenarios after changing mode selection or response routing. Each single-turn request below should be paired with the shared input. Evaluate the actual deliverable and editing scope, not exact wording or heading names.

## Shared Input

```text
채용공고/JD:
고객 문의 응대, VOC 정리, 내부 부서와 이슈 조율

자소서 문항:
협업 경험을 작성해 주세요.

글자수:
700자 이내, 공백 포함

초안:
저는 카페 아르바이트에서 소통의 중요성을 배웠습니다. 바쁜 시간대에 음료가 늦어져 손님 항의가 반복됐습니다. 저는 주문이 밀리는 구간을 직원들에게 공유했습니다. 이후 제조 담당과 주문 담당이 서로 상황을 알 수 있도록 메모를 남겼습니다. 이 경험으로 소통의 중요성을 느꼈습니다.
```

## Scenarios

| Request | Expected behavior |
| --- | --- |
| `문제점만 진단해줘. 수정본은 쓰지 마.` | Identify weaknesses with draft evidence and improvement directions. Do not supply replacement sentences or an edited essay. |
| `이 자소서 진단해줘.` | Provide diagnosis without assuming permission to rewrite. |
| `문제점을 분석하고 문장만 다듬어줘. 구조는 유지해줘.` | Provide both diagnosis and revised prose, preserving the episode order and structural scope. Do not stop after diagnosis or ask whether to edit. |
| `진단한 다음 구조를 완전히 다시 잡아서 제출본으로 재작성해줘.` | Provide diagnosis and a rewritten essay; structural freedom is permitted, factual invention is not. |
| `다시 써줘. 다만 구조와 경험은 그대로 두고 문장만 자연스럽게 해줘.` | Provide revised prose within the sentence-only constraint; `다시 써줘` must not trigger unrestricted restructuring. |
| `나중에는 재작성할 건데 지금은 분석만 해줘.` | Diagnose only in this turn despite the mention of future rewriting. |
| `절대 수정하지 말고 수정본도 줘.` | Ask one concise scope question and provide any unambiguous diagnosis; do not silently choose either conflicting editing instruction. |

## Follow-up Scenario

1. With the shared input, request `지금은 피드백만 줘. 수정은 나중에 할게.`
2. After receiving feedback, request `이제 그 피드백을 반영해서 문장을 수정해줘.`

Pass only if the first response contains feedback without rewritten prose and the second contains the revised essay without asking again for editing permission. The earlier diagnosis-only restriction must not block the new request.

## Shared Acceptance Criteria

- All findings and edits remain grounded in the supplied facts; no new results or responsibilities are invented.
- Editing outputs preserve the cafe experience and coordination appeal and fit the 700-character rule.
- Diagnostic outputs are not mislabeled as a final essay. Any reported character count refers to the original draft; the 700-character essay limit does not constrain the feedback itself.
