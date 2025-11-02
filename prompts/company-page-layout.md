Here’s a clear teardown of the UI so you can rebuild it elsewhere. I’ll describe the information architecture, grid, components, spacing/typography, and responsive behavior, then give a minimal HTML/CSS skeleton you can drop into any app.

⸻

1) Information architecture

Top bar (global)
	•	Product logo (top-left, not visible in the screenshot).
	•	Page tabs: Overview · Memo · Resources · Similar Companies (center/left).
	•	Utility icons: search, share, more (top-right).

Content area (page)
	•	Three-column layout
	1.	Left sidebar (nav/logo): square logo tile; vertical section nav (scrollspy) for the memo (Thesis, Founding Story, Product, …).
	2.	Main column: title (“BetterUp”), small tag pills, short company blurb, then the memo content (H2 section title “Thesis” + body text with inline links and stats).
	3.	Right sidebar (facts): company facts (Founding date, HQ, Total funding, Status, Stage, Employees), a CTA link (“Careers at …”), then an Authors card and a Help/feedback card.

Meta strip (under the header row)
	•	Left: “Updated: July 11, 2024”
	•	Right: “Reading time: 21 min”

⸻

2) Grid & sizing

Container max-width: ~1200–1280 px centered.

Columns (desktop)
	•	Left: 220–240 px (fixed)
	•	Main: minmax(640, 760 px)
	•	Right: 280–320 px (fixed)

Gaps
	•	Column gap: 32 px
	•	Section vertical rhythm: 24–32 px between blocks

Sticky behavior
	•	Left section nav: position: sticky; top: 96 px (so it stays in view under the top bar).
	•	Right facts card (optional): position: sticky; top: 96 px.

⸻

3) Components

A) Page tabs (top bar)
	•	Inline text tabs with the active tab in a medium-weight font and either an underline or a 2px bottom border.
	•	Hover: underline; Active: bottom border + darker text.

B) Company identity header (main column, top)
	•	H1 title (“BetterUp”)
	•	Tag pills (e.g., HR, Health & Wellness): small rounded pills, 12–13 px text, 6–8 px vertical padding, gray-100 background, gray-700 text.
	•	One-paragraph overview (60–75ch line length)

C) Meta strip
	•	Muted text (gray-600), 12–13 px. Split left/right.

D) Left sidebar
	•	Logo tile: square (e.g., 140×140) with brand color background, centered logo wordmark.
	•	Section nav (scrollspy): single level list, bullet/dot or minimal left rule. Active section uses accent color and bold; others muted.

E) Memo content (main column)
	•	H2 section title (“Thesis”): 22–24 px, semibold.
	•	Body text: 16–17 px, 1.6–1.75 line-height.
	•	Inline links: brand blue, underlined on hover (or always underlined).
	•	Numbers and references appear as inline links in blue (e.g., “21%”, “$48 billion”).

F) Right sidebar (facts)
	•	Key–value list inside a card (no heavy borders; subtle divider between rows).
	•	Label (sm, gray-600) over Value (md, gray-900).
	•	External link CTA (“Careers at …”) with ↗ icon.
	•	Authors card: small avatar or initials, name (link), role (lighter).
	•	Help/feedback card: concise copy + link to submit feedback.

⸻

4) Visual style guide

Colors (example tokens)
	•	Text primary: #0B0B0B / gray-900
	•	Text secondary: #5A5A5A / gray-600
	•	Surfaces: white
	•	Borders/dividers: #EAEAEA / gray-200
	•	Link/accent: accessible blue (e.g., #2B6AFF)
	•	Pill background: #F5F5F5 / gray-100

Typography
	•	H1: 32–36 px, 600
	•	H2: 22–24 px, 600
	•	Body: 16–17 px, 400, line-height 1.65
	•	Small/meta: 12–13 px, 500 for labels

Spacing scale (example)
	•	4 / 8 / 12 / 16 / 24 / 32 px
	•	Cards: 20–24 px padding
	•	Between paragraphs: 12–16 px

Dividers
	•	1 px hairline between groups; lots of white space otherwise.

⸻

5) Behaviors & UX details
	•	Scrollspy: As the user scrolls the main column, the left nav highlights the current H2.
	•	Anchor links: Left nav items link to #id on each section.
	•	Sticky sidebars avoid overlapping the top tabs (use a top offset).
	•	Links open external resources in a new tab with an external-link icon.
	•	Cards have no drop shadow (or very subtle). Rely on spacing and hairlines.

Accessibility
	•	Semantic landmarks: <header>, <nav aria-label="Memo sections">, <main>, <aside>.
	•	Use aria-current="true" for the active left-nav link.
	•	Ensure color contrast (WCAG AA+) for text and links.
	•	Keyboard focus visible for tabs and left-nav items.

⸻

6) Responsive rules
	•	≥ 1200 px: 3 columns as above.
	•	900–1199 px (tablet): collapse to 2 columns → Left nav becomes a horizontal scrollable nav above the main content; Right sidebar stacks below the main content.
	•	< 900 px (mobile):
	•	Single column flow.
	•	Tabs become horizontally scrollable.
	•	Meta strip collapses to a single line or stacks.
	•	Facts/Authors/Help cards stack beneath the memo.

⸻

7) Minimal implementation skeleton

<header class="appbar">
  <nav class="tabs" role="tablist">
    <a role="tab" aria-selected="true">Overview</a>
    <a role="tab">Memo</a>
    <a role="tab">Resources</a>
    <a role="tab">Similar Companies</a>
  </nav>
  <div class="utilities">
    <!-- icons/buttons -->
  </div>
</header>

