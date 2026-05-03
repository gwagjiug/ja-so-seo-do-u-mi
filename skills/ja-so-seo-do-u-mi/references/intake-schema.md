# Intake Schema

Use this reference to parse messy user input into a stable internal contract.

## Minimal Input

The skill should work when the user provides only:

- 채용공고/JD
- 자소서 문항
- 글자수 제한
- 초안

Do not require company name, role name, desired tone, or extra experience unless the provided text is too ambiguous to continue.

## Internal Object

```json
{
  "jd_text": "",
  "prompt_text": "",
  "length_rule": {
    "raw": "",
    "limit_type": "max|min|max_min|approx|unknown",
    "max": null,
    "min": null,
    "unit": "chars|bytes|words|unknown",
    "count_spaces": "include|exclude|unknown",
    "target": ""
  },
  "draft_text": "",
  "company": null,
  "role": null,
  "constraints": [],
  "confidence": {
    "jd": "high|medium|low",
    "prompt": "high|medium|low",
    "length": "high|medium|low",
    "draft": "high|medium|low"
  }
}
```

## Parsing Heuristics

### JD

JD markers include:

- 채용공고, JD, 직무소개, 모집부문
- 주요업무, 담당업무, 수행업무
- 자격요건, 필수요건, 지원자격
- 우대사항, 이런 분이면 좋아요
- 기술스택, 사용 툴, 필요 역량
- Responsibilities, Requirements, Preferred, Qualifications

### Prompt

Prompt markers include:

- 지원동기, 입사 후 포부, 직무역량, 성장과정
- 경험을 기술, 사례를 들어, 서술해 주세요, 작성해 주세요
- 물음표 or instruction sentence under an application section

### Length

Length markers include:

- `700자 이내`, `1000자 이하`, `800자 내외`
- `최소 500자 이상 최대 1000자 이하`
- `공백 포함`, `공백 제외`
- `byte`, `바이트`, `한글 3byte`

Default assumptions:

- `이내` and `이하`: hard maximum.
- `내외`: target 90-100 percent unless the platform is known to allow overflow.
- If space rule is unknown, report `기준: 공백 포함 추정` and stay safely below the maximum.

### Draft

Draft markers include first-person Korean essay prose, often starting with:

- 저는
- 제가
- 저의
- 대학 시절
- 프로젝트에서
- 인턴 기간

## Clarifying Questions

Ask only when:

- no prompt exists
- no draft exists for a revision request
- no length exists and user explicitly asks to fit a limit
- multiple prompts and one draft cannot be mapped
- the draft includes unsupported claims that would require confirmation

Use one short question, not a large form.
