# Intent Preservation Evals

Use these manual scenarios after changing the `ja-so-seo-do-u-mi` skill. The goal is to catch regressions where the final essay reads better but silently drops what the user wanted to appeal.

## Acceptance Checklist

Each scenario passes only if the output satisfies all items:

- answers the application prompt
- preserves user-provided facts
- preserves or reports locked appeal points
- stays within the requested length rule when one is provided
- does not add unprovided numbers, tools, awards, or achievements
- includes `축약/생략한 부분` when a locked appeal point is heavily compressed or omitted

## Scenario 1: Sentence-Only Revision

Prompt:

```text
자소서 문장만 자연스럽게 다듬어줘. 구조는 크게 바꾸지 말아줘.

채용공고/JD:
고객 문의 응대, VOC 정리, 내부 부서와 이슈 조율

자소서 문항:
협업 경험을 작성해 주세요. 700자 이내.

글자수:
700자 이내, 공백 포함

초안:
저는 카페 아르바이트를 하면서 손님 불만을 듣고 점장님과 직원 사이에서 조율한 경험을 꼭 살리고 싶습니다. 바쁜 시간대에 음료가 늦어져 손님 항의가 반복됐고, 저는 주문이 밀리는 구간을 직원들에게 공유했습니다. 이후 제조 담당과 주문 담당이 서로 상황을 알 수 있도록 메모를 남겼습니다. 이 경험으로 소통의 중요성을 느꼈습니다.
```

Pass criteria:

- 카페 아르바이트, 손님 불만, 점장/직원 조율 경험이 남아야 한다.
- 임의로 사무직 VOC 프로젝트처럼 바꾸면 실패다.

## Scenario 2: JD Fit Without Replacing Strength

Prompt:

```text
채용공고에 맞게 자소서 수정해줘. 저는 꼼꼼함보다 사람 사이 조율을 강조하고 싶어.

채용공고/JD:
문서 검토, 운영 데이터 정리, 협업 부서 요청 처리

자소서 문항:
직무 역량을 보여준 경험을 작성해 주세요. 800자 이내.

글자수:
800자 이내

초안:
동아리 행사 준비 중 디자인팀과 운영팀의 일정이 맞지 않아 갈등이 생겼습니다. 저는 양쪽이 놓친 일정을 표로 정리하고 회의 전에 먼저 공유했습니다. 이후 서로 필요한 자료와 마감일을 다시 맞춰 행사를 마무리했습니다. 이 경험을 통해 의견이 다를 때 기준을 정리해 조율하는 태도가 제 강점이라고 생각했습니다.
```

Pass criteria:

- 최종본의 중심 강점은 문서 검토/데이터 정리보다 조율이어야 한다.
- JD의 문서/운영 요소는 조율을 뒷받침하는 보조 근거로만 쓰여야 한다.

## Scenario 3: 700 Characters With Omission Reporting

Prompt:

```text
700자 안에 맞춰줘. 봉사활동에서 배운 책임감은 꼭 살려줘.

채용공고/JD:
매장 운영 지원, 고객 응대, 재고 확인

자소서 문항:
본인의 강점과 이를 발휘한 경험을 작성해 주세요.

글자수:
700자 이내, 공백 포함

초안:
저는 책임감을 강점으로 갖고 있습니다. 대학교 봉사활동에서 매주 도시락을 포장하고 전달하는 일을 맡았습니다. 초반에는 포장 수량과 전달 명단을 따로 확인해 시간이 오래 걸렸지만, 제가 명단 확인 순서를 바꾸고 포장 완료 표시를 남기자 누락을 줄일 수 있었습니다. 이 경험은 제가 맡은 일을 끝까지 확인하는 태도를 갖게 했습니다. 또 카페 아르바이트에서는 신메뉴 안내 문구를 직접 정리해 손님 질문에 대응했습니다. 입사 후에는 고객 응대와 운영 지원 업무에 빠르게 적응해 회사와 함께 성장하겠습니다.
```

Pass criteria:

- 책임감과 봉사활동 경험은 남아야 한다.
- 카페 아르바이트가 빠지거나 크게 줄어들면 `축약/생략한 부분`에 이유가 있어야 한다.

## Scenario 4: Cliche Removal Without Intent Loss

Prompt:

```text
AI 티 안 나게 고쳐줘.

채용공고/JD:
교육 콘텐츠 운영, 수강생 문의 응대, 학습 자료 개선

자소서 문항:
지원동기를 작성해 주세요. 600자 이내.

글자수:
600자 이내

초안:
저는 교육을 통해 사람의 가능성을 넓히는 일에 관심이 많습니다. 대학 시절 후배에게 과제 작성 방법을 설명해주며 상대가 막히는 지점을 파악하는 과정이 중요하다는 것을 느꼈습니다. 귀사의 혁신적인 교육 서비스에 깊은 감명을 받았고, 입사 후 빠르게 성장하여 기여하겠습니다.
```

Pass criteria:

- `깊은 감명`, `성장하여 기여`는 자연스럽게 바뀌어야 한다.
- 교육을 통해 사람의 가능성을 넓히고 싶다는 동기는 사라지면 실패다.

## Scenario 5: No New Facts

Prompt:

```text
직무역량 문항으로 더 설득력 있게 다듬어줘.

채용공고/JD:
SQL 활용 가능자 우대, 데이터 기반 문제 분석, 리포트 작성

자소서 문항:
직무 관련 역량을 작성해 주세요. 800자 이내.

글자수:
800자 이내

초안:
수업 프로젝트에서 설문 응답을 엑셀로 정리하고 항목별 응답 경향을 비교했습니다. 저는 중복 응답을 확인하고 기준이 다른 답변을 같은 형식으로 맞췄습니다. 이후 조원들이 발표 자료를 만들 때 보기 쉽게 표로 정리했습니다.
```

Pass criteria:

- SQL, Python, 통계 모델, 대시보드처럼 초안에 없는 도구를 추가하면 실패다.
- 엑셀 정리와 기준 통일 경험만으로 직무 연결을 만들어야 한다.

## Scenario 6: Explicit Rewrite Mode

Prompt:

```text
구조를 완전히 다시 잡아서 제출본으로 재작성해줘. 다만 고객 입장에서 생각한 경험은 살려줘.

채용공고/JD:
서비스 운영, 고객 문의 분석, 개선안 제안

자소서 문항:
문제 해결 경험을 작성해 주세요. 900자 이내.

글자수:
900자 이내

초안:
편의점 아르바이트를 하면서 행사 상품 위치를 묻는 손님이 많았습니다. 처음에는 매번 안내만 했지만, 손님 입장에서 찾기 어려운 위치라는 생각이 들었습니다. 그래서 점장님께 행사 상품 위치 안내 문구를 계산대 옆에 두자고 제안했습니다. 이후 같은 질문이 줄었고, 저는 고객 입장에서 문제를 보는 태도가 중요하다고 느꼈습니다.
```

Pass criteria:

- 구조 변경은 허용된다.
- 고객 입장에서 생각한 경험은 중심에 남아야 한다.
- 편의점 경험이 일반적인 서비스 개선 프로젝트로 과장되면 실패다.
