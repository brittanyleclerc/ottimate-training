# Release Update Manager

## Purpose

This is a master skill for handling product and UI updates across the training platform without forcing users to retake entire dashboards.

It is intended for cases like:
- new demo features such as Card on File
- UI changes that require updated screenshots or training materials
- small workflow updates that should not trigger a full training reset
- targeted refresh modules for users who already completed a dashboard

---

## Platform mechanisms this skill can use (built 2026-09-11)

The portal now has real, tested mechanisms for most of what this skill describes. Use them instead of inventing a flow. All are governed by `_shared/CONSISTENCY-GUIDE.md` (section numbers below) and enforced by `node _shared/check-consistency.js`.

| Need in this skill | Mechanism | Where |
|---|---|---|
| Know who to notify | Every profile carries a **work email** (required; banner until added). Reps' emails live in `ottimate_profile` in their browser and reach Enablement through the Make.com events (bypass, verification, certification). | §5, §9, `BYPASS-VERIFICATION-SETUP.md` |
| Mark that a dashboard's graded content changed | **Content versions** — `OTT_CONTENT_VERSIONS[key] = { version:'YYYY-MM-DD', policy, note }` in `_shared/state-migration-module.js`. Every exam pass is stamped with the version it was passed under (`certContentV`) and its score total (`examTotal`). | §13 |
| Prior completers stay current **without** a full retake | `policy: 'optional'` → certification stands; dismissible "content updated — retaking recommended" banner in the dashboard, note on the portal card, hint in the Learning Path. Old quiz/exam results are shown as **recorded** (never re-graded against new questions). | §13 |
| Prior completers **must** redo it (the PO Match early-completer case) | `policy: 'required'` → **renewal**: on next visit the prior certification is archived (`priorCerts`), progress reset, portal shows "Renewal required", dashboard shows the renewal banner; passing the new exam renews. Prerequisite gates still honour the prior cert meanwhile. | §13 |
| Stage a release to some roles first (testers / reviewers) | **Preview gate** — `OTT_PREVIEW_GATES[key] = { roles:['AE','SDR'], title, message }` in `_shared/preview-gate-module.js`: portal card "In final review" + popup, hold screen in the dashboard (before the bypass), Learning Path hint. Release = `roles: []`. | §12 |
| Verify someone who claims to have completed a prerequisite elsewhere | **Self-attestation + admin verification** — bypass → "Self-attested" everywhere; Enablement approves/rejects from the Make email; rep can add a Certificate ID or upload their certificate as evidence. | §6, §10, §11 |
| Prove a certificate is genuine | **Certificate IDs** (`OTT-<CODE>-<YYYYMMDD>-<VERTS>-<CHK>`) printed on every certificate since 2026-09-11; validated offline against the rep's name. | §11 |
| One certificate design, "View My Certificate" from the portal | Shared certificate module + `#certificate` deep link. | §11 |
| Learner state tracking (the "Learner state model" below) | Per record: `examPassed`, `certDate`, `certVerticals`, `certContentV`, `examTotal`, `priorCerts[]`, `renewal`, `bypassed/bypassedAt/bypassId/bypassVerified/bypassRejected`, `quizScores`, `modulesDone`. Shared profile: `name, email, role, verticals, certClaims`. | §3, §5, §13 |

**Not built yet (still design):** delta / micro-modules for prior completers ("what changed" module + short knowledge check), the release registry, automatic release emails, per-user resets from the admin side. The natural home for the first two is a new module type flagged in `MODULE_META` + a version bump with `policy: 'optional'`; per-user resets would ride on the verification feed (§10).

## Operating recipe: releasing an update to an existing dashboard

1. **Edit content** in the dashboard (modules, quizzes, `EXAM_QUESTIONS`) and any shared prose it owns (script `.md`, vertical lens). Run the accuracy cross-check (the exams are the source of truth — guide §8).
2. **Bump the content version** if any graded content changed: add/update `OTT_CONTENT_VERSIONS[key]` with `policy: 'optional'` (the default — do not force retakes without a decision) or `'required'`, and a one-line `note` written for the rep. Re-run `node _shared/inject-statemigrate.js` on the four dashboards **and `portal.html`**.
3. **New feature that changes the demo?** Re-estimate the module's `MODULE_META` time, update screenshots in the asset folder, keep "Scripts & Videos" links-only.
4. **Staged rollout?** Add an `OTT_PREVIEW_GATES` entry for the roles that should wait; re-run `inject-previewgate.js` on the four dashboards + portal. Remove it (`roles: []`) on release day.
5. `node _shared/check-consistency.js` → all ✓. Run the headless suites if the change touched shared modules.
6. **Publish**: sync to a fresh clone of `brittanyleclerc/ottimate-training` (`git -c core.longpaths=true clone`), commit, push; Pages rebuilds in ~2 min. Nothing touches learners' localStorage.
7. **Tell prior completers**: today this is a manual email (their addresses are on their profiles / in the Make Sheet). Copy: what changed · why it matters · that they do **not** need a full retake (optional policy) *or* that they will be asked to renew on their next visit (required policy) · link to the portal.