<div class="container">
  <aside class="left" aria-label="Memo sections">
    <div class="logo-tile">BetterUp</div>
    <ul class="section-nav">
      <li><a href="#thesis" aria-current="true">Thesis</a></li>
      <li><a href="#founding">Founding Story</a></li>
      <li><a href="#product">Product</a></li>
      <li><a href="#market">Market</a></li>
      <li><a href="#competition">Competition</a></li>
      <li><a href="#business-model">Business Model</a></li>
      <li><a href="#traction">Traction</a></li>
      <li><a href="#valuation">Valuation</a></li>
      <li><a href="#opportunities">Key Opportunities</a></li>
      <li><a href="#risks">Key Risks</a></li>
      <li><a href="#summary">Summary</a></li>
    </ul>
  </aside>

  <main class="main">
    <header class="page-header">
      <h1>BetterUp</h1>
      <div class="tags">
        <span class="pill">HR</span>
        <span class="pill">Health &amp; Wellness</span>
      </div>
      <p class="lede">
        BetterUp is a “human transformation platform” that…
      </p>
    </header>

    <div class="meta">
      <span>Updated: July 11, 2024</span>
      <span>Reading time: 21 min</span>
    </div>

    <article class="memo">
      <h2 id="thesis">Thesis</h2>
      <p>Mental health and employee well-being are increasingly critical… 
        In <a href="#">2023</a>, <a href="#">21%</a> of adults…</p>
      <!-- Additional sections… -->
    </article>
  </main>

  <aside class="right">
    <section class="card facts">
      <dl>
        <div><dt>Founding Date</dt><dd>Apr 1, 2013</dd></div>
        <div><dt>Headquarters</dt><dd>San Francisco, CA</dd></div>
        <div><dt>Total Funding</dt><dd>$567M</dd></div>
        <div><dt>Status</dt><dd>Private</dd></div>
        <div><dt>Stage</dt><dd>Series E</dd></div>
        <div><dt>Employees</dt><dd>2715</dd></div>
      </dl>
      <a class="ext" href="#" target="_blank" rel="noopener">Careers at BetterUp ↗</a>
    </section>

    <section class="card authors">
      <h3>Authors</h3>
      <ul>
        <li><a href="#">Noah Oberlander</a> — Fellow</li>
        <li><a href="#">Amelia Charles</a> — Fellow</li>
      </ul>
    </section>

    <section class="card help">
      <p>Have a different take or want to contribute?</p>
      <a href="#">Send our research team a note ↗</a>
    </section>
  </aside>
</div>

:root{
  --maxw: 1240px;
  --gap: 32px;
  --pad: 24px;
  --border: #EAEAEA;
  --text: #0B0B0B;
  --muted: #5A5A5A;
  --pill-bg:#F5F5F5;
  --link:#2B6AFF;
}

*{box-sizing:border-box}
body{font:16px/1.65 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:var(--text); margin:0; background:#fff}
a{color:var(--link); text-decoration:underline}
h1{font-size:34px; line-height:1.2; margin:0 0 8px}
h2{font-size:24px; line-height:1.3; margin:32px 0 12px}
h3{font-size:16px; margin:0 0 12px}
p{margin:0 0 12px}

.appbar{position:sticky; top:0; z-index:10; background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:12px 20px}
.tabs a{margin-right:16px; color:#111; text-decoration:none; padding:8px 0; border-bottom:2px solid transparent}
.tabs a[aria-selected="true"]{border-bottom-color:#111; font-weight:600}
.utilities{display:flex; gap:12px}

.container{max-width:var(--maxw); margin:0 auto; display:grid; grid-template-columns: 240px minmax(640px, 1fr) 300px; gap:var(--gap); padding:24px 20px 64px}
.left{position:sticky; top:96px; align-self:start}
.right{position:sticky; top:96px; align-self:start}
.logo-tile{width:140px; height:140px; background:#E91E63; color:#fff; display:grid; place-items:center; font-weight:700; border-radius:8px; margin-bottom:24px}
.section-nav{list-style:none; padding:0; margin:0; display:grid; gap:8px; font-size:14px}
.section-nav a{color:var(--muted); text-decoration:none}
.section-nav a[aria-current="true"]{color:#111; font-weight:600}

.page-header .tags{display:flex; gap:8px; margin:6px 0 10px}
.pill{background:var(--pill-bg); color:#333; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:500}
.lede{max-width:75ch}

.meta{display:flex; justify-content:space-between; color:var(--muted); font-size:13px; padding:12px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin:16px 0 8px}

.card{border:1px solid var(--border); border-radius:12px; padding:var(--pad); margin-bottom:16px; background:#fff}
.facts dl{margin:0; display:grid; grid-template-columns:1fr; gap:12px}
.facts dt{font-size:12px; color:var(--muted); margin-bottom:4px}
.facts dd{margin:0; font-weight:500}
.facts .ext{display:inline-block; margin-top:12px}

@media (max-width:1199px){
  .container{grid-template-columns: 1fr 300px}
  .left{position:static}
  .section-nav{display:flex; overflow-x:auto; gap:16px; padding-bottom:8px; border-bottom:1px solid var(--border); margin-bottom:16px}
}
@media (max-width:899px){
  .container{grid-template-columns:1fr}
  .right{position:static}
  .meta{flex-direction:column; gap:4px}
}


⸻

Rebuild checklist
	•	Set a 3-column grid with sticky left/right on desktop.
	•	Implement tabs, with one active state.
	•	Add H1 + tag pills + lede paragraph.
	•	Render meta strip (Updated / Reading time).
	•	Memo sections as H2 with anchors; enable scrollspy.
	•	Right facts card as definition list; add CTA + Authors + Help cards.
	•	Apply spacing, hairline dividers, and neutral palette; underline links.
	•	Collapse to 2 columns on tablet, 1 column on mobile.