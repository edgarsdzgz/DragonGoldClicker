import sys, os
from PIL import Image, ImageDraw
# usage: sheet.py out.jpg cellh file...   -> tiles in a row-wrapped grid, labels with index
out, ch = sys.argv[1], int(sys.argv[2]); files = sys.argv[3:]
ims=[]
for f in files:
    try:
        im=Image.open(f).convert("RGB"); im.thumbnail((ch*2, ch)); ims.append((os.path.basename(f), im))
    except Exception as e: print("skip", f, e)
W=1800; x=y=0; rowh=0; pos=[]
for n,im in ims:
    if x+im.width>W: x=0; y+=rowh+4; rowh=0
    pos.append((x,y,n,im)); x+=im.width+4; rowh=max(rowh,im.height)
H=y+rowh; sheet=Image.new("RGB",(W,H),(255,0,255)); dr=ImageDraw.Draw(sheet)
for x,y,n,im in pos:
    sheet.paste(im,(x,y)); dr.rectangle((x,y,x+40,y+14),fill=(0,0,0)); dr.text((x+2,y+1),n[:8],fill=(255,255,0))
sheet.save(out, quality=82); print(out, sheet.size)
