import sys, json, urllib.request, urllib.parse, os
# usage: itunes.py outroot "term|key" ...   downloads iPhone screenshots of the top match
root=sys.argv[1]
for arg in sys.argv[2:]:
    term,key=arg.split("|")
    q="https://itunes.apple.com/search?"+urllib.parse.urlencode({"term":term,"entity":"software","country":"us","limit":3})
    r=json.load(urllib.request.urlopen(q))
    if not r["results"]: print("NONE",term); continue
    a=r["results"][0]
    d=os.path.join(root,key); os.makedirs(d,exist_ok=True)
    with open(os.path.join(d,"meta.txt"),"w") as f:
        f.write(a["trackName"]+"\n"+a["trackViewUrl"].split("?")[0]+"\n"+a.get("sellerName","")+"\n")
        for i,u in enumerate(a.get("screenshotUrls",[]),1):
            f.write(f"{i:02d} {u}\n")
            try: urllib.request.urlretrieve(u.rsplit("/",1)[0]+"/600x0w.jpg", os.path.join(d,f"{i:02d}.jpg"))
            except Exception as e: print("dl fail",u,e)
    print(key,"->",a["trackName"],"|",a.get("sellerName"),"|",a["trackViewUrl"].split("?")[0],"|",len(a.get("screenshotUrls",[])),"shots")
