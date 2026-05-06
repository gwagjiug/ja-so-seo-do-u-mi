# Audit Checklist

Run this before final response.

## Hard Failures

- final text exceeds hard length limit
- company name, role, number, date, tool, award, or institution is changed incorrectly
- unprovided achievement, number, technical skill, or responsibility is added
- prompt is not answered
- wrong company/JD facts are inserted
- final answer relies on unsupported JD jargon instead of the applicant's evidence
- a locked user appeal point is removed or replaced without reporting why
- blind-hiring prohibited personal data appears when relevant

If a hard failure appears, revise once. If still unresolved, report it.

## Factual Fidelity

Check:

- all numbers preserved
- all company/project/institution names preserved
- periods and dates preserved
- user role not exaggerated
- team result not converted into personal result
- no new facts introduced

## User Intent Fidelity

Check:

- the final text preserves the draft's main claim or positioning
- explicit must-preserve points are present unless a hard risk required omission
- repeated, early, or highly detailed experiences from the draft are not silently dropped
- generic labels may be rewritten, but the underlying strength or value remains
- any heavily compressed or omitted appeal point is listed under `축약/생략한 부분`

## Prompt Fit

Check:

- first sentence answers the prompt
- mandatory elements for the prompt type are present
- no unrelated life chronology
- no unsupported conclusion
- no prompt-fit improvement silently changes the user's intended message

## JD Fit

Check:

- at least one responsibility or requirement is connected
- no unsupported JD keyword stuffing
- preferred qualifications are not overstated
- JD terms clarify fit instead of replacing the applicant's own evidence
- JD fit does not replace the user's chosen appeal point with a different unsupported one

## Concreteness

Check:

- main claims include role-appropriate anchors such as target, problem, action, output, decision, result, or constraint
- future plan does not stop at `개선하겠습니다`, `기여하겠습니다`, or `성장하겠습니다`
- examples are appropriate to the role; one occupation's detail pattern is not forced onto every role

## Naturalness

Check:

- no application cliches remain
- no visible STAR labels
- no repeated "이를 통해"
- no generic company praise
- no empty future ambition
- professional Korean register maintained

## Length Counting

When a length rule exists, use `scripts/count_korean_length.py` if tool execution is available.

Report the basis:

- 공백 포함 문자
- 공백 제외 문자
- UTF-8 bytes
- EUC-KR bytes
- unknown/estimated

If basis is unknown, assume spaces included and stay safely below the max.
