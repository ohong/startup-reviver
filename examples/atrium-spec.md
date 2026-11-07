Atrium (Rebuild) MVP Technical Specification

Executive Summary

Build a client-side legal workflow tool that helps founders incorporate and prepare a seed SAFE quickly with price-transparent, exportable documents and a simple task tracker—no server, no external DB. The MVP proves that a narrow, repeatable startup legal flow can be faster, clearer, and cheaper when productized.

Core Value Proposition

One afternoon from zero → ready-to-sign incorporation + seed SAFE docs, with a guided checklist and instant exports—entirely offline/client-side.

⸻

MVP Features

Feature 1: Guided Incorporation Wizard

Collect company + founder inputs and generate baseline formation/post-incorporation documents from local templates.

Feature 2: Seed SAFE Generator (Post-Money)

Generate a Post-Money SAFE (Cap/Discount/MFN toggles), summary, and download.

Feature 3: Cap Table Builder (Lite)

Compute founder share issuances and simulate effect of a single SAFE on ownership.

Feature 4: Task Tracker & Document Vault

A single-screen checklist showing progress, with local autosave and one-click export/import of the workspace JSON and files.

Hard cap: 4 features max. Each is scoped to < ~2 hours of coding time.

⸻

Technical Architecture

Stack: TypeScript (strict), React 18, Vite, Tailwind CSS.
State: React Context + hooks; no Redux.
Storage: localStorage and downloadable JSON; no backend, no cookies.
LLM (optional): Claude Haiku 4.5 via Anthropic SDK over HTTPS from the client, gated by a user-provided API key saved in localStorage (with on-screen warning).
Dependencies: Keep to core + Tailwind; optional papaparse (CSV export) only if needed.

Data Flow (ASCII)

User
 └─> UI (React forms)
      ├─> Validation & Normalization (utils)
      ├─> State (Context) <-> localStorage autosave
      ├─> Template Engine (string replace)
      │    └─> Generated Docs (in-memory)
      ├─> Cap Table Calculator (pure TS)
      ├─> Task Tracker (derived from state)
      ├─> Export (download .md/.txt/.csv/.json)
      └─> [Optional] Claude API (explain terms)

File Structure

/public
  /templates
    incorporation/
      articles_of_incorporation.md
      bylaws.md
      action_by_written_consent.md
      ip_assignment_agreement.md
      83b_instructions.md
      post_inc_checklist.md
    safe/
      safe_post_money_cap.md
      safe_post_money_discount.md
      safe_post_money_cap_discount.md
/src
  /components
    WizardIncorporation.tsx
    SafeGenerator.tsx
    CapTableLite.tsx
    TaskTracker.tsx
    DocViewer.tsx
    ExportBar.tsx
    ApiKeyModal.tsx
  /hooks
    useLocalState.ts
    useAutosave.ts
  /utils
    template.ts
    captable.ts
    validators.ts
    storage.ts
    export.ts
    anthropic.ts    // optional
  /types
    company.ts
    founders.ts
    safe.ts
    documents.ts
    tasks.ts
  App.tsx
  main.tsx
  index.css


⸻

Functional Requirements

Feature 1: Guided Incorporation Wizard

User Story:
As a founder, I want to answer a short, plain-English wizard so that I can generate core formation docs without legalese.

Inputs (validated):
	•	Company: legal name, state = DE (locked for MVP), incorporation date (defaults to today), address.
	•	Authorized shares (default 10,000,000), par value ($0.00001 default).
	•	Founders: 1–3 founders (name, email, role, common shares, vesting start, cliff (months), vesting term (months)).
	•	Board: 1–3 initial directors (names).
	•	IP assignment toggle per founder (Y/N).

Outputs:
	•	articles_of_incorporation.md
	•	bylaws.md
	•	action_by_written_consent.md
	•	ip_assignment_agreement.md (per founder if toggled)
	•	83b_instructions.md
	•	post_inc_checklist.md

