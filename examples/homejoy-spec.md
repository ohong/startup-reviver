Homejoy (Rebuild) — MVP Technical Specification

Executive Summary

Build CleanOps, a narrow, B2B SaaS that solves the two root causes behind Homejoy’s collapse—inconsistent quality and weak retention economics—without taking labor risk. CleanOps serves independent cleaning companies (5–30 workers) with an embedded booking widget, QA photo checklists, recurring billing, and issue-resolution workflows. It is not a marketplace and does not employ or control cleaners; customers remain the cleaning company’s clients, reducing misclassification exposure and CAC.

One-line value: “Fewer redos, more repeats.” CleanOps raises first-to-repeat conversion and 90-day retention by standardizing service delivery and feedback loops, then automates recurring plans with predictable revenue.

⸻

MVP Scope (Wedge)
	1.	Booking Widget (Embed) — standardize intake; constrain skus & options to reduce surprises.
	2.	Dispatch Board — assign jobs and time windows; basic capacity sanity checks.
	3.	Field QA App (PWA) — room-by-room checklists, mandatory photo proof, add-on verification.
	4.	Issue → Resolution Loop — instant customer report, triage, re-clean/credit workflow.
	5.	Recurring Plans & Billing — weekly/biweekly/monthly plans, card vault, tips, receipts.
	6.	CSAT/NPS & Repeat Analytics — SMS surveys, first-to-repeat funnel, redos & refunds.

Non-goals (MVP): no map routing optimization, no multi-city marketplace, no dynamic pricing, no contractor background checks provider, no payroll, no native mobile.

⸻

Product Principles Tied to Homejoy Lessons
	•	Quality before scale: mandate visual proof + atomic checklists to prevent inconsistency.
	•	Retention over discounts: remove first-visit coupons; design for seamless conversion to recurring plans.
	•	Stay out of the labor chain: B2B tool for existing companies; avoid setting schedules, uniforms, or rates.
	•	Operational truth in one place: every promise in booking flows into checklists and billing.

⸻

User Roles & Flows

Roles
	•	Owner/Admin (Cleaning company)
	•	Dispatcher (Back office)
	•	Cleaner (Field user; PWA)
	•	Customer (End client; gets links/SMS)

Core Flows (Happy Path)
	1.	Owner installs Booking Widget on their site; configures service SKUs, territories, fees, add-ons, and time windows.
	2.	Customer books via widget → Stripe pre-auth → job appears on Dispatch Board.
	3.	Dispatcher assigns team & window → Cleaner PWA shows job with room checklist + required photos.
	4.	Cleaner completes each room, uploads photos, marks add-ons done; job submitted.
	5.	Customer receives CSAT SMS; if issue is reported, Issue → Resolution kicks in (credit or re-clean).
	6.	Owner offers recurring plan; if accepted, CleanOps schedules + auto-bills; repeat metrics update.

⸻

Functional Requirements (Acceptance-Driven)

1) Booking Widget (Embed)

Goal: Frictionless, accurate intake that constrains scope.

Inputs (configurable by Owner):
	•	ZIP whitelist, service SKUs (Studio/1BR/2BR/3BR; House 2/3/4BR), add-ons (fridge, oven, inside windows), base durations, base price.
	•	Time windows (AM 8–12, PM 12–4), max jobs per window, buffer minutes.
	•	Travel fee by ZIP or distance (flat for MVP).
	•	Terms & cancellation policy text.

Customer form fields:
	•	Address (Google Places autocomplete), gate code/notes, pets toggle.
	•	Bedrooms, bathrooms (numbers only).
	•	Add-ons (multi-select).
	•	Preferred date + window.
	•	Name, email, mobile; card entry (Stripe).

Acceptance Criteria
	•	Widget loads ≤ 1s; validates ZIP against whitelist; blocks unsupported requests.
	•	Price quote updates live as options selected; shows taxes/fees; “No first-visit discount” is explicit.
	•	On submit: create Booking + Stripe PaymentIntent with $1 auth (MVP) or setup intent; store minimal PCI tokens.
	•	Customer receives confirmation email/SMS with reschedule/cancel links.
	•	Owner can copy/paste one <script> tag + <div id="cleanops-widget">.

2) Dispatch Board (Back Office)

