import sys
from PIL import Image
# usage: crop.py in out x0 y0 x1 y1 (fractions 0-1) [maxside]
p, o = sys.argv[1], sys.argv[2]
x0,y0,x1,y1 = map(float, sys.argv[3:7])
m = int(sys.argv[7]) if len(sys.argv) > 7 else 900
im = Image.open(p).convert("RGB"); w,h = im.size
c = im.crop((int(x0*w),int(y0*h),int(x1*w),int(y1*h))); c.thumbnail((m,m)); c.save(o, quality=85)
