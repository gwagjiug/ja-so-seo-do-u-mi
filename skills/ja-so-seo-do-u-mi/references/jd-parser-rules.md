# JD Parser Rules

Extract the job target and evidence priorities from pasted 채용공고/JD text.

## Output Shape

```json
{
  "company": null,
  "role": null,
  "responsibilities": [],
  "requirements": [],
  "preferred": [],
  "skills": [],
  "domain_terms": [],
  "values": [],
  "submission_constraints": []
}
```

## Section Mapping

| Raw marker                                       | Field                  |
| ------------------------------------------------ | ---------------------- |
| 주요업무, 담당업무, 수행업무, Responsibilities   | responsibilities       |
| 자격요건, 필수요건, Requirements, Qualifications | requirements           |
| 우대사항, Preferred, 이런 경험이면 좋아요        | preferred              |
| 기술스택, Skills, 사용 툴                        | skills                 |
| 인재상, 핵심가치, Culture, 일하는 방식           | values                 |
| 제출서류, 유의사항, 블라인드, 글자수             | submission_constraints |

## Matching Priority

When rewriting, prefer linking the draft to JD items in this order:

1. Responsibilities: what the person will actually do.
2. Requirements: what the company says the candidate must have.
3. Skills/domain terms: tools, data, customers, product, process, regulation, market.
4. Preferred: useful only when supported by the draft.
5. Values: use sparingly; avoid generic culture parroting.

## JD Fit Rules

- A JD keyword should not be inserted unless the draft has a plausible supporting experience.
- Prefer one strong JD connection over many shallow keyword mentions.
- Do not overfit to company slogans. Hiring readers usually care more about job evidence.
- For junior candidates, translate JD terms into adjacent experience rather than pretending direct professional mastery.
- If company or role is absent, infer from the JD only when confidence is high; otherwise leave it generic.

## JD Overfit Guard

The JD explains what the reader is likely evaluating. It is not a list of words to paste into the essay.

When connecting a draft to the JD:

- Extract the work expectation behind the JD term.
- Keep the applicant's actual experience as the center of the sentence.
- Use at most a few high-signal JD terms, only where they clarify fit.
- Avoid making technology, tools, or methods the subject unless the draft already shows the applicant used them.
- For non-technical roles, connect to role-specific work such as customers, channels, documents, operations, analysis, quality, compliance, negotiation, education, or service delivery.
- For technical roles, still lead with the user or work problem before naming implementation tools.

Good JD connection:

```text
고객 문의가 반복되는 원인을 유형별로 정리하고 안내 기준을 바꾼 경험은, JD에서 요구하는 운영 이슈 파악과 프로세스 개선 업무와 맞닿아 있습니다.
```

Weak JD overfit:

```text
입사 후 데이터 기반으로 고객 중심 프로세스를 혁신하고 협업 툴을 활용해 비즈니스 임팩트를 만들겠습니다.
```

## Common Risk

Do not turn preferred qualifications into claimed experience. If a JD says "SQL 우대" and the draft never mentions SQL, do not add SQL proficiency.