Goal: Ensure capacity sanity and clear assignments.

Views
	•	Unassigned (new bookings), Today, Week.
	•	Capacity hint per window: requested hours vs. configured crew-hours.

Actions
	•	Assign team(s), edit time window, add internal notes, trigger customer ETA SMS.
	•	Lock job 12h prior; further changes require customer confirmation link.

Acceptance Criteria
	•	Drag-drop assignment; updates propagate to Cleaner PWA within ≤2s (websocket or polling).
	•	Capacity bar turns red when oversubscribed; block assignment without override.
	•	Audit trail (who changed what, when).

3) Cleaner PWA (Field QA)

Goal: Standardize quality, reduce re-cleans.

Per-job checklist
	•	Pre-flight: read notes, “walkthrough” photos optional.
	•	Room cards: (Kitchen, Bathrooms (xN), Bedrooms (xN), Living) each with atomic tasks (toggle) and min 1 photo.
	•	Add-on cards (e.g., Oven: before/after photo mandatory).
	•	Completion requires: all required toggles + photos uploaded + final signature (cleaner initials).

Offline support
	•	Queue photos offline; background upload on reconnect.

Acceptance Criteria
	•	PWA installable; works on iOS/Android Chrome/Safari; job cache for last 24h.
	•	Cannot submit job without all required photos; visual progress bar.
	•	Photo EXIF stripped server-side; images resized to ≤1600px longest edge.

4) Issue → Resolution Loop

Goal: Close the loop quickly; codify credits/re-cleans.

CSAT/NPS
	•	SMS 30 min after completion: 0–10 score + free-text.
	•	If ≤6 or “report issue”: open Issue ticket with room tags.

Resolution actions
	•	Offer credit (% of job) to Stripe customer balance or schedule re-clean within 7 days (pre-auth card).
	•	Attach evidence: cleaner photos vs. customer photos.

Acceptance Criteria
	•	Issue ticket SLA timer; status (Open/Pending/Resolved).
	•	One-click credit issues Stripe customer balance and notifies customer.
	•	Re-clean clones job with only affected rooms/add-ons; dispatch flow applies.

5) Recurring Plans & Billing

Goal: Convert happy first-timers to predictable repeats.

Plan setup
	•	Weekly/Biweekly/Monthly; same window; automated reminders; card on file (Stripe).
	•	Discount only on future recurrences (e.g., 10% weekly). No first-visit promo.

Billing
	•	Pre-auth 24h prior; capture on job submit; tips at capture or via follow-up link.

Acceptance Criteria
	•	Conversion CTA appears for CSAT ≥8; 2-tap accept from customer link.
	•	Skips/reschedules handled from link; no phone call required.
	•	Failed pre-auth triggers retry rules + customer SMS.

6) Analytics & Admin

Dashboards
	•	First-to-repeat rate (7/30/90 days), recurrence attach rate, CSAT distribution, redos/re-cleans %, refunds %.
	•	Per-team quality: avg CSAT, photo compliance rate.

Acceptance Criteria
	•	All metrics scoped by date & ZIP; export CSV.
	•	Pseudonymous customer IDs; no PII in exports by default.

⸻

System Architecture

High Level
	•	Web App: Next.js (App Router) + TypeScript + Tailwind.
	•	API: tRPC or REST (NestJS alt) behind Next.js /api routes.
	•	DB: Postgres (Supabase or RDS) + Prisma.
	•	Auth: Magic link (email) via Supabase Auth.
	•	Object Storage: S3/Supabase Storage for photos.
	•	Payments: Stripe (PaymentIntents, SetupIntents, Customer Balance).
	•	SMS/Email: Twilio (SMS), Postmark (email).
	•	Real-time: Postgres NOTIFY or Supabase Realtime for Dispatcher ↔ PWA sync.
	•	Infra: Vercel (web) + AWS S3 (images) + AWS CloudFront (CDN) or Supabase managed stack.

Data Model (simplified)