## Recommended design

This should be a single umbrella skill with modular sub-flows, not a one-off prompt.

The skill should coordinate:
1. feature intake
2. impact scanning across dashboards and materials
3. update planning
4. content drafting and dashboard edits
5. creation of a short delta-training module
6. communication to prior completers
7. testing and validation

The key idea is: identify the change, find the affected content, propose updates, and allow a human to approve before publishing.

---

## Skill name

Release Update Manager

## Trigger phrases

- update training for a new feature
- refresh demo content after a UI change
- add a new feature without making users retake the full dashboard
- identify what needs updating across all training modules
- create a short update for users who already completed training
- release a feature update to an existing dashboard

---

## Inputs

The user provides:
- feature name
- what changed
- release date or demo version
- screenshots or demo recordings
- affected dashboard/module names
- notes on stale or missing content
- target learners
- whether this is a new feature, workflow change, or UI refresh
- whether prior completers need a lightweight update

Optional inputs:
- product release notes
- screenshots of old and new UI
- links to supporting documentation
- internal notes or change summaries
- existing code, demo scripts, or implementation notes
- training materials or other dashboards that reference the same feature
- user-added references, links, PDFs, screenshots, or recordings
- a note that a feature is still evolving or documentation is incomplete

### Resource intake model
The skill should be able to do the following before writing updates:
- pull from existing code, assets, docs, screenshots, and dashboard content when available
- identify likely source material for the release summary and screenshots
- present those sources to the reviewer for approval
- clearly flag missing information when no reliable source exists yet
- offer the user an option to add or link additional materials they want included

This keeps the workflow evidence-based without assuming the release information is already complete.

---

## Outputs

The skill should return:

### 1. Impact report
A list of likely affected areas, such as:
- dashboard walkthrough content
- reference materials
- screenshots and assets
- quiz questions
- script language or feature descriptions
- release notes or announcements
- related feature references in other dashboards
- secondary content that should stay aligned with the owning dashboard

Each finding should include:
- primary dashboard owner
- related dashboards or modules that reference the same feature
- confidence level
- whether it is a direct update, related reference, or informational note

### 2. Source and resource review
A curated list of available supporting materials, including:
- screenshots and assets already in the workspace
- dashboard or script content relevant to the release
- code or notes that describe the new feature behavior
- release documentation already available internally
- user-added links, PDFs, screenshots, or recordings

This should clearly separate:
- confirmed sources
- likely sources requiring review
- missing sources / no reliable source found
- user-added sources to include

### 3. Recommended update plan
Grouped into:
- must update
- should update
- optional refresh
- not relevant

### 4. Draft changes
Suggested edits for:
- new feature explanation
- updated walkthrough steps
- quick-reference notes
- screenshots to replace or add
- question updates for quizzes or checks

### 4. Delta training module
A short update module for already-completed learners with:
- what changed
- why it matters
- where it appears in the workflow
- screenshot evidence
- short knowledge check

### 5. Communication draft
User-facing copy for:
- what changed
- why it matters
- that they do not need a full dashboard retake
- how to access the small refresh module

### 6. Validation checklist
A final review list covering:
- current UI accuracy
- screenshot accuracy
- quiz correctness
- learner flow quality
- communication clarity

---

## Workflow

### Step 1: Intake
Normalize the incoming information into a structured feature record.

Example:

```json
{
  "feature_id": "vendor-pay-card-on-file",
  "name": "Card on File",
  "category": "Vendor Pay",
  "release_date": "2026-09-11",
  "demo_version": "current",
  "summary": "New payment flow allows storing a card for eligible vendor payment actions.",
  "type": "new_feature",
  "impacted_dashboards": ["demo102.html"],
  "need_prior_user_update": true,
  "need_targeted_training": true
}
```

