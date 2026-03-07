"""
Generate logo.png for LevantACARS using the same design as favicon.
"""
from PIL import Image, ImageDraw, ImageFont
import math
import os

def main():
    out_dir = os.path.join(os.path.dirname(__file__), 'LevantACARS', 'Assets')
    os.makedirs(out_dir, exist_ok=True)
    logo_path = os.path.join(out_dir, 'logo.png')

    S = 1024
    cx, cy = S // 2, S // 2
    canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    NAVY = (10, 22, 40, 255)
    GOLD = (212, 175, 55, 255)

    # Outer gold ring
    ring_r = 496
    draw.ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r], outline=GOLD, width=12)
    draw.ellipse([cx-476, cy-476, cx+476, cy+476], outline=(212,175,55,100), width=4)
    # Navy fill
    draw.ellipse([cx-460, cy-460, cx+460, cy+460], fill=NAVY)
    # Inner ring
    draw.ellipse([cx-440, cy-440, cx+440, cy+440], outline=(212,175,55,38), width=2)

    # Aircraft polygons (rotated -35 degrees)
    def rp(px, py, a=-35):
        rad = math.radians(a)
        dx, dy = px*2 - cx, py*2 - cy
        return (cx + dx*math.cos(rad) - dy*math.sin(rad),
                cy + dx*math.sin(rad) + dy*math.cos(rad))

    def rpoly(pts, a=-35):
        return [rp(x, y, a) for x, y in pts]

    # Fuselage
    draw.polygon(rpoly([(110,270),(140,258),(200,252),(380,240),(445,230),
                         (455,222),(410,220),(200,238),(130,252),(110,270)]), fill=GOLD)
    # Wings
    draw.polygon(rpoly([(210,255),(160,330),(165,338),(280,260)]), fill=GOLD)
    draw.polygon(rpoly([(280,240),(340,170),(336,162),(230,232)]), fill=GOLD)
    # Tail
    draw.polygon(rpoly([(120,268),(95,230),(98,218),(140,258)]), fill=GOLD)
    # Stabilizers
    draw.polygon(rpoly([(125,262),(88,240),(85,245),(125,268)]), fill=(212,175,55,216))
    draw.polygon(rpoly([(125,272),(90,290),(90,294),(135,276)]), fill=(212,175,55,216))
    # Engines
    for ecx, ecy in [(202,282),(317,232)]:
        draw.polygon(rpoly([(ecx-12,ecy-10),(ecx+12,ecy-10),(ecx+12,ecy+10),(ecx-12,ecy+10)]), fill=GOLD)

    # Swoosh
    for t in range(200):
        f = t / 200.0
        x, y = 60+f*420, 400-120*f+20*math.sin(f*math.pi)
        r = max(1, int(3*(1-f)))
        draw.ellipse([x*2-r, y*2-r, x*2+r, y*2+r], fill=(212,175,55, int(50*(1-f))))

    # Text
    try:
        font = ImageFont.truetype("arial.ttf", 56)
        font_sm = ImageFont.truetype("arial.ttf", 28)
    except:
        font = ImageFont.load_default()
        font_sm = font

    bb = draw.textbbox((0,0), "LEVANT", font=font)
    draw.text((cx-(bb[2]-bb[0])//2, S-220), "LEVANT", fill=GOLD, font=font)
    bb2 = draw.textbbox((0,0), "VIRTUAL AIRLINES", font=font_sm)
    draw.text((cx-(bb2[2]-bb2[0])//2, S-155), "VIRTUAL AIRLINES", fill=(212,175,55,128), font=font_sm)

    # Star
    star_pts = []
    for i in range(10):
        a = math.radians(-90 + i*36)
        r = 24 if i%2==0 else 10
        star_pts.append((cx+r*math.cos(a), 96+r*math.sin(a)))
    draw.polygon(star_pts, fill=(212,175,55,153))

    # Circular mask
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r], fill=255)
    canvas.putalpha(mask)

    # Resize to 512x512 for logo.png
    logo = canvas.resize((512, 512), Image.LANCZOS)
    logo.save(logo_path, format='PNG', optimize=True)
    
    sz = os.path.getsize(logo_path)
    print(f"Created logo.png: {logo_path}")
    print(f"Size: {sz:,} bytes ({sz/1024:.1f} KB)")

if __name__ == '__main__':
    main()