Company(id, name, email, phone, zip_whitelist[], terms_text, stripe_account_id, ...)
User(id, company_id, role, email, name, phone, ...)
Customer(id, company_id, name, email, phone, address, zip)
Booking(id, company_id, customer_id, status, date, window, sku, addons[], price_cents, stripe_pi, notes)
Assignment(id, booking_id, team_id, cleaner_ids[])
Job(id, booking_id, started_at, submitted_at, csat_score, csat_text)
ChecklistTemplate(id, company_id, sku, room_defs jsonb, addon_defs jsonb)
ChecklistItem(id, job_id, room, task, completed_bool, photo_required_bool)
Photo(id, job_id, room, url, bytes, content_type, uploaded_by)
Issue(id, job_id, status, reason_tags[], credit_cents)
Plan(id, customer_id, sku, addons[], cadence, next_date, discount_pct, status)

File Structure

/apps/web (Next.js)
  /app
    /widget        # booking embed
    /dispatch
    /jobs
    /issues
    /plans
    /api
  /components
  /lib (prisma, stripe, twilio, storage)
  /styles
/prisma
  schema.prisma


⸻

Security, Privacy, & Compliance
	•	PII: Encrypt at rest (Postgres pgcrypto for phone/email), TLS in transit.
	•	Images: Strip EXIF, limit retention (default 180 days; configurable).
	•	Access Control: RBAC (Owner, Dispatcher, Cleaner); cleaner only sees assigned jobs.
	•	Legal Positioning: Terms clarify CleanOps is software to independent businesses; CleanOps does not set wages or schedules; companies retain customer contracts and liability. Provide optional proof-of-insurance field per Company to display in the widget.

⸻

Performance Targets
	•	Widget TTI ≤ 1s; booking submit ≤ 400ms server time (excluding Stripe).
	•	PWA offline: queue up to 100 photos; each upload ≤ 2s on typical LTE.
	•	Dispatch updates propagate to PWA ≤ 2s.

⸻

Integrations (MVP)
	•	Stripe: PaymentIntents, SetupIntents, Customer Balance, Refunds.
	•	Twilio: SMS (transactional + CSAT).
	•	Postmark: Transactional email.
	•	(Optional) Google Places: Address autocomplete.

⸻

Templates & QA Content
	•	Seed with opinionated default checklists per SKU (Studio/1BR/2BR/3BR) and add-ons. Owners can toggle tasks on/off but cannot disable required photo items for add-ons in MVP.

⸻

Observability & Ops
	•	Structured logs (pino) with request IDs.
	•	Health endpoints /api/health.
	•	Sentry for web/API.
	•	Daily DB backups; object storage lifecycle rules.

⸻

Migration & Rollout
	•	Pilot with 3–5 cleaning companies in one metro area.
	•	Import CSV: Customers, historic bookings.
	•	Embed widget on Squarespace/Wix/WordPress with copy-paste snippet.

⸻

Pricing (MVP Suggestion)
	•	$99/month/company up to 500 jobs/month; $0.20/job thereafter.
	•	2% platform fee on processed payments (configurable; can be waived for pilots).

⸻

KPIs (90 days pilot)
	•	First-to-repeat ≥ 40% (7/30 day windows).
	•	CSAT ≥ 8.5/10; photo compliance ≥ 95%.
	•	Re-clean rate ≤ 5%; refund rate ≤ 3%.
	•	Recurring attach ≥ 30% of first-timers.

⸻

Test Plan (Manual, MVP)
	•	Widget: ZIP reject/accept; add-on price math; email/SMS confirmations.
	•	Dispatch: oversubscribe guard; audit trail; reassignment sync to PWA.
	•	PWA: offline photo queue; required photo enforcement; submit flow.
	•	Issue loop: low CSAT auto-creates ticket; credit applies to next charge; re-clean clones scope.
	•	Plans: accept from link; skip/reschedule; failed pre-auth retry.

⸻

Future (Post-MVP) — Not in scope
	•	Route optimization; cleaner geolocation & ETAs.
	•	Multi-company marketplace mode (high risk).
	•	Background checks & insurance brokerage integrations.
	•	Dynamic pricing and surge logic.
	•	Native iOS/Android apps.

⸻

Why This MVP Now (Tied to Homejoy)
	•	Solves inconsistency with checklists + photo proof; makes quality visible and enforceable.
	•	Improves retention by removing coupon-driven one-offs and making recurring conversion native.
	•	Avoids legal landmines by serving businesses, not running a labor marketplace.
	•	Demonstrates unit economics: better first-to-repeat, fewer re-cleans, lower refunds—before scaling breadth.