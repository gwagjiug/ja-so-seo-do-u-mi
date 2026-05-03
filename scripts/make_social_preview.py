"""Generate social preview image for ja-so-seo-do-u-mi.

Size: 1280x640.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "social-preview.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = 1280, 640
BG = (248, 247, 243)
INK = (28, 32, 38)
MUTED = (105, 111, 122)
LINE = (221, 218, 208)
BAD = (184, 72, 62)
GOOD = (43, 106, 84)
PANEL = (255, 255, 255)
SOFT = (238, 241, 235)

FONT_CANDIDATES = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/Library/Fonts/AppleGothic.ttf",
    str(Path.home() / "Library/Fonts/Pretendard-Regular.otf"),
]


def font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES:
        path = Path(candidate)
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for token in text.split():
        trial = token if not current else f"{current} {token}"
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = token
    if current:
        lines.append(current)
    return lines


def text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int,
) -> int:
    x, y = xy
    for line in wrap(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

title_f = font(74)
sub_f = font(28)
label_f = font(20)
body_f = font(27)
small_f = font(21)
metric_f = font(40)

d.text((72, 48), "ja-so-seo-do-u-mi", font=title_f, fill=INK)
d.text((76, 132), "JD 기반 자소서 도우미", font=sub_f, fill=MUTED)

d.rounded_rectangle((72, 190, 594, 466), radius=18, fill=PANEL, outline=LINE, width=2)
d.rounded_rectangle((686, 190, 1208, 466), radius=18, fill=PANEL, outline=LINE, width=2)

d.text((104, 220), "BEFORE", font=label_f, fill=BAD)
d.text((718, 220), "AFTER", font=label_f, fill=GOOD)

before = (
    "저는 책임감과 소통 능력을 바탕으로 팀 프로젝트를 성공적으로 수행했습니다. "
    "이를 통해 문제해결력을 길렀고, 입사 후 귀사에 기여하겠습니다."
)
after = (
    "일정 지연이 반복되자 역할별 체크리스트를 만들고 누락 업무를 확인했습니다. "
    "마감 전 결과물을 제출했고, 이 경험을 JD의 업무 조율과 진행 관리에 적용하겠습니다."
)

text_block(d, (104, 258), before, body_f, INK, 438, 10)
text_block(d, (718, 258), after, body_f, GOOD, 438, 10)

d.text((620, 296), "→", font=font(52), fill=MUTED)

d.line((72, 502, 1208, 502), fill=LINE, width=2)

d.text((76, 526), "4 inputs", font=metric_f, fill=INK)
d.text((76, 574), "JD · 문항 · 글자수 · 초안", font=small_f, fill=MUTED)

d.text((350, 526), "7 phases", font=metric_f, fill=INK)
d.text((350, 574), "파싱 → 진단 → 재작성 → 감사", font=small_f, fill=MUTED)

d.text((696, 526), "No fabrication", font=metric_f, fill=GOOD)
d.text((696, 574), "없는 경험·수치·기술 추가 금지", font=small_f, fill=MUTED)

d.rounded_rectangle((1056, 526, 1208, 588), radius=31, fill=GOOD)
d.text((1094, 539), "v0.1", font=font(28), fill=(255, 255, 255))

img.save(OUT, "PNG", optimize=True)
print(f"saved: {OUT} ({OUT.stat().st_size // 1024} KB)")