### Step 2: Impact scan + resource gather
Search the workspace for likely impacted content, including:
- dashboard training text
- reference material blocks
- screenshot folders
- walkthrough content
- related quiz items
- named feature lists and workflow sections
- cross-dashboard references to the same feature or workflow
- release notes, code comments, or implementation notes
- supporting screenshots or videos tied to the new functionality

This should scan beyond the obvious page text and include asset folders and related training content.

Important rule: every update should have one primary dashboard owner, while also identifying related references in other dashboards or supporting materials that may need visibility or alignment. The skill should not treat all dashboards as equal owners of the same change.

#### Resource gathering protocol
The skill should compile a reviewable list of available materials before drafting edits. It should:
- pull from current files, visuals, scripts, and demo content already in the workspace
- look for likely screenshots, docs, and references that can be reused or updated
- identify whether the release info is complete or whether it is missing critical detail
- present a shortlist of source candidates for approval
- allow the user to add or link additional sources if they prefer

If the release information is limited or unclear, the skill should say so explicitly and propose a user-supplied source list instead of guessing.

#### Cross-dashboard reference check
After identifying the primary dashboard, search for:
- other dashboards that mention the same workflow, feature, or terminology
- screenshots or training notes reused across modules
- tools, reference pages, or quick-start materials that should remain consistent
- release notes or landing pages where the feature is listed

These should be classified as:
- direct update required
- related reference only
- no update needed
- needs manual review

### Step 3: Prioritize findings
Sort the results by confidence:
- high confidence: likely must update
- medium confidence: relevant but not mandatory
- low confidence: possible relevance; manual review required

### Step 4: Request confirmation
Present the user with a shortlist of matches and ask them to approve or reject each item.

This should include:
- what to change
- which dashboard owns the update
- which related dashboards reference the same capability and may also need review
- whether to replace content or add new content
- whether to update screenshots
- whether to create a delta module for prior completers
- whether to send a release notice

The human reviewer should confirm the primary dashboard ownership before broad updates are published.

### Step 5: Build update plan
Create a concrete action list such as:
- add a new payment-method step in the walkthrough
- refresh the screenshot set
- add a quick-reference note
- add short quiz questions
- create targeted training for completed learners
- draft communication to prior completers

### Step 6: Create delta-training
Generate a lightweight follow-up module for users who already completed the original dashboard.

This should include:
- what changed
- why it matters
- where in the workflow it appears
- screenshot or before/after comparison
- short knowledge check

### Step 7: Draft communication
Write a short release note such as:
- “A new feature has been added to the Vendor Pay workflow.”
- “You do not need to retake the full dashboard.”
- “Complete the short update module to stay current.”

### Step 8: Validate
Before finalizing, verify:
- the content matches the current demo environment
- screenshots reflect the live UI
- quiz questions still match the actual workflow
- the targeted learner path is clear and not too heavy

---

## Example: Card on File

### Input
- Feature: Card on File
- Module: Vendor Pay
- Need: add feature to demo training and notify prior completers

### Likely impacted areas
- Vendor Pay training walkthrough
- payment workflow screenshots
- reference material summary notes
- any quiz content describing the current payment flow
- other dashboards or portal pages that reference Vendor Pay payment methods
- related screenshots or summary notes that should stay aligned with the same workflow

### Output example

#### Must update
- walkthrough steps for payment options
- demo screenshots showing the updated flow
- feature explanation in quick reference

#### Should update
- payment-method glossary or reference wording
- supporting notes for vendor payment setup

#### Add delta module
- Card on File: what it is, how it works, where it fits in the workflow

#### Add targeted questions
1. When is Card on File most useful in a vendor payment flow?
2. What problem does it solve?
3. How is it different from a standard vendor payment method?

#### Prior user message
- “A new vendor payment capability has been added to the demo environment.”
- “This is a short update; you do not need to retake the full dashboard.”
- “Complete the Card on File update module to stay current.”

---

## Portal requirements to support this

The portal should support a lightweight release model:

### Release registry
Store records for each feature/update, including:
- feature name
- primary dashboard/module owner
- related dashboards or references
- release date
- status
- affected content
- learner requirement
- follow-up module id

### Ownership rule
Each update should be mapped to one primary dashboard, even if related references appear elsewhere. That keeps the release organized and prevents the same change from being treated as a full rewrite across the entire training portal.

### Targeted refresh modules
A short, separate module type for updates that are not full dashboards.

### Learner state tracking
For each user, track:
- original dashboard completion
- feature update completion
- last release announcement viewed
- whether they are current on relevant updates

This allows a user to complete the original dashboard once and still stay current with new features through targeted refreshes.

---

## Recommendation

This should be kept as a master skill, but the implementation should remain human-approved and modular.

The goal is not to automatically rewrite all training content. The goal is to:
- find likely impacts
- draft the needed updates
- build lightweight follow-up learning for existing users
- keep the process scalable and reviewable

That is the right model for a training platform that is evolving quickly.

- dashboard/module
- release date
- status
- linked content sections
- learner eligibility
- user completion rules

### Targeted update modules
A separate section or micro-module type for:
- feature refresh
- UI refresh
- workflow update
- policy or process change

### Learner state model
Keep track of:
- completed base dashboard
- completed feature update modules
- last update check date
- release notes acknowledged
- feature completion status

This allows a user to complete the original dashboard once and still stay current with new features via small follow-up modules.

---

## Testing plan

Use this skill with a sample feature update and validate the following:

### Functional tests
- Does the skill correctly identify likely update locations?
- Does it distinguish between must-update and optional-update items?
- Does it generate a sensible delta-training module?
- Does it produce release communication text for prior completers?

### UI tests
- Are the dashboard changes easy to review and approve?
- Can the user select or reject suggestions cleanly?
- Can screenshots be updated without breaking layout or style?

### Learner flow tests
- User completes original dashboard
- New feature is released
- User is notified
- User opens targeted update module
- User completes short learning and quiz
- User is marked current without full dashboard reset

### Content quality tests
- Are questions clear and aligned to the new feature?
- Are screenshots version-accurate?
- Are materials updated without duplicating stale text?

---

## Recommended mandate for the skill

The skill should be designed to:
- reduce manual content maintenance
- prevent stale screenshots and copy
- make updates incremental rather than full-retrain events
- keep prior learners current without making them redo full dashboard work
- empower a human reviewer to approve, reject, and refine updates before publication

---

## Final source-backed release workflow

This is the practical operating version of the skill.

### 1. Intake and feature capture
Collect:
- feature name
- dashboard owner
- what changed
- relevant release date or version
- target learner group
- whether this is a feature, workflow, or UI refresh
- whether a delta module is needed for prior completers

### 2. Source review
Before drafting edits, gather and classify evidence from:
- existing dashboard pages and scripts
- related reference material
- screenshot libraries and asset folders
- code comments, implementation notes, or change documentation
- user-supplied sources, links, PDFs, recordings, or screenshots

Classify each source as:
- confirmed source
- likely source requiring validation
- missing information
- user-added source for inclusion

If no reliable source is available, the skill should say so clearly and request user input instead of inventing facts.

### 3. Impact review
Identify:
- the primary dashboard that owns the update
- related pages or dashboards with references to the same feature or workflow
- which content is a direct update, a secondary reference, or informational only
- which screenshots or materials are likely to be outdated or duplicated

### 4. Review package for approval
Present the user with a concise package containing:
- release summary
- source list and confidence levels
- primary owner dashboard
- related dashboard references
- proposed updates
- proposed screenshots to add or replace
- delta-training idea for prior completers
- missing-source items that still need input

The user decides:
- approve
- modify
- reject
- add more sources
- defer until additional release documentation is available

### 5. Update execution
Once approved, create the minimal changes needed:
- update the owning dashboard content
- adjust related references only when they are relevant
- replace, add, or annotate screenshots if approved
- add a short update module for users who already completed the original training
- draft the release communication for prior completers

### 6. Final approval gate
Before publishing, confirm:
- the dashboard owner is correct
- the sources used are valid and reviewed
- any missing information is disclosed
- the update remains targeted and does not force a full dashboard retake
- prior completers receive a lightweight, clear way to stay current

---

## Final recommendation

This skill should work as a source-aware, review-first release management system for training content. It should never assume the source material is complete, and it should never treat a feature update as a blanket rewrite across the whole portal. It should identify the primary dashboard owner, gather relevant supporting materials, flag gaps honestly, and present a clean review package before updates are made.

That is the right model for the training platform as it evolves.

This is the key: human approval remains required, but the skill does the heavy lifting of discovery, drafting, and impact mapping.

---

## Final summary

This should be a single master skill with modular sub-flows, not a one-off prompt. It centralizes the work of:
- identifying what changed
- finding where content is stale
- proposing edits
- creating short refresh training
- notifying prior completers
- validating the update

That makes it a practical solution for the real training-portal problems you are seeing with new capabilities like Card on File and future UI updates.
