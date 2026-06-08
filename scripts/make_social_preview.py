"""Generate social preview images for ja-so-seo-do-u-mi.

Size: 1280x640.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

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


def draw_preview(
    out: Path,
    *,
    title: str,
    subtitle: str,
    before: str,
    after: str,
    metric_one: str,
    metric_one_sub: str,
    metric_two: str,
    metric_two_sub: str,
    metric_three: str,
    metric_three_sub: str,
) -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    title_f = font(74)
    sub_f = font(28)
    label_f = font(20)
    body_f = font(27)
    small_f = font(21)
    metric_f = font(40)

    d.text((72, 48), title, font=title_f, fill=INK)
    d.text((76, 132), subtitle, font=sub_f, fill=MUTED)

    d.rounded_rectangle((72, 190, 594, 466), radius=18, fill=PANEL, outline=LINE, width=2)
    d.rounded_rectangle((686, 190, 1208, 466), radius=18, fill=PANEL, outline=LINE, width=2)

    d.text((104, 220), "BEFORE", font=label_f, fill=BAD)
    d.text((718, 220), "AFTER", font=label_f, fill=GOOD)

    text_block(d, (104, 258), before, body_f, INK, 438, 10)
    text_block(d, (718, 258), after, body_f, GOOD, 438, 10)

    d.text((620, 296), "→", font=font(52), fill=MUTED)

    d.line((72, 502, 1208, 502), fill=LINE, width=2)

    d.text((76, 526), metric_one, font=metric_f, fill=INK)
    d.text((76, 574), metric_one_sub, font=small_f, fill=MUTED)

    d.text((350, 526), metric_two, font=metric_f, fill=INK)
    d.text((350, 574), metric_two_sub, font=small_f, fill=MUTED)

    d.text((696, 526), metric_three, font=metric_f, fill=GOOD)
    d.text((696, 574), metric_three_sub, font=small_f, fill=MUTED)

    d.rounded_rectangle((1056, 526, 1208, 588), radius=31, fill=GOOD)
    d.text((1094, 539), "v0.2", font=font(28), fill=(255, 255, 255))

    img.save(out, "PNG", optimize=True)
    print(f"saved: {out} ({out.stat().st_size // 1024} KB)")


draw_preview(
    ASSETS / "social-preview.png",
    title="ja-so-seo-do-u-mi",
    subtitle="JD 기반 자소서 도우미",
    before=(
        "입사 후 안정적인 화면과 명확한 상태, 측정 가능한 실험을 통해 "
        "제품에 기여하고 싶습니다."
    ),
    after=(
        "입사 후에는 로그인 후 강의가 사라진 듯 느껴지는 지점을 먼저 확인하고, "
        "연결 전 안내와 자료 모아보기처럼 작은 단위부터 검증하겠습니다."
    ),
    metric_one="4 inputs",
    metric_one_sub="JD · 문항 · 글자수 · 초안",
    metric_two="8 phases",
    metric_two_sub="파싱 → 잠금 → 진단 → 감사",
    metric_three="No fabrication",
    metric_three_sub="없는 경험·수치·기술 추가 금지",
)

draw_preview(
    ASSETS / "social-preview-en.png",
    title="Jasoseo Helper",
    subtitle="JD-based Korean cover letter helper",
    before=(
        "I completed a team project with responsibility and communication skills, "
        "and I will contribute after joining."
    ),
    after=(
        "When delays repeated, I created role-based checklists and checked missing "
        "tasks daily. I will apply this to coordination work in the JD."
    ),
    metric_one="4 inputs",
    metric_one_sub="JD · Question · Limit · Draft",
    metric_two="8 phases",
    metric_two_sub="Parse → Lock → Diagnose → Audit",
    metric_three="No fabrication",
    metric_three_sub="No invented experience, numbers, or tools",
)
