# Dither Noir — Mini Design System

1) Foundations
	•	Palette
	•	--bg: #0B0C0E (near-black)
	•	--fg: #F5F6F7 (near-white)
	•	--ink: #D1D5DB (muted text)
	•	Accent (choose one): --accent: #61E7FF or #A7FF70
	•	Type
	•	Display: Space Grotesk/Inter 600 (32–48px)
	•	Body: Inter 400 (16–18px, 1.65 line-height)
	•	Numerics: tabular lining
	•	Surface
	•	Dark mode by default. No drop shadows; rely on hairlines (1px #202225).

2) Layout
	•	App shell: left rail 280–320px (tools/cards), right pane flexible (map/hero).
	•	Grid: 12-col, 32px column gap, 24–32px vertical rhythm.
	•	Cards: 12–16px radius, 20–24px padding, border #222, subtle inner grid (see “Micro-dither”).

3) Dither primitives (tokens)

:root{
  --dot-size: 1.5px;      /* 1–2px */
  --dot-gap: 6px;         /* 5–8px */
  --dither-opacity: .38;  /* 0.25–0.5 */
  --pattern: url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6">\
<circle cx="1" cy="1" r="1" fill="white"/></svg>');
}

A) Micro-dither (static dot field)

Use anywhere you need the textured “pixel dust”.

.dots{
  background-image: radial-gradient(currentColor var(--dot-size),transparent var(--dot-size)),
                    radial-gradient(currentColor var(--dot-size),transparent var(--dot-size));
  background-size: var(--dot-gap) var(--dot-gap), var(--dot-gap) var(--dot-gap);
  background-position: 0 0, calc(var(--dot-gap)/2) calc(var(--dot-gap)/2);
  color: rgba(255,255,255,.18); /* dot color */
}

B) Halftone mask (headline globe/waves)

Gradient content revealed through dot shapes.

.halftone{
  position: relative; isolation: isolate;
  background: radial-gradient(120% 120% at var(--x,50%) var(--y,50%),
              var(--fg) 0%, rgba(255,255,255,.3) 45%, transparent 70%);
  -webkit-mask-image: var(--pattern);
  -webkit-mask-size: var(--dot-gap) var(--dot-gap);
  mask-image: var(--pattern); mask-size: var(--dot-gap) var(--dot-gap);
  opacity: var(--dither-opacity); mix-blend-mode: screen;
}

Update --x/--y on pointer to create interactive drift.

C) Ordered dither (exact, canvas)

Use for images/video to convert luminance to dots (Bayer 8×8).

// given ctx with grayscale image:
const b=[0,48,12,60,3,51,15,63, 32,16,44,28,35,19,47,31, 8,56,4,52,11,59,7,55,
  40,24,36,20,43,27,39,23, 2,50,14,62,1,49,13,61, 34,18,46,30,33,17,45,29,
  10,58,6,54,9,57,5,53, 42,26,38,22,41,25,37,21].map(x=>x/64);
let img=ctx.getImageData(0,0,w,h), d=img.data;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4, lum=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255;
  const t=b[(y&7)*8+(x&7)];
  const v= lum>t ? 255:0; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255;
} ctx.putImageData(img,0,0);

4) Component styling
	•	Buttons: solid --fg on --bg; hover adds .dots overlay at opacity:.12.
	•	Badges/Pills: 12px radius, uppercase 11–12px, apply .dots with reduced opacity.
	•	Charts: monochrome strokes; place .halftone behind series for energy/noise.

5) Motion
	•	Use slow (10–20s) Y-translate of .halftone. Respect prefers-reduced-motion: reduce (fallback to static .dots).

6) Accessibility & Performance
	•	Contrast ≥ 4.5:1 for text. Provide “Reduce Texture” toggle (disables masks/overlays).
	•	Reuse the inlined SVG pattern; avoid large PNGs. Composite on GPU (will-change: transform on animated halftones).