# Ottimate Training Dashboards — Consistency & Governance Guide

The training dashboards are intentionally **self-contained single HTML files** (all CSS/JS/images inline) so they run anywhere and preview offline. That means we can't DRY the shared code into one file — instead we keep **one canonical source for each shared concern** and paste it identically into every dashboard, enforced by a drift-check.

Dashboards in scope: `portal.html`, `fundamentals-training.html`, `demo-training.html` (Demo 101), `demo102.html` (Demo 102), `pomatch.html` (**Demo 201 — PO Match**, Level 2 — display name only; the file, the `ottimate_pomatch_state` key, and the webhook/email identifiers `PO Match (Level 2)` are unchanged on purpose).
(`demo103.html` is an orphan awaiting manual deletion — nothing links to it; do not maintain it. `Demo 101 - Core AP + Statements/` is an older partial — do not build there.)

---

## 1. Design tokens, fonts & scaling  → `ottimate-tokens.css`

- The **BASE TOKENS block** (palette, neutrals, shadows, radius, type scale, layout metrics) is byte-identical in every file.
- The **only** things a dashboard overrides are the four `--accent-*` variables (component color) and the two `--banner-*` variables (identity color for the top bar + every page banner). Accents are each dashboard's existing dominant UI color; banners are one distinct gradient per dashboard (added 2026-09-10):
  | Dashboard | Accent (components) | Banner `--banner-a → --banner-b` (`.app-header` + `.page-hero`) |
  |---|---|---|
  | portal | blue `#1565A0` | navy → blue |
  | Fundamentals | blue `#1565A0` | navy → **teal** `#00838F` |
  | Demo 101 (Core AP) | blue `#1565A0` | navy → **blue** `#1565A0` |
  | Demo 102 (Vendor Pay) | teal `#00BCD4` | **purple** `#4A148C → #7B2D8B` (header badge uses the teal accent for contrast) |
  | PO Match (L2) | indigo `#4F46E5` | navy → **indigo** `#3730A3` |
- Every `.page-hero` in a dashboard uses the banner — no per-page inline hero colors (Demo 102's old slate/teal/indigo/green page banners were normalized 2026-09-10; its legacy `purple-hero`/`green-hero` classes now equal the base banner). The drift-check verifies both tokens exist and that `.app-header`/`.page-hero` use them.
- Base components must reference `var(--accent)` — never a hardcoded `--teal`/`--blue`/`--purple`. This is what lets one component stylesheet serve every level.
- Base sizing is pinned: `html { font-size: 15px; -webkit-text-size-adjust: 100% }`, and `--main-max: 1180px` caps content width so wide monitors render identical line lengths.

**Enforce:** `node _shared/check-consistency.js` before every publish. Non-zero exit = drift.

**The drift-check also parses every inline `<script>`** and fails with `SCRIPT WILL NOT RUN` if any block has a syntax error — a single broken block silently disables an ENTIRE dashboard (no init, no handlers; the page just sits on its default welcome screen and nothing is clickable). It chunks scripts the way a browser does: a script element ends at the first literal `</script`. Do NOT validate with a regex that skips `<script src=...>` tags — that mis-pairs opening/closing tags and validates the wrong text, which is exactly how a missing comma in `pomatch.html`'s `EXAM_QUESTIONS` went undetected on 2026-09-10.

## 2. Reference Materials — shared registry (full progressive model)

Every dashboard's Reference tab is built from **one shared section registry** (pasted identically). Each section is tagged:

- `scope`: `core` (appears in every dashboard) or `dash` (this dashboard only)
- `behavior`: `static` (identical everywhere) or `progressive` (accumulates/deepens as certs are earned)
- `requires`: cert keys that must be earned for the section to unlock

| Section | Scope | Behavior |
|---|---|---|
| Quick Reference (glossary + per-level cheat block) | core | progressive |
| Discovery Questions | core | progressive |
| Objection Handler | core | static |
| Battlecards | core | static (see §4) |
| Scripts & Videos (demo dashboards only: Demo 101, Demo 102, PO Match) | core-for-demos | static — **always the 2nd tab, right after Quick Reference**; one layout: resources card (script doc / video links) → video embed → in-page script content where we own it. Fundamentals has no demo, so no tab. Standardized 2026-09-10 via `inject-scripts-tab.js` (Demo 101's script card was lifted out of Quick Reference; PO Match embeds its cheat sheet + full script). |
| Industry Verticals | core | **progressive by profile** — filtered to the rep's selected verticals ("show all" toggle), canonical profile + this dashboard's lens; see §7 |
| Scenarios / Capabilities Menu / Cert Roadmap / Demo Mastery | dash | static |

**Track links are gate-aware (2026-09-10).** Each Learning Path track links to **that dashboard's Reference Materials** (`<file>.html#ref`), not its Dashboard — the reader is already in a reference context. A track whose prerequisites are unmet shows `🔒 Unlocks after <prereq> certification` instead of a link, and its asset chips render as plain text, so the path never links into a gate screen. The unlock rule mirrors `ottGateAllows` exactly (every prerequisite `examPassed`, or that dashboard's own record carries a confirmed `bypassed`), and `requires`/`requiresLabel` live on the track in `LEARNING_PATH`. **All tracks stay visible** — the roadmap (and the "x of 4 earned" progress) is the point of the section; locking the links keeps it honest without hiding what is ahead.

**Deep links (2026-09-10):** Learning Path asset chips are links. A bare `#ref` opens Reference Materials on the target dashboard; `#ref=<tab-id>` opens a specific tab. Same dashboard → `ottOpenRefTab('<tab-id>')` opens the tab in place; other dashboard → `<file>.html#ref=<tab-id>`, and the shared learning-path module on the target waits for the session to restore (`#app-shell.active`), calls `showRef()` + `switchRefTab()`, then strips the hash. With no session (welcome/gate screen) the hash is left alone and nothing happens. Any dashboard can be deep-linked this way from anywhere (e.g. Slack): `demo102.html#ref=ref-scripts`. Asset→tab mapping lives in `LEARNING_PATH[].assets` (`{l:label, t:tab-id}`).

**"Grows with completion"** works with **zero server state**: the renderer reads the other dashboards' cert flags from localStorage **read-only** and reveals/teases sections accordingly. It must **never write** to another dashboard's key. Tab IDs are standardized (`ref-learning`, `ref-quickref`, `ref-discovery`, `ref-objections`, `ref-battlecards`) and the pill styling is identical across all files (`ref-cheat` was renamed to `ref-quickref` in Fundamentals + Demo 101 on 2026-09-10).

## 3. Non-destructive updates (never reset a cert)  → `verify-nondestructive.js`

Pushing new HTML never touches localStorage, so progress survives **as long as** these rules hold:

1. **Never rename** the cert keys, and never change the `examPassed` field name (the portal gates on it):
   `ottimate_fundamentals_state`, `ottimate_demo_state`, `ottimate_d102_state`, `ottimate_pomatch_state`.
2. **Additive schema only.** Add a `schemaV` field; on load, fill missing fields with safe defaults and re-save. Never `clear()`/`removeItem` except in the explicit user "Not you?/reset" action. (This is exactly how `verticals` was added to PO Match without disturbing anyone.)
3. Progressive Reference reads cross-dashboard flags **read-only**.
4. **Cache-bust on deploy** (versioned filename or `?v=` query) so GitHub Pages actually serves the new file.

**Proven:** `ottSnapshot()` on the old build → deploy new build → `ottVerify(snapshot)` must report `CERT_LOST:false` for every key. Validated 2026-09-10: after a redeploy, Demo 101 + Demo 102 stayed certified and byte-identical.

### Additive migration — shared module  → `state-migration-module.js` + `inject-statemigrate.js <file>`
Rolled into all 4 dashboards 2026-09-10. `ottMigrateState(key)` fills MISSING array/object fields from `OTT_STATE_DEFAULTS`, stamps `schemaV` (`OTT_SCHEMA_V = 2`), and re-saves ONLY if something changed; a corrupt blob is returned as `null` and left untouched (never cleared). Each dashboard's state load goes through it, and `saveState()` writes `schemaV`. The module is injected at the TOP of the state-loading `<script>` block — the L1 loads are parse-time IIFEs, so the module's `var`s must already be assigned when they run (hoisting alone would leave them `undefined`).

To add a persisted field: add its default to `OTT_STATE_DEFAULTS`, bump `OTT_SCHEMA_V`, re-run `node _shared/inject-statemigrate.js <file>` on every dashboard.

**Vertical inheritance (2026-09-10).** A record with `name` but `verticals: []` (a profile created before that dashboard collected verticals — e.g. PO Match profiles from before its vertical model) inherits the same person's verticals from another dashboard's record on load (sibling records are read only; only the own record is written). This is what makes the Industry Verticals tab, the profile card, and the Demo Lens filtered from the first load instead of falling back to "all". Superseded for ongoing use by the shared profile (§5), which keeps name/role/verticals in sync across all dashboards; this fallback still covers records whose name does not match the shared profile.

**Cert guard (`ottSafeSetState`, 2026-09-10).** Every dashboard's `saveState()` writes through `ottSafeSetState(key, obj)`. If the stored record has `examPassed:true` and the payload would drop it, the stored record is kept (only `name`/`role`/`verticals` are updated) and a `[ottimate] cert guard` console warning is logged. This closes the one path that could overwrite a cert without the user asking: a failed restore followed by the cross-dashboard profile auto-onboarding (which calls `saveState()` with blank progress). The only legitimate downgrade — the user-confirmed Fundamentals vertical change — sets `window.__ottAllowCertReset = true` immediately before its save (one-shot). "Not you? / Reset" uses `removeItem`, so it is unaffected. Verified: certified record + blank save → cert kept; flag + save → reset applied.

**Reading a browser's records.** `localStorage` is per browser profile × origin. The portal reports *certifications only* (`examPassed`) — module progress inside a dashboard never shows as "Completed" on the portal. `certDate` is stamped when a profile is created (welcome screen or cross-dashboard auto-onboarding), not only on certification. A record with `name` but empty `modulesDone`/`quizScores` and `examScore:null` is a blank profile, not a wiped cert.

Verified 2026-09-10: snapshot → load all 4 → diff = only `schemaV` added (Demo 102 also gained the `[]`/`{}` defaults it was missing); `CERT_LOST:false` everywhere.

## 4. Battlecards — single source  → `sync-battlecards.js`

- Canonical source: **`Competitive Battlecards/index.html`**, the `COMPETITORS` object (9 competitors; fields `pitch`/`weaknesses`/`winmoves`/`gaps`/`scores`; threat `HIGH`/`MEDIUM`/`LOW`). `battlecards.html` in that folder is a drifted archival copy — do not use.
- DONE: every dashboard renders from the generated module (15 competitors, **HIGH/MEDIUM/LOW**). The old static 9-competitor `.bc-print-section` markup (and pomatch's `battlecardPrintSection()`) was removed 2026-09-10 — the print section is now built at runtime only (`#ott-bc-print`).

## 5. Profile card & editor — single source  → `profile-module.js` + `inject-profile.js <file>`

Every dashboard shows the same **👤 Your Profile** card (role + vertical chips + "✎ Edit role & verticals") directly under the Dashboard hero, with one inline editor. Rolled into all 4 dashboards 2026-09-10; each dashboard's previous editor was retired (Fundamentals/Demo 101 `.ev-overlay` modal, PO Match's inline `profileCard`).

### One shared profile (2026-09-10)

A rep enters name / role / verticals **once**. `ottimate_profile` = `{ name, role, verticals, updatedAt }` is the source of truth; every dashboard's own record keeps a copy (webhooks and emails read from there, and it stays backward compatible).

- **Read:** `ottMigrateState(key)` calls `ottBootstrapProfile(key)` (builds the shared record from existing dashboard records on the first load after deploy), then overlays name/role/verticals onto the dashboard record — **only when the names match**, so a record belonging to someone else is never rewritten.
- **Write:** the profile editor calls `ottWriteProfile(...)`; first-ever onboarding writes it from `ottSafeSetState` when the welcome form saves. Every other dashboard picks the change up on its next load.
- **No record yet + a profile exists** → the record is created from the profile with empty progress, so the dashboard skips its welcome form entirely.
- **Roles are unified** — `OTT_ROLES` (AE, SE, SDR, CSM, MGR, PARTNER, OTHER). Legacy stored values (Demo 102's full-text labels, Fundamentals' `PARTNER`, etc.) are normalized on load via `OTT_ROLE_LEGACY`. Welcome-screen cards are regenerated by `inject-roles.js`; heroes and notification payloads send `ottRoleLabel(role)` (the label), while records store the key.
- **Reset is now global:** "Not you? / Reset" (and the portal's reset) call `ottResetAllProgress()` — every dashboard record **and** the shared profile. With one profile across dashboards, a per-dashboard reset would leave one person's progress attached to another's name.

### Certs are snapshots — a profile change never resets anything

Nothing on the profile path writes `examPassed`, `examScore`, `modulesDone`, `quizScores`, or `certVerticals`. `certVerticals` is frozen when the exam passes, and the portal's earned cards now read *"Earned &lt;date&gt; · for Restaurants, Grocery"* — the cert records the verticals it was earned under, whatever the profile says later.

Content always follows the **current** profile (reference tabs, lenses, Module 3 reading content); completion status does not.

**Staleness is derived, not flagged (2026-09-11).** Fundamentals snapshots the verticals Module 3 was passed with (`APP.m3Verticals`, persisted) and the exam already snapshots `certVerticals`. On every Dashboard render `ottVerticalsStale()` compares those snapshots with the current (shared-profile) verticals: the review / optional-retake nudge appears when they differ — **no matter which dashboard changed the profile** — and disappears again if the rep reverts to the selection they completed with. Records that completed Module 3 before the snapshot existed are seeded once with their current verticals. The portal shows the same signal quietly on the Fundamentals card (`.vert-note`) so a rep knows before opening it. There is deliberately **no modal pop-up**: the change is legitimate and certs are snapshots. Fundamentals Module 3 is the only vertical-graded content: changing verticals after completing it sets `m3Stale` and shows a nudge on the module card — *"Your verticals changed… your completion and certification are unchanged"* — with an optional **Retake for my new verticals** button (`ottRetakeModule3()`, confirm-gated, sets `__ottAllowCertReset` for that one save). This replaced the old behaviour, which reset Module 3 + the exam automatically behind a confirm.

### 🎯 Demo Lens + the standard Dashboard view (2026-09-11)

The same module inserts a **`#lens-card`** directly under the profile card on EVERY dashboard: per-vertical call-outs from `VERTICAL_LENSES[dashboard]` (Demo 101 / 102 / 201) or, for Fundamentals (which has no lens), each selected vertical's tagline + ICP from `VERTICAL_PROFILES` ("🎯 Your Verticals — At a Glance"). More than 2 selected verticals → two columns (`.pc-lens-2col`, collapsing under 860 px). It re-renders on every dashboard render, so a profile edit refreshes it; the footer link deep-links to the Industry Verticals tab. PO Match's original inline `lensCard` was retired in favour of the shared one.

**Dashboard view order, identical everywhere:** hero → 👤 Your Profile → 🎯 Demo Lens → progress card (exam button when unlocked; **`🏆 View Certificate`** whenever `examPassed`) → module cards in the Demo 101 layout (`.module-card`: icon, ✓ check, "Module N: Title", description, `⏱ time`, status badge, quiz score). Every module carries an estimated duration in its `MODULE_META` (content-measured: ~140 wpm reading + 0.75 min per quiz question + screenshots/steps, rounded up to 5 min) — re-estimate when a module's content changes materially.

## 6. Prerequisite gates — one rule  → `ottGateAllows` / `ottRecordBypass` (in `state-migration-module.js`)

Gated dashboards: **Demo 102** (requires Demo 101) and **PO Match** (requires Demo 101 + Demo 102). Aligned 2026-09-10 — before that Demo 102 gated every load with a session-only bypass (re-bypass + a new email on every visit) while PO Match skipped the gate entirely whenever a saved profile existed.

The rule, identical in both: **the gate is checked on every load, before the session is restored**, and lets the user in only if
- every prerequisite record has `examPassed: true`, **or**
- this dashboard's own record carries `bypassed: true` — written once by `ottRecordBypass(ownKey)` when the user confirms "completed on another device". The bypass notification email therefore fires once.

Consequences: a stray/legacy profile can never skip the check; `saveState()` carries `bypassed` forward automatically (handled in `ottSafeSetState`, so dashboards don't list it in their payloads); "Not you? / Reset" removes the record, so the gate returns for the next user. After a confirmed bypass both dashboards re-run their init (`initApp()` / `init()`) so an existing profile restores instead of showing the welcome form. Users who bypassed under the old PO Match behaviour have no `bypassed` flag and will be asked to confirm **once** more.

Gate calls: Demo 102 `initApp()` → `ottGateAllows('ottimate_d102_state', ['ottimate_demo_state'])`; PO Match `init()` → `ottGateAllows('ottimate_pomatch_state', ['ottimate_demo_state','ottimate_d102_state'])`. Verified: prereqs met → no gate; prereq missing + saved profile → gate; bypass once → profile restored, reload → no gate, flag survives saves.

## 7. Industry Verticals — single source + per-dashboard lens  → `verticals-profiles.js` + `verticals-lenses.js` + `inject-verticals.js <file>`

Rolled into all four dashboards 2026-09-10. Before: Fundamentals and Demo 101 each carried their own copy of the same six profiles in two different data shapes; Demo 102 had nothing despite its onboarding promising "your reference materials will reflect your selection"; PO Match had one-line lenses on the Dashboard only.

- **Canonical profiles:** `_shared/verticals-profiles.js` (`VERTICAL_PROFILES`: emoji, label, tagline, desc, pain[], solve[[title,text]], icp, voice). Edit here only. The injector also **regenerates `VERTICAL_DATA`** (Module 3 / quiz content) in `fundamentals-training.html` and `demo-training.html` from it, so module content and the reference tab cannot drift.
- **Lenses:** `_shared/verticals-lenses.js` (`VERTICAL_LENSES[dashboard][vertical] = { draft?, points:[[title,text]] }`) — how THIS dashboard's demo lands for that vertical. Demo 101 (Core AP + Statements) and Demo 102 (Vendor Pay & Reporting) lenses are **DRAFTS** written 2026-09-10 from those dashboards' own module content and show a "Draft — pending Enablement review" chip; set `draft:false` once reviewed. PO Match lenses were expanded from its former `VERTICAL_LENS` + the demo script. Fundamentals is the general profile — no lens.
- **Rendering:** `verticals-module.js` (identical everywhere; data prepended as JSON by the injector) renders into `#vr-mount` when the `ref-verticals` tab opens: header card (selected-verticals note, "Show all 6 / Show my verticals" toggle, Print), accent pills per vertical, profile card with the lens box first. Follows the profile editor live (re-renders on each tab open). The tab sits right after Objection Handler on every dashboard.
- Retired: Fundamentals' `VERTICAL_PRINT_DATA` + `renderVerticalRefPanel()` + `switchRefVTab()`; Demo 101's inline verticals build inside `renderRef()`.
- Gotcha (hit 2026-09-10): the profile text contains dollar amounts ("$100,000") — any `String.replace` that splices the data must use a **function** replacement, otherwise `$1` is read as a capture-group reference and corrupts the output.

## 8. Content accuracy — the exams are the source of truth

The graded content (`EXAM_QUESTIONS` + `QUIZ_DATA` explanations — 134 items across the four dashboards) was written against the product and, for PO Match, verified against the `plateiq/server` codebase. **Prose — demo scripts, cheat sheets, vertical lenses, key facts — must not contradict it.** The script and the exams were authored in different sessions and DID drift: a cross-check on 2026-09-11 found five factual errors.

**Known misconception traps — check new prose against these:**

| Trap | The fact |
|---|---|
| Rules engine posting to Slack | **No native Slack action.** Change match state, flag, call a webhook, approve. (The Slack handler is commented out in the codebase.) |
| Ottimate creating or closing POs | POs/receipts are created in the procurement system and synced in. Ottimate links the bill to the PO; **the ERP closes it** and that closure syncs back. |
| Statement Reconciliation checking payment status | It finds **missing invoices, credit memos, and total discrepancies**. It does **not** check payment status (click a reconciled invoice for that). Duplicates are a **Needs Attention** feature, not statements. |
| Fallback approvers = out-of-office cover | That is **stand-in** approvers. **Fallback** approvers are time-based escalation configured on an approval policy. |
| vCard rebates for grocery | **Not available for grocery clients.** Lead with one-to-one reconciliation and payment efficiency. |
| Auto-credit / automated vendor credits | No in-system auto-credit. Surface the variance → accept with a note, use PO price, or short-pay; the credit is handled with the vendor outside the system. |
| "Touchless" / 100% automation | Clean invoices flow; real exceptions still stop for a person. |
| Auto-code overwriting existing coding | Line dimensions fill **empty** invoice lines only; header dimensions carry over. |
| UOM conversion being silent | It converts **and still surfaces the item to confirm** — never a silent auto-accept. |
| Excluding a line deleting it | The line **stays on the invoice** and expenses normally; it just no longer holds up the match. |

**How to re-run the check:** extract every `q` / `correct` / `explanation` from all four dashboards, then read the explanations of the misconception items (those whose explanation contains a negation). Any prose claim that contradicts one is a bug in the prose, not in the exam.

Commercial claims (rebate sizing, savings percentages) must be traceable to a dashboard module — quote the customer's own numbers, never promise payback. Competitive battlecards carry an "Internal use only — verify before using in customer conversations" disclaimer in all four dashboards; keep it.

---

---

## Files in `_shared/`
- `ottimate-tokens.css` — canonical tokens + per-level accents (source of truth). Accents are each dashboard's OWN dominant color (Fundamentals/Demo 101 blue, Demo 102 teal, PO Match indigo, portal blue) so shared components look native.
- `check-consistency.js` — drift-check (run before publish)
- `verify-nondestructive.js` — cert-survival verifier (run in browser around a deploy)
- **Battlecards (single source):** `sync-battlecards.js` (regenerates `generated/battlecards-module.js` from `Competitive Battlecards/index.html`) + `inject-battlecards.js <file>` (wires it into a dashboard). 15 competitors, HIGH/MEDIUM/LOW, interactive + print, styled in each dashboard's accent.
- **Progressive Learning Path:** `learning-path-module.js` + `inject-learningpath.js <file>` — a shared "🗺️ Learning Path" reference tab in every dashboard that reads all cert keys read-only and grows as certs are earned (journey + per-track power-question/key-fact playbook that unlocks on certification).
- Shared components use one canonical accent-fill **pill** for `.ref-tab` (border-radius 100px; active = `var(--accent)`), identical across all dashboards.
- **State migration (single source):** `state-migration-module.js` + `inject-statemigrate.js <file>` — additive schema migration, see §3.
- **Profile card & editor (single source):** `profile-module.js` + `inject-profile.js <file>` — shared "👤 Your Profile" card + inline role/verticals editor; one shared `ottimate_profile` record and the unified role list (`inject-roles.js`), see §5.
- **Industry Verticals (single source):** `verticals-profiles.js` (canonical profiles) + `verticals-lenses.js` (per-dashboard lenses) + `verticals-module.js` (render) + `inject-verticals.js <file>`, see §7.
- **Demo environment link (single source):** `inject-demoenv.js <file>` — adds "🖥️ Demo Environment ↗" to the sidebar RESOURCES section (directly under Reference Materials) in ALL FOUR dashboards, plus a muted access note. Persistent, identical position everywhere, opens in a new tab. URL + copy are constants at the top of the injector — edit once, re-run on each dashboard. Current URL: https://demo-2026-api.plateiq.com/demoapp/ (also in both PO Match Docs .md sources).
- **Scripts & Videos tab:** `inject-scripts-tab.js <file>` (demo dashboards) + `md-lite.js` (dependency-free Markdown→HTML). The tab is **links only** — scripts and videos open in a new tab, never inline (an embedded version was tried 2026-09-10 and rejected as far too long to follow). **PO Match's demo script and cheat sheet are owned in `PO Match Docs/*.md`**; the injector generates standalone, styled, printable **`PO Match Docs/*.html`** documents from them (screenshots reference the real files in `pomatch-assets/`, collapsed by default, omitted in print; each doc links to the other and back to the dashboard). Edit the `.md`, re-run `node _shared/inject-scripts-tab.js pomatch.html`, and deploy the `PO Match Docs/` folder with the site. Demo 101/102 link to their Google Docs/Drive resources; the PO Match video is "coming soon" until a current-UI recording exists.
- `CONSISTENCY-GUIDE.md` — this file

### Re-sync workflow (single source → all dashboards)
1. Edit the canonical source (tokens, `Competitive Battlecards/index.html`, or a `_shared` module).
2. Regenerate if needed: `node _shared/sync-battlecards.js`.
3. Roll to dashboards: `node _shared/inject-battlecards.js <file>` / `inject-learningpath.js <file>` / `inject-statemigrate.js <file>` / `inject-profile.js <file>` / `inject-verticals.js <file>` / `inject-roles.js <file>` / `inject-demoenv.js <file>` for each, plus `inject-scripts-tab.js <file>` on the three demo dashboards.
4. `node _shared/check-consistency.js` (expect all ✓), then verify in browser.
