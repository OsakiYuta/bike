"""Extract the supplied white-background hero, preserving white clothing.
Component exclusions are specific to this source artwork; no original is modified.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

source = Path(r'C:\Users\linch\Pictures\Bison\69ec67502096d9fee7f7f8df.webp')
root = Path(__file__).resolve().parents[1]
rgb = np.array(Image.open(source).convert('RGB'))
light = rgb.min(axis=2)
neutral = rgb.max(axis=2).astype(int) - light
candidate = ((light > 237) & (neutral < 18)).astype('uint8')
count, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, 8)
# White jacket, gloves, and shoes are foreground, not background.
keep = {89, 92, 163, 166, 184, 206, 265, 286, 324, 389, 395, 396, 482, 489, 916, 972}
remove = [i for i in range(1, count) if stats[i, cv2.CC_STAT_AREA] > 300 and i not in keep]
background = np.isin(labels, remove).astype('uint8')
# Resolve anti-aliased boundaries against the original white matte.
edge = cv2.dilate(background, np.ones((5, 5), np.uint8)).astype(bool) & ~background.astype(bool)
alpha = np.ones(light.shape, dtype=np.float32)
alpha[background.astype(bool)] = 0
alpha[edge] = 1 - light[edge].astype(np.float32) / 255
# Convert the pale ground shadow to translucent ink rather than an opaque matte.
yy, xx = np.indices(light.shape)
shadow = (yy > 1290) & (light > 110) & (neutral < 22) & ~background.astype(bool)
alpha[shadow] = 1 - light[shadow].astype(np.float32) / 255
color = rgb.astype(np.float32) / 255
partial = (alpha > 0) & (alpha < 1)
color[partial] = np.clip((color[partial] - (1 - alpha[partial, None])) / alpha[partial, None], 0, 1)
rgba = np.dstack(((color * 255).round().astype('uint8'), (alpha * 255).round().astype('uint8')))
output = root / 'public/bison-cycling-transparent.png'
Image.fromarray(rgba).save(output, optimize=True)
# Temporary contrasting matte solely for inspecting extraction quality.
preview = Image.new('RGBA', (1920, 1440), '#668292')
preview.alpha_composite(Image.fromarray(rgba))
preview.convert('RGB').save(root / 'bison-cutout-review.jpg', quality=90)
print(f'{output}: RGBA {rgba.shape[1]}x{rgba.shape[0]}, transparent pixels={int((rgba[:,:,3] == 0).sum())}')
