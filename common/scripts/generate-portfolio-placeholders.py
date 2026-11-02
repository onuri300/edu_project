from PIL import Image, ImageDraw, ImageFont
import os, random

random.seed(7)

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

def get_font(size, bold=True):
    path = FONT_PATHS[0] if bold else FONT_PATHS[1]
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def make_placeholder(path, w, h, bg, fg, label, sublabel=None, noise=True):
    img = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(img, "RGBA")

    # subtle diagonal texture lines (quiet, not decorative gradient)
    if noise:
        step = max(24, w // 22)
        for x in range(-h, w, step):
            draw.line([(x, 0), (x + h, h)], fill=(fg[0], fg[1], fg[2], 14), width=1)

    # label
    font = get_font(max(20, w // 16))
    bbox = draw.textbbox((0, 0), label, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((w - tw) / 2, (h - th) / 2 - (10 if sublabel else 0)), label, font=font, fill=fg)

    if sublabel:
        font2 = get_font(max(12, w // 40), bold=False)
        bbox2 = draw.textbbox((0, 0), sublabel, font=font2)
        tw2, th2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
        draw.text(((w - tw2) / 2, (h - th2) / 2 + th), sublabel, font=font2, fill=(fg[0], fg[1], fg[2], 200))

    # corner frame mark
    m = 18
    draw.line([(m, m), (m + 24, m)], fill=fg, width=2)
    draw.line([(m, m), (m, m + 24)], fill=fg, width=2)
    draw.line([(w - m, h - m), (w - m - 24, h - m)], fill=fg, width=2)
    draw.line([(w - m, h - m), (w - m, h - m - 24)], fill=fg, width=2)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, quality=88)

INK = (23, 23, 23)
PAPER = (250, 249, 249)
INDIGO = (43, 39, 71)
INDIGO_LIGHT = (139, 127, 209)
SAND = (219, 214, 201)
CLAY = (94, 84, 74)

base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "images", "portfolio1"))

# Hero / profile
make_placeholder(f"{base}/profile/hero.jpg", 1600, 2000, INDIGO, (237, 235, 230), "MOONLIGHT", "Personal Digital Art Gallery")
make_placeholder(f"{base}/profile/portrait.jpg", 800, 1000, SAND, INK, "PORTRAIT", "profile/portrait.jpg")

# Work01 - Moonlight (webtoon)
w1 = f"{base}/works/work01"
make_placeholder(f"{w1}/cover.jpg", 1600, 1000, INDIGO, (237, 235, 230), "MOONLIGHT", "Fantasy / Romance \u00b7 2026")
make_placeholder(f"{w1}/thumb.jpg", 900, 1100, INDIGO, (237, 235, 230), "MOONLIGHT")
make_placeholder(f"{w1}/char-yuna.jpg", 700, 900, (61, 55, 92), (237, 235, 230), "YUNA")
make_placeholder(f"{w1}/char-tae.jpg", 700, 900, (74, 66, 110), (237, 235, 230), "TAE-OH")
make_placeholder(f"{w1}/char-mira.jpg", 700, 900, (88, 78, 128), (237, 235, 230), "MIRA")
for i in range(1, 5):
    make_placeholder(f"{w1}/scene-{i}.jpg", 1400, 900, (50 + i * 6, 46 + i * 5, 84 + i * 6), (237, 235, 230), f"SCENE {i:02d}")
make_placeholder(f"{w1}/process-idea.jpg", 1000, 800, SAND, INK, "IDEA", "thumbnail sketch")
make_placeholder(f"{w1}/process-sketch.jpg", 1000, 800, (200, 195, 182), INK, "SKETCH", "line draft")
make_placeholder(f"{w1}/process-design.jpg", 1000, 800, (150, 145, 168), (250, 249, 249), "DESIGN", "flat color + tone")
make_placeholder(f"{w1}/process-final.jpg", 1000, 800, INDIGO, (237, 235, 230), "FINAL", "rendered panel")
make_placeholder(f"{w1}/before.jpg", 1000, 1250, (150, 145, 168), (250, 249, 249), "BEFORE")
make_placeholder(f"{w1}/after.jpg", 1000, 1250, INDIGO, (237, 235, 230), "AFTER")

# Work02 - illustration
w2 = f"{base}/works/work02"
make_placeholder(f"{w2}/cover.jpg", 1600, 1000, CLAY, (250, 249, 249), "DRIFTING HOURS", "Illustration \u00b7 2025")
make_placeholder(f"{w2}/thumb.jpg", 900, 1100, CLAY, (250, 249, 249), "DRIFTING HOURS")
for i in range(1, 3):
    make_placeholder(f"{w2}/scene-{i}.jpg", 1400, 900, (94 + i * 8, 84 + i * 6, 74 + i * 4), (250, 249, 249), f"DETAIL {i:02d}")

# Work03 - character design
w3 = f"{base}/works/work03"
make_placeholder(f"{w3}/cover.jpg", 1600, 1000, (58, 74, 70), (240, 238, 230), "PAPER LANTERNS", "Character Design \u00b7 2025")
make_placeholder(f"{w3}/thumb.jpg", 900, 1100, (58, 74, 70), (240, 238, 230), "PAPER LANTERNS")
for i in range(1, 3):
    make_placeholder(f"{w3}/scene-{i}.jpg", 1400, 900, (58 + i * 5, 74 + i * 4, 70 + i * 4), (240, 238, 230), f"SHEET {i:02d}")

print("done")
