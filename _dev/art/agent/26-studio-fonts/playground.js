// The RAXDEG STUDIOS playground: draws the studio card in real pixels from the chosen face, color,
// layout, letter spacing and zoom. Reads the JSON in #pg-data (fonts, ramps, palette, shield icon).
(function () {
  const D = JSON.parse(document.getElementById("pg-data").textContent);
  const $ = (id) => document.getElementById(id);
  const icon = new Image();
  icon.src = D.icon;

  // Text as a grid of colors (null = clear), with an ink outline and an optional italic lean.
  function setText(text, fontKey, gap, ramp, outline) {
    const f = D.fonts[fontKey];
    const space = Math.max(3, Math.round(f.h / 2));
    let w = 0;
    for (const c of text) w += c === " " ? space : f.glyphs[c][0].length + gap;
    w -= gap;
    const lean = f.italic ? Math.floor((f.h - 1) / f.italic) : 0;
    const W = w + lean + 2, H = f.h + 2;
    const g = Array.from({ length: H }, () => Array(W).fill(null));
    let x = 1;
    for (const c of text) {
      if (c === " ") { x += space; continue; }
      const rows = f.glyphs[c];
      rows.forEach((row, y) => {
        const shift = f.italic ? Math.floor((f.h - 1 - y) / f.italic) : 0;
        const color = ramp[Math.min(ramp.length - 1, Math.floor(y * ramp.length / f.h))];
        for (let i = 0; i < row.length; i++) if (row[i] === "#") g[y + 1][x + i + shift] = color;
      });
      x += rows[0].length + gap;
    }
    if (!outline) return g;
    const o = g.map((r) => r.slice());
    for (let y = 0; y < H; y++) for (let x2 = 0; x2 < W; x2++) {
      if (g[y][x2]) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x2 + dx]);
      if (n) o[y][x2] = D.pal.ink;
    }
    return o;
  }

  function blit(ctx, grid, ox, oy) {
    grid.forEach((row, y) => row.forEach((c, x) => {
      if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); }
    }));
  }

  function ribbon(ctx, x0, y0, w, h) {
    const P = D.pal;
    const fill = (c, x, y, ww, hh) => { ctx.fillStyle = c; ctx.fillRect(x, y, ww, hh); };
    // Tails, folded behind the band's ends, with a notch cut in each.
    fill(P.ink, x0 - 9, y0 + 3, 11, h + 1);
    fill(P.parch1, x0 - 8, y0 + 4, 9, h - 1);
    fill(P.ink, x0 + w - 2, y0 + 3, 11, h + 1);
    fill(P.parch1, x0 + w - 1, y0 + 4, 9, h - 1);
    for (let i = 0; i < Math.ceil((h - 1) / 2); i++) {
      fill(P.night1, x0 - 9, y0 + 4 + Math.floor((h - 1) / 2) - i, 1 + i, 1);
      fill(P.night1, x0 - 9, y0 + 4 + Math.floor((h - 1) / 2) + i, 1 + i, 1);
      fill(P.night1, x0 + w + 9 - 1 - i, y0 + 4 + Math.floor((h - 1) / 2) - i, 1 + i, 1);
      fill(P.night1, x0 + w + 9 - 1 - i, y0 + 4 + Math.floor((h - 1) / 2) + i, 1 + i, 1);
    }
    fill(P.wood3, x0, y0 + h - 1, 1, 2);
    fill(P.wood3, x0 + w - 1, y0 + h - 1, 1, 2);
    // The band.
    fill(P.ink, x0 - 1, y0 - 1, w + 2, h + 2);
    fill(P.parch3, x0, y0, w, h);
    fill(P.parch2, x0, y0 + h - 1, w, 1);
  }

  function render() {
    const font = $("pg-font").value, color = $("pg-color").value, layout = $("pg-layout").value;
    const gap = +$("pg-gap").value, zoom = +$("pg-zoom").value;
    $("pg-gap-out").textContent = gap;
    $("pg-zoom-out").textContent = "x" + zoom;
    const ramp = D.ramps[color];
    const outline = color !== "ink";
    const full = setText("RAXDEG STUDIOS", font, gap, ramp, outline);
    const name = setText("RAXDEG", font, gap, ramp, outline);
    const sub = setText("STUDIOS", "tiny", gap + 1, D.ramps[color === "ink" ? "ink" : color].slice(2), outline);
    const tw = (g) => g[0].length, th = (g) => g.length;
    let W, H, draw;
    if (layout === "above" || layout === "below") {
      W = Math.max(64, tw(full)) + 8; H = th(full) + 64 + 10;
      draw = (ctx) => {
        const tx = Math.floor((W - tw(full)) / 2), ix = Math.floor((W - 64) / 2);
        if (layout === "above") { blit(ctx, full, tx, 3); ctx.drawImage(icon, ix, th(full) + 6); }
        else { ctx.drawImage(icon, ix, 2); blit(ctx, full, tx, 64 + 5); }
      };
    } else if (layout === "split") {
      W = Math.max(64, tw(name), tw(sub)) + 8; H = th(name) + 64 + th(sub) + 12;
      draw = (ctx) => {
        blit(ctx, name, Math.floor((W - tw(name)) / 2), 3);
        ctx.drawImage(icon, Math.floor((W - 64) / 2), th(name) + 6);
        blit(ctx, sub, Math.floor((W - tw(sub)) / 2), th(name) + 64 + 8);
      };
    } else if (layout === "ribbon") {
      const bw = tw(full) + 6, bh = th(full) + 2;
      W = Math.max(64, bw + 20) + 6; H = 64 + Math.max(0, bh - 10) + 10;
      draw = (ctx) => {
        ctx.drawImage(icon, Math.floor((W - 64) / 2), 2);
        const bx = Math.floor((W - bw) / 2), by = 50;
        ribbon(ctx, bx, by, bw, bh);
        blit(ctx, full, bx + 3, by + 1);
      };
    } else {
      W = 64 + Math.max(tw(name), tw(sub)) + 10; H = 64;
      draw = (ctx) => {
        ctx.drawImage(icon, 0, 0);
        const x = 68, y = Math.floor((64 - th(name) - th(sub) - 3) / 2);
        blit(ctx, name, x, y);
        blit(ctx, sub, x + Math.floor((tw(name) - tw(sub)) / 2), y + th(name) + 3);
      };
    }
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.fillStyle = D.pal.night1; o.fillRect(0, 0, W, H);
    draw(o);
    const c = $("pg-canvas");
    c.width = W * zoom; c.height = H * zoom;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W * zoom, H * zoom);
    $("pg-size").textContent = W + " x " + H + " pixels";
  }

  ["pg-font", "pg-color", "pg-layout", "pg-gap", "pg-zoom"].forEach((id) => $(id).addEventListener("input", render));
  if (icon.complete) render(); else icon.onload = render;
})();
