"""Build mockup.html from mockup.src.html by inlining every images/*.png as a data URI.

The source opens in a browser as is (relative image paths); the built file is self-contained,
which the Claude artifact host needs. Run: python build.py
"""
import base64
import pathlib
import re

HERE = pathlib.Path(__file__).parent
src = (HERE / "mockup.src.html").read_text(encoding="utf-8")


def inline(m):
    data = (HERE / m.group(0)).read_bytes()
    return "data:image/png;base64," + base64.b64encode(data).decode()


out = re.sub(r"images/[\w-]+\.png", inline, src)
(HERE / "mockup.html").write_text(out, encoding="utf-8")
print(f"mockup.html: {len(out) // 1024} KB")