Acceptance Criteria:
	•	All inputs are validated inline; invalid fields display Tailwind error text and disable “Generate Docs”.
	•	Clicking “Generate Docs” renders docs in DocViewer with token replacement from /public/templates/incorporation/*.
	•	Must support tokens like {{COMPANY_NAME}}, {{STATE}}, {{FOUNDER[0].NAME}}, {{SHARES_AUTHORIZED}}, {{VESTING_CLIFF_MONTHS}}.
	•	Download each doc as .md with correct filename; browser “Print to PDF” produces legible output (no layout overflow).
	•	Wizard autosaves to localStorage every 800ms of pause; reload restores state.

Feature 2: Seed SAFE Generator (Post-Money)

User Story:
As a founder, I want to generate a Post-Money SAFE with my terms so that an investor can review/sign it.

Inputs (validated):
	•	Investor: name, address, email.
	•	Investment amount (USD).
	•	Terms toggles: cap (USD), discount (%), MFN (Y/N), pro-rata (Y/N).
	•	Company info is read from Feature 1.

Outputs:
	•	One of: safe_post_money_cap.md, safe_post_money_discount.md, safe_post_money_cap_discount.md with clause includes for MFN and pro-rata.
	•	“Terms Summary” panel (read-only) with computed highlights (implied ownership at cap, example conversion math).

Acceptance Criteria:
	•	Selecting cap/discount toggles shows required fields; empty required fields disable “Generate”.
	•	Generated SAFE renders with correct parties, amount in words and numerals, and the right clauses per toggle.
	•	“Explain My Terms” button (optional) prompts for Claude API key if absent; on click, calls Anthropic with a concise prompt and returns a 5-bullet lay summary within 3 seconds for typical inputs.
	•	Download .md works offline; no network required unless “Explain My Terms” is used.

Feature 3: Cap Table Builder (Lite)

User Story:
As a founder, I want to preview ownership post-incorporation and after a single SAFE so that I can sanity-check dilution.

Inputs:
	•	Authorized shares & founder issuances (from Feature 1).
	•	SAFE amount and valuation cap (from Feature 2).

Calculations (pure TS):
	•	Founder pre-money ownership % (per founder).
	•	SAFE shadow share count = SAFE_AMOUNT / (CAP / PRE_MONEY_SHARES).
	•	Post-money ownership % (per founder) and implied investor % at conversion.

Acceptance Criteria:
	•	Results update on change with ≤200ms debounce.
	•	Export .csv with columns: Holder, Shares (pre), Shares (post, implied), % Pre, % Post.
	•	No floating-point drift (use integers for shares; format percentages to 2 decimals).

Feature 4: Task Tracker & Document Vault

User Story:
As a founder, I want a single checklist view to see status and download all generated files so I can finish formation quickly.

Checklist Items (auto-derived + manual):
	•	File DE incorporation
	•	Adopt bylaws
	•	Board consent executed
	•	Assign IP to company
	•	Issue founder stock & sign purchase agreements
	•	83(b) mail reminder
	•	SAFE sent to investor
	•	Bank account opened

Acceptance Criteria:
	•	Checklist items can be marked complete; completion timestamps are stored in localStorage.
	•	“Document Vault” lists every generated file with size and a download button.
	•	“Export Workspace” downloads a single JSON blob with inputs, tasks, and a base64 array of generated docs.
	•	“Import Workspace” restores the full state after user confirms overwrite.

⸻

Implementation Notes

Templates & Templating
	•	Store markdown templates in /public/templates/....
	•	Implement a tiny token engine: replace {{TOKEN}}, dotted paths like {{FOUNDER[0].NAME}}, and conditionals via simple include blocks (e.g., wrap optional clauses with <!-- IF:MFN --> ... <!-- ENDIF --> and strip non-active blocks).
	•	No third-party templating libraries; keep it ~100 LOC.

Validation & Normalization
	•	Normalize currency to cents (integers), then format for display: $1,234,567.00.
	•	Validate emails (basic regex), US addresses as free text (no API lookups).
	•	Default DE corp; no multi-state logic in MVP.

LLM Integration (Optional)
	•	Component: ApiKeyModal.tsx to collect Anthropic API key. Store under atrium.apiKey in localStorage with a clear banner: “Your key is stored locally and requests are sent directly from your browser.”
	•	anthropic.ts: minimal client using fetch to https://api.anthropic.com/v1/messages with model claude-3-haiku-20240307.
	•	Prompt constants (e.g., SAFE_EXPLAINER_PROMPT) live in utils/anthropic.ts. No secret proxy, no server. Handle non-200 with user-friendly errors.

Persistence
	•	localStorage keys:
	•	atrium.workspace.v1  // all inputs + task states
	•	atrium.docs.v1       // array of generated {id, name, mime, contentBase64}
	•	atrium.apiKey        // optional LLM key
	•	Autosave debounce: 800ms idle. Provide a “Reset Workspace” that clears all keys.

Accessibility & UI
	•	Tailwind utility classes only. Neutral palette (stone/gray/sky).
	•	Forms: labelled inputs, keyboard focus rings, error text with aria-live="polite".
	•	Avoid heavy animations; only use CSS transitions for hover/focus.
	•	All actions reachable with keyboard; visible focus on buttons/links.

Performance Targets
	•	First load < 1s on modern laptop (Vite dev).
	•	Form keystroke → state update ≤16ms.
	•	“Generate Docs” completes ≤300ms for typical inputs (no LLM).
	•	LLM responses (if used) ≤3s for 1–2k tokens.

Security & Legal
	•	Client-side only; no PII sent unless user invokes LLM.
	•	Prominent disclaimer banner in DocViewer: “Not legal advice. Review with counsel.”
	•	If users enable LLM, show an additional notice: “Your prompt and data are sent to Anthropic’s API directly from your browser.”

Testing (Manual, minimal)
	•	Happy path for each feature with sample data.
	•	Edge cases: 1 founder vs. 3 founders; SAFE with cap only vs. discount only; $0.00001 par value rounding.
	•	Reload test: simulate page refresh and verify autosave restore.
	•	Export/Import round-trip: equality of restored state.

⸻

Detailed Specs Per Feature (Acceptance-Driven)

WizardIncorporation.tsx
	•	Layout: 3 steps (Company → Founders/Board → Shares & Vesting). Stepper with “Next/Back”.
	•	Generate Docs: disabled until all required fields pass validators.ts.
	•	DocViewer: split pane; left = list, right = markdown preview; download button per doc.
	•	Tokens Supported:
{{COMPANY_NAME}}, {{INCORP_DATE}}, {{ADDRESS}}, {{STATE}},
{{SHARES_AUTHORIZED}}, {{PAR_VALUE}},
{{FOUNDER[i].NAME}}, {{FOUNDER[i].COMMON_SHARES}}, {{FOUNDER[i].VEST_START}}, {{FOUNDER[i].CLIFF_MONTHS}}, {{FOUNDER[i].VEST_MONTHS}},
{{DIRECTOR[i].NAME}}.

SafeGenerator.tsx
	•	Term Controls: toggles for Cap / Discount / MFN / Pro-Rata; numeric inputs enable/disable per toggle.
	•	Summary Card: renders computed implied ownership using captable.ts.
	•	Explain My Terms: if key absent → open ApiKeyModal; else call anthropic.ts with {company, investor, terms} and display 5 bullets.

CapTableLite.tsx
	•	Inputs: from Wizard state + Safe terms; editable overrides allowed.
	•	Display: two tables (Pre, Post). Footer with totals = authorized vs. issued (warn if issued > authorized).
	•	Export CSV: export.ts creates blob and triggers download.

TaskTracker.tsx
	•	List: prepopulated items with checkboxes; completed = strikethrough + timestamp.
	•	Document Vault: render list from generated docs store; show size (bytes length of base64) and download button.
	•	Export/Import: JSON blob {workspace, docs}; Import shows confirm modal before overwrite.

⸻

Non-Goals / Explicit Cuts
	•	No e-signature, no filing with Delaware, no payments, no multi-state entity types.
	•	No multi-SAFE stacking, no priced rounds.
	•	No user accounts beyond local workspace; no sharing/collab.
	•	No server, no databases, no analytics.

⸻

Success Criteria (Demo-Ready)
	•	A first-time user can:
	1.	Complete the wizard with defaults,
	2.	Generate & download 5+ formation documents,
	3.	Generate a Post-Money SAFE (cap or discount),
	4.	See dilution in Cap Table Lite,
	5.	Check off tasks, and
	6.	Export the entire workspace JSON—all without network, unless they try “Explain My Terms”.

This MVP demonstrates the Atrium “rebuild” thesis: narrow scope + productized flow can deliver immediate value and set a foundation for partner-lawyer workflows or deeper AI in future iterations.