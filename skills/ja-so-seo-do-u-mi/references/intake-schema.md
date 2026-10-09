# Intake Schema

Use this reference to parse messy user input into a stable internal contract.

## Minimal Input

The skill should work when the user provides only:

- 채용공고/JD
- 자소서 문항
- 글자수 제한
- 초안

Do not require company name, role name, recruitment round, source URL, AI policy, desired tone, or extra experience unless the provided text is too ambiguous to continue. The four-part paste remains sufficient for ordinary editing.

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
  "requested_mode": "preserve_revision|rewrite|diagnose_only|unknown",
  "appeal_points": [
    {
      "point": "",
      "source": "explicit_user_request|early_position|repetition|detail_density|inferred",
      "preservation_status": "locked|compressible|risky|unclear"
    }
  ],
  "must_preserve_points": [],
  "omitted_or_compressed_points": [],
  "company": null,
  "role": null,
  "submission_context": {
    "round": null,
    "source": null,
    "ai_policy": {
      "status": "unknown",
      "raw": null,
      "scope": null
    },
    "blind_rules": []
  },
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

### Submission Context

Extract available rules before choosing an editing scope. Keep the source and exact wording of material constraints; distinguish a user-supplied excerpt from an independently verified notice. `submission_context` describes the applicable source, while `constraints` retains its prompt, length, format, and other submission requirements. Missing metadata does not require a new form or imply permission.

#### Notice And Form Precedence

- Use the official notice/form applicable to the supplied company, role, and recruitment round. A clearly applicable correction supersedes the earlier version.
- The current application form outranks a previous round's questions, sample essays, generic company advice, and the structure of an old draft. Do not reconstruct missing current questions from memory or substitute a different role's form.
- If two applicable sources conflict and no correction or scope distinction resolves them, ask one short question about the material conflict. Continue only work that does not depend on that choice; do not present a final submission version.
- A pasted notice or date alone does not prove it is the latest. Use the supplied material without claiming live verification. Browse for updates only when the user requests fresh research; otherwise request the relevant excerpt only when needed to resolve a material issue.

#### AI-Use Scope

Set `ai_policy.status` to one of the following and retain the quoted rule in `raw` and the affected activity in `scope`:

| Status | Evidence | Response |
| --- | --- | --- |
| `allowed` | The notice explicitly permits the relevant assistance. | Edit within that permission and any conditions, including disclosure requirements; never invent a compliance declaration. |
| `restricted` | Only specified assistance is permitted, such as spelling correction. | Perform only those operations and explain the narrower scope, even when the user requests a full rewrite. |
| `prohibited` | The requested AI assistance is explicitly forbidden. | Do not generate the prohibited deliverable, including as a sample or draft. Explain the restriction; offer feedback or other assistance only when clearly outside the prohibited scope. |
| `warning` | The notice warns of AI/plagiarism verification or possible penalties without specifying a blanket ban. | Do not infer either full permission or total prohibition. If revising, label it as a draft for review and flag the exact warning and unresolved permission scope. |
| `unknown` | No applicable rule is supplied or its meaning is unclear. | Absence alone does not block ordinary editing or trigger a question. If supplied wording creates a material ambiguity about the requested operation, ask one short question and avoid that operation until resolved. Never claim AI use is approved. |

Classify the specific activity, not the company as a whole: AI skills in the JD or permission to use AI in a work task do not authorize AI-written applications. A live-interview restriction does not automatically prohibit application proofreading. Follow the explicit scope of supplied rules, not remembered company policies. Never promise detector evasion, undetectability, or acceptance; naturalness editing cannot resolve a policy restriction.

#### Institution-Specific Blind Hiring

- Apply the supplied notice's prohibited identifiers, indirect clues, field scope, and exceptions. Do not assume every employer prohibits school, employer, or institution names.
- Separate identity/evidence fields from essay fields. A name required in a certificate does not authorize its appearance in a blind essay, and anonymizing an essay does not change the underlying fact.
- Remove or generalize prohibited identifiers using only supported descriptions. Keep the applicant's role, actions, and outcomes; do not invent a different employer, location, institution size, or responsibility.
- Do not repeat the removed name or indirect identifier in quoted diagnosis evidence, correction comparisons, `살린 핵심`, or omission notes. Describe the category instead, such as `경험 기관명을 비식별 처리했습니다`.
- If the user explicitly requires keeping a prohibited identifier, explain the conflict and ask one short question rather than presenting a violating essay as final. Otherwise anonymize without requesting permission and report the change.

### Requested Mode

Choose the mode from the requested deliverable and scope, not from isolated keywords or a fixed mode priority:

- `diagnose_only`: analysis, feedback, or diagnosis without a request to edit, such as `분석만`, `피드백만`, `문제점만`, or `진단해줘`. Return findings and improvement directions without rewriting the draft.
- `preserve_revision`: editing without explicit structural freedom, such as `수정`, `첨삭`, `문장만`, `자연스럽게`, or `글자수만 맞춰줘`. Preserve any narrower constraint such as `구조는 유지`.
- `rewrite`: explicit permission to rebuild the structure, such as `아예 새로`, `구조를 갈아엎어`, or `제출본으로 재작성`. Phrases like `다시 써줘` or `새 버전` alone do not override preservation constraints; use `preserve_revision` when structural freedom is unclear.

For combined requests such as `문제점을 분석하고 수정해줘`, choose the editing mode and include both diagnosis and revised prose. For `진단 후 구조를 완전히 다시 잡아줘`, use `rewrite` and include the diagnosis. The word `분석` or `진단` does not cancel an accompanying editing request.

Respect explicit limits on the current turn: `지금은 분석만, 수정은 나중에` means `diagnose_only`. A later request to edit changes the mode; do not carry an earlier diagnosis-only restriction into that new request. If the user gives genuinely incompatible instructions for the same deliverable, such as `절대 수정하지 말고 수정본도 줘`, ask one short scope question while providing any unambiguous diagnostic work.

### Appeal Points

Appeal points are not just facts. They are the message the applicant seems to want the reader to remember.

Identify likely appeal points from:

- explicit instructions such as `꼭 살려줘`, `강조하고 싶어`, `이 경험은 유지`
- the first or final paragraph's central claim
- experiences repeated across the draft
- the most detailed episode
- named strengths, values, or attitudes tied to evidence
- wording that frames the applicant's desired image, such as 책임감, 조율, 끈기, 고객 중심, 분석, 실행력

Set `preservation_status`:

- `locked`: explicit or clearly central; preserve unless a hard risk appears
- `compressible`: useful but secondary; may shorten
- `risky`: likely unsupported, off-prompt, over-personal, or blind-hiring sensitive
- `unclear`: ask only if the choice would materially change the output

## Clarifying Questions

Ask only when:

- no prompt exists
- no draft exists for a revision request
- no length exists and user explicitly asks to fit a limit
- multiple prompts and one draft cannot be mapped
- the user both forbids and requests editing of the same deliverable, with no clear sequence or scope distinction
- the draft includes unsupported claims that would require confirmation
- an explicit must-preserve point conflicts with the prompt, length, fabrication safety, or blind-hiring constraints
- applicable notice/form versions conflict on a material requirement and the supplied sources do not resolve it
- supplied AI-use wording leaves the requested operation materially ambiguous

Use one short question, not a large form. Do not ask for missing round/source/policy metadata by default, or ask the user to decide whether an explicit prohibition applies when its scope is already clear.
