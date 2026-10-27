import re,html,sys,json
# usage: gudb.py page.html -> json list of {cat,title,url,size}
t=open(sys.argv[1],encoding="utf-8",errors="ignore").read()
out=[];cat=""
for m in re.finditer(r'gamedata_category">([^<]*)<|<a\s([^>]*?class="galleryimage[^>]*)>',t,flags=re.S):
    if m.group(1) is not None: cat=html.unescape(m.group(1)).strip(); continue
    a=m.group(2)
    g=lambda k: (re.search(k+r'="([^"]*)"',a) or [None,""])[1]
    out.append({"cat":cat,"title":html.unescape(g("data-title")).strip(),"url":g("href"),"size":g("data-size")})
json.dump(out,open(sys.argv[1]+".json","w"),indent=0)
for i,o in enumerate(out): print(i,o["cat"][:22],"|",o["title"][:40],"|",o["size"])
