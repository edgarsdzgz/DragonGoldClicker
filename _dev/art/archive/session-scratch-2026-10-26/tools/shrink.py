import sys, os
from PIL import Image
# usage: shrink.py outdir maxside file...
out, maxs = sys.argv[1], int(sys.argv[2])
for p in sys.argv[3:]:
    try:
        im = Image.open(p); im.load()
    except Exception as e:
        print("FAIL", p, e); continue
    w, h = im.size
    im = im.convert("RGB")
    im.thumbnail((maxs, maxs))
    name = os.path.splitext(os.path.basename(p))[0] + ".jpg"
    im.save(os.path.join(out, name), quality=80)
    print(name, f"{w}x{h}")
