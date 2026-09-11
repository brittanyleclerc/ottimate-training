# Ottimate PO Match — Demo Script & Walk-Through

*Reusable, customer-agnostic talk track for the **PO Match** demo. Delivery is built on the **Tell–Show–Tell** method and the demo principles in Robert Riefstahl's* Demonstrating to Win! *— lead with the differentiator, stay in the buying zone, tie every feature to a business outcome, and close on the payoff. ERP shown as an example: Sage Intacct. Runtime: ~30–40 minutes.*

**Demo environment:** [demo-2026-api.plateiq.com/demoapp](https://demo-2026-api.plateiq.com/demoapp/) · **Buyer on all seeded POs:** Sarah Carter

> 🔑 **No access?** If the demo environment does not load for you, contact your manager or your Ottimate rep to request access.

---

## How this script is built (the method)

You can run this cold, but it delivers best if you know *why* it's ordered the way it is. Six ideas from *Demonstrating to Win!* drive the structure:

1. **Tell–Show–Tell.** Never click before you've framed it. For each capability: **Tell** them what you're about to show and why it matters → **Show** it in as few clicks as possible → **Tell** them what just happened in business terms ("so what that means for you is…"). Every segment below is labeled this way.
2. **Primacy & recency — open and close are what they remember.** Open with your single strongest, most differentiating moment (the auto-link "aha"), not with the architecture diagram or an "about us." Close on the business outcome and the next step.
3. **Stay in the buying zone.** The workflow diagram, the API, the ERP mechanics are *framing*, not the show. Use them to orient, then get out of the weeds fast. Depth is for the scoping call.
4. **WIIFM by persona.** Every feature answers "what's in it for *me*" — and "me" is different for the clerk, the manager, and the controller. Aim each payoff at whoever's in the room.
5. **Menu approach in discovery.** Ask "Do you do that today?" before you show. Their answers tell you what to emphasize and let you show *their* process, not a generic one — including which of the **optional capabilities** (see the menu after the talk track) are worth pulling out at all.
6. **Kill the harmful habits and words.** No apologizing, no "basically," no spray-and-pray feature tour, no narrating the screen. See the guardrail box near the end.

---

## Know the room — WIIFM by persona

Match each payoff to whoever's actually listening. If you don't know who's in the room, ask in discovery.

| Persona | What they feel today | The payoff to hit |
|---|---|---|
| **AP processor / clerk** | Chasing missing POs, keying GL codes by hand, opening three tabs to reconcile | "You stop hunting. Coding, matching, and approval happen for you — exceptions come to *you*, you don't go find them." |
| **AP manager / controller** | No control over what auto-approves; can't trust the coding; too many touches | "You set the thresholds and the approval policy. Clean matches flow through; only real variances stop for a human." |
| **CFO / finance leader** | Overbilling and price creep slip through; tax hits a tax-exempt entity; slow close; and *another system to roll out* | "You catch the money leaks and you close faster — with no new system for the team to learn. Matching lives inside the AP workflow they already use." |

> **The single most important framing, used throughout:** *all* the PO and receipt data lives in Ottimate, and matching happens **inside the standard invoice workflow the customer already knows.** You're adding a matching layer, not a new system to learn. This is the differentiator — say it early, say it again at the close.

---

## Pre-demo discovery (ask before you share your screen)

Use the **menu approach**: ask "Do you do that today?" and take visible notes — it signals the real scoping conversation to come. Their answers decide what you lead with.

1. **New or existing PO process?** — *"Are you doing POs today, or is this a new process you're implementing?"*
   - **New process = Vision Generation.** You're painting a picture they've never seen — go slower, sell the *concept* of matching, keep it simple.
   - **Existing process = Vision Re-engineering.** They already match somehow (often manually or in the ERP). Lead with what's *broken* about that and how you remove the manual work.
2. **Two-way or three-way match?** — *"With PO creation, do you plan to do a receiving process? If so, you'd want a **three-way match** (invoice → PO → receipt). Or **two-way** (PO → invoice only)?"*
3. **Items vs. services / quantity vs. amount.** — *"Will you have one PO type for inventory/item-based purchases and another for services?"* Probe service structures: **fixed** (e.g., quarterly contract, 12 × $500) vs. **burn-down** (e.g., $5,000 pre-approved, drawn down over time).
4. **ERP.** — Confirm the ERP and that POs/receipts are created and approved there (Sage Intacct, NetSuite, QuickBooks, etc.).
5. **Who validates coding, and where?** — *"Today, does AP lay eyes on every invoice? Would you rather validate coding at PO creation, or keep a review step in Ottimate?"* Sets up the auto-approval conversation.

> **Why it matters:** these five answers decide whether you lead with three-way, whether you show amount-based matching, and how hard you lean on auto-approval. Don't try to resolve them live — capture them for the scoping call. *(Riefstahl's parking lot: "Great question — that's exactly the kind of thing we'll nail down in scoping. Let me note it.")*

**Conditional probes — only ask if there's time and a signal.** Each one, if it lands, unlocks a specific capability from the **optional menu** further down. Don't fish for all of them; follow the thread they open.

6. **All vendors on POs, or only some?** — *"Do you cut a PO for every vendor, or only certain ones — and are there vendors you'd never PO?"* → *"only some" / "it's mixed"* unlocks **Vendor-level PO requirements** (menu item A).
7. **Any vendors who invoice with no line detail?** — *"Do some vendors send you an invoice that's basically just a total, with no itemization?"* → *yes* unlocks **PO Flip** (menu item B).
8. **Informal rules you run by hand?** — *"Are there judgment calls you make the same way every time — 'if it's this vendor and under $25, just approve it' — or a person/channel you ping when something needs eyes?"* → *yes* unlocks the **Workflow rules engine** (menu item C — tease, don't deep-dive).
9. **What happens to the ones that just won't reconcile?** — *"When an invoice is legitimately fine but won't line up line-for-line, what do you do with it today?"* → *"it sits" / "we chase it"* sets up **Force-match** (menu item D) as the "nothing stays stuck" answer.

---

## Scenario map (demo environment)

Every seeded invoice and what it's built to demonstrate. Pick **one invoice per concept** you want to show — resist the urge to show them all (that's spray-and-pray).

> **Say it right:** "amount-based" vs. "quantity-based" below describes how each seeded **PO item is configured** — it's a per-item setting driven by config, *not* something determined by whether the match is 2-way or 3-way. Amount matching runs on both 2-way and 3-way POs. Don't teach a rule like "2-way is always amount-based."

### A. Auto-link & auto-match (the "happy path")
| Vendor | Invoice | Match type | What it shows |
|---|---|---|---|
| Hula Me Kala Culture Appreciation | 1100 | 2-Way (amount-based) | Remove last PO digit → auto-links, auto-matches, sets dimensions, approves via PO policy |
| McKesson | 20856156 | 3-Way (quantity-based) | Same auto-link flow, quantity-based |

### B. Unmatched items
| Vendor | Invoice | Match type | What it shows |
|---|---|---|---|
| Gordon Food Service | 9006406564 | 3-Way | 1 unmatched item that appears as a **suggestion** |
| William Murray Golf | INV4312 | 3-Way | 1 **shipping** item to **exclude** from the match |
| Alliance Beverage (Breakthru AZ) | 111606819 | 2-Way | 3 unmatched items that appear as suggestions |

### C. Resolving price / UOM variances
| Vendor | Invoice | Match type | What it shows |
|---|---|---|---|
| Individual Foodservice | 609077-00 | 2-Way | 3 price variances + 1 UOM variance |
| Gordon Food Service, Inc. | 9003126467 | 3-Way | 3 price variances + 1 UOM variance |
| Brady Industries | 8199790 | 2-Way | 2 price variances |
| Performance Foodservice TPC | 7087689 | 3-Way | 3 price + 1 UOM; **linked to 2 different receipts** |
| Stillman Wholesale Meat | 9559 | 3-Way | 2 price variances + 2 UOM variances |

### D. Already matched & approved (by PO bot policy)
| Vendor | Invoice | Match type |
|---|---|---|
| Brady Industries | 8232945 | 2-Way |
| Colorado Ranchers | CO0230742 | 3-Way |
| Nessi Foods | 5456 | 2-Way |

---

## Demo flow at a glance

Ordered for **primacy and recency**: the differentiating "aha" comes early (segment 2), the business outcome and next step land last.

| # | Segment | Riefstahl move | Demo invoice | Screen |
|---|---------|----------------|--------------|--------|
| 0 | Open on the promise | Lead with the payoff, not "about us" | — | — |
| 1 | Set the model (fast) | Frame, then get out of the weeds | — | Workflow diagram |
| 2 | The "aha": link → auto-match → auto-approve | **The wow moment — primacy** | McKesson 20856156 | Invoice → PO Match → matched |
| 3 | You stay in control | Tie to WIIFM (manager/controller) | (same) | — |
| 4 | Exceptions come to you (variances) | Show you surface, not hide | Gordon Inc. 9003126467 | Match Overview + Review UOM |
| 5 | The safety net (shipping & tax) | Differentiator for tax-exempt | William Murray INV4312 | PO Match (shipping) |
| 6 | Proof it's real (already matched) | Reinforce the clean end-state | Colorado Ranchers CO0230742 | Match Overview (all green) |
| 7 | Close on the outcome + next step | **Recency — the payoff, restated** | — | — |

---

## The talk track

> ⚠️ **Everything in quotes is an example, not a script to read.** The wording assumes a solution engineer presenting with Sage Intacct as the ERP — **swap in your own role, your ERP, and your own voice.** If you are an AE presenting solo, drop the "I run the technical side" framing entirely. Keep the *structure* (Tell → Show → Tell) and the *business payoff*; change the words.

### 0. Open on the promise — not the org chart *(30–45 sec)*

**Tell (the hook):** Skip the long preamble. Establish who you are in one line, then lead with the single biggest payoff.
> *(Example — replace the bracketed role with your own.)*
> "Quick on me — I'm **[your role]** at Ottimate. I help build your scope, so today interrupt me any time; the more you tell me about your process, the sharper the scope. Here's the one thing I want you to watch for: in a few minutes I'm going to take an invoice that has *no coding on it at all*, and you'll watch it find its PO, code every line by itself, and approve itself — inside the same invoice screen your team already uses. No new system to log into. That's PO Match."

*Why this works (Riefstahl): the opening states the strongest, most differentiating outcome as a headline — it earns attention before you've shown a single screen.*

### 1. Set the model — fast, then get out of the weeds

**Tell:** "Before the live piece, ten seconds on how the pieces connect — then I'll show you the real thing."

**Show:** the three-way match workflow diagram → **Screenshot 1.** Walk it left to right, once.
> "On your side in the ERP, the requisition happens, the PO is approved, and — for three-way — goods are received. Via our API we sync the **PO** and the **receipt** into Ottimate. When the invoice arrives, we link it to the PO and receipt and run the **three-way match** across all three. No receiver expected? We just link and match invoice-to-PO. After matching, the invoice runs your **normal approval workflow** and posts back to the ERP."

**Tell (so what):** "The point isn't the plumbing — it's that all of this happens where your team already works. Two-way is the same picture minus the receiver step."

> ⚠️ **Buying-zone discipline:** this is framing, not the show. Don't linger on the API or field mappings here — that's the scoping call. If someone pulls you deep, park it and move to the aha.

### 2. The "aha" — link → auto-match → auto-approve *(the primacy moment)*

This is the moment the whole demo is built around. Slow down, few clicks, let it land.

**Tell (before):** "Here's an invoice that just came in. It's fully extracted, but look — **no dimensions on any line**. No GL, no account splits. Right now this is work someone has to do by hand." Point to the red *"contains 8 unmapped line items."*

**Show:** invoice before match, empty GL/Cost Code/Department → **Screenshot 3.**

**Tell (before the click):** "I'll go to the **PO Match** tab. In the demo the PO number is intentionally off by one digit — which is also exactly what happens when a vendor drops or fat-fingers the PO number. Watch what one correction does."

**Show:** PO Match tab → **remove the last digit** so the number is correct → the system **auto-links** to the PO → **Screenshot 4.**
> **Demo tip:** removing the last digit and saving is the cleanest way to trigger the auto-behavior live. If the PO number is already correct, this happens automatically behind the scenes — say that out loud so they know it's not a party trick.

**Tell (the payoff — say this slowly):** "That one link did three things. It pulled the items and dimensions from the PO and **set every account split for me**. It ran the match and — because nothing's in red — **every line reconciled**; red is always our 'look here' color. And because the invoice hit a **fully-matched state**, your **PO approval policy auto-approved it** — nobody had to touch it. There's nothing left on this PO, so it's fully satisfied; when it's closed on the ERP side, that closure syncs back and the PO closes out here too."

**Show (the clean end-state):** fully matched invoice/PO/receipt, all green → **Screenshot 7** (Colorado Ranchers is a good finished example if you'd rather show a pristine state).

**Tell (WIIFM):** "For the person doing AP, the coding and the chasing just disappeared. For you running the function, it happened *inside your workflow* — nobody learned a new tool."

### 3. You stay in control — the auto-approve conversation

**Tell:** "Now, 'it approves itself' makes some finance leaders nervous — good. You're in control of that." Tie back to discovery answer #5.
> "Because this invoice reached a **fully-matched state**, it's your call: keep a human on it, or let your **PO approval policy auto-approve it**. If your worry is coding accuracy, validate that at **PO creation** — that's when you have the leverage to tell an end user the PO is wrong — so AP doesn't re-approve matched invoices. Or keep a final review step in Ottimate. You can also build approval policies that route to the PO's **buyer** (the buyer user on the PO) — for example, send anything with a variance to the buyer while clean matches auto-approve."

**Tell (best practice):** "The cleanest setup is when the PO and Ottimate agree — if something needs to change, change it on the PO side and Ottimate reflects it. You keep full flexibility to adjust in Ottimate when you need to."

### 4. Exceptions come to *you* — variances surfaced, not hidden

**Tell:** "That was the happy path. Here's one that isn't — and this is where the tool earns its keep. Anything with a variance gets **pulled to the top** and grouped, so exceptions come to you instead of you hunting for them."

**Show:** Match Overview with red price/UOM mismatches → **Screenshot 5.**

**Tell (before Review):** "I'll click **Review** to see only the lines that need a human."

**Show:** Review UOM Variance (2 Lb vs. 21.45 Case) → **Screenshot 6.** Walk two cases:
- **The UOM 'false alarm':** "This ribeye — invoice in **cases**, PO/receipt in **pounds**. The system did the conversion and found **no real variance** underneath. Accept it, or teach it the right pounds-to-cases conversion for that vendor and it recalculates going forward."
- **The real price variance:** "This one's a true price difference — invoiced **$51.11** against the **$46.50** we expected. **Accept** it with a note (vendor raised the price, PO was stale), or resolve it another way right here — pay at the **PO price**, or **short-pay** the difference. If it needs a credit, you settle that with the vendor outside the system. The point: we surface it and give *you* the decision — we don't quietly pay it."

**Tell (control — thresholds):** "And you decide what's even worth flagging. Set **thresholds** — a dollar amount or a percentage — so a one-cent or one-dollar difference never interrupts anyone. Expose everything, or only what falls outside your tolerance."

**Tell (WIIFM — controller):** "This is the money leak most teams can't see today — price creep, one line at a time. Here it's flagged the moment it happens."

*Other variance invoices for variety: Stillman 9559 (2 price + 2 UOM), Performance 7087689 (linked to **2 receipts**), Individual Foodservice 609077-00 (2-way), Brady 8199790 (2 price).*

### 5. The safety net — shipping, freight & tax *(a quiet differentiator)*

**Tell:** "Last capability, and it's a favorite: unmatched items. Auto-matching looks at SKU, description, and more — if something's genuinely different, it **suggests** a match for you to confirm. The most common real-world case is **shipping and tax**."

**Show:** the invoice's shipping line in the PO Match view → **Screenshot 8.**
> "Sometimes freight or tax is on the PO, sometimes it's an estimate, sometimes it's not expected at all. If it's on the PO, we match it like any other line. If it's **not** — like this shipping charge — we flag it as unmatched. You can **exclude it from the match** so it doesn't hold anything up (it stays on the invoice and expenses normally), or, for sales tax on a **tax-exempt** entity, **remove it from the invoice** entirely with the right permissions."

**Tell (WIIFM — the differentiator):** "If you're tax-exempt and tax sneaks onto an invoice, most systems just pay it. Here, the match becomes a **second safety net** — it flags the tax before it goes out the door."

*Also: Gordon 9006406564 (1 unmatched suggestion) and Alliance 111606819 (3 suggestions) show the **suggestion** flavor.*

### 6. Proof it's real — an already-matched invoice

**Tell:** "Everything I just walked through by hand — the system does on its own overnight. Here's one that came in already matched and approved by policy. This is your steady state." *(Keep this brief — it's reinforcement, not a new act.)*

**Show:** Colorado Ranchers, all-green Match Overview → **Screenshot 7.**

### 7. Close on the outcome — restate the promise, then the next step *(recency)*

**Tell (the payoff, restated — this is what they'll remember):**
> "So, back to what I promised at the start: you watched an invoice with no coding link to its PO, code every line, and approve itself — inside the AP workflow your team already uses. Clean invoices flow through on the thresholds and policies *you* set; real exceptions stop for a human, surfaced instead of hunted. No new system to roll out. That's PO Match."

**Tell (next step — make it concrete):**
> *(Example — if you are not the person who runs scoping, say who will.)*
> "If that's valuable, the next step is a **detailed scoping call**. We'll bring best practices from our product team for your structure — services, amount-based, quantity-based — we'll walk *your* scenarios end to end, and I'll put together a recommended scope tied to your goals. What's the best way to get that on the calendar?"

---

## Optional capabilities — the menu *(show only on a signal)*

These four are all **live today**, but none belong in the core flow by default. Riefstahl's **menu approach** is the discipline here: you keep them in your back pocket and pull one out *only* when discovery (or a live question) lights it up. Showing all four to a prospect who needs none of them is textbook **spray-and-pray** — it dilutes the aha and drags you into the weeds. Match each to its signal, deliver a tight **Tell–Show–Tell**, then get back to the main line.

| Menu item | Show it when… (discovery signal) | Riefstahl call — where it goes | Aim it at |
|---|---|---|---|
| **A. Vendor-level PO requirements** | "Only *some* vendors are on POs" / "it's mixed" (probe 6) | **Work into the core flow.** Resolves the "but we don't PO everything" objection before it's raised. | AP manager / controller |
| **B. PO Flip** | "Some vendors invoice with just a total, no line detail" (probe 7) | **Reactive.** Show only if poor line data is a real pain — otherwise skip entirely. | AP processor |
| **C. Workflow rules engine** | "We run informal rules by hand" / "ping us in Slack" (probe 8) | **Tease verbally, park for scoping.** Buying-zone risk — don't build a rule live unless it's a technical/ops buyer. | Ops / systems owner |
| **D. Force-match** | "The ones that won't reconcile just sit / we chase them" (probe 9) | **Reactive objection-handler.** Your "nothing stays stuck" answer — show *after* variances (segment 4), not before. | AP processor / manager |

### Demo data status — what you can actually show today

Audited 2026-09-10 against the **scenario map above**, the screenshots in `pomatch-assets/`, and the training content. The four capabilities are product features that exist; this table is about whether the **seeded demo environment has something to show them with**. Nothing below is seeded for these four — the scenario map covers the core flow only.

| Menu item | Seeded example? | What you can do today | What to request |
|---|---|---|---|
| **A. Vendor-level PO requirements** | ⚠️ **Partial** | The **Missing PO(s)** flag is visible in the Needs Attention queue (walk-through screen 2), so you can show the *consequence* of a PO-required vendor. The vendor-level setting itself is not documented in any seeded scenario. | One vendor flagged **PO-required** and one **not-required**, plus a PO-required vendor invoice arriving with no PO — so the setting and its effect can be shown side by side. |
| **B. PO Flip** | ❌ **No** | Nothing. No seeded invoice has a summary total with no line detail. Describe it verbally only. | A **summary invoice** (single total, no itemization) linked to a PO/receipt, so the flip can populate lines live. |
| **C. Workflow rules engine** | ❌ **No** | Nothing — and by design: the script says tease and park, never build a rule live in a first demo. | One **pre-built, read-only example rule** (e.g. "variance under $X on vendor list Y → auto-approve") that can be *shown* without building it. |
| **D. Force-match** | ⚠️ **Partial** | The variance invoices in the scenario map (e.g. Individual Foodservice 609077-00) are realistic candidates to force-match, but whether the permission is enabled on the demo login is unconfirmed. | Confirmation that **force-match permission is on** for the demo user, plus one invoice deliberately left un-reconcilable, and a visible **force-match audit entry**. |

> 🔎 **How this was verified — and its limits.** Confirmed from the scenario map and the screenshot library in this repo. **Not** verified against the live demo environment or the [scenarios spreadsheet](https://docs.google.com/spreadsheets/d/1YiyA2V2bUBGR-1A0ZCoNIg8cDCPRiHm8D9RLldGTyhk/edit) — both need access. If any of these have since been seeded, update this table and the scenario map.

**Until these are seeded:** apply Tell–Show–Tell only to A and D (where there is something on screen). For B and C, use **Tell → park**: name the capability, tie it to the payoff, and capture it for the scoping call. Do not mime a capability you cannot show — that is the "spray-and-pray" failure the Guardrails section warns about.

### A. Vendor-level PO requirements — "you decide which vendors need a PO"

> ⚠️ **Demo data: partial.** You can show the *consequence* — the **Missing PO(s)** flag in the Needs Attention queue — but the vendor-level setting itself is not seeded. **Describe the setting, show the flag.** Do not go hunting for a vendor config screen mid-demo.

**Signal:** they don't PO every vendor. Very common — most shops have a mix.

**Tell:** "You mentioned not everything runs through a PO — that's the norm, and you control it per vendor."

**Show / Tell:** "You flag each vendor as **PO-required**, **not required**, or **mixed**. A not-required vendor flows straight through your normal AP process — matching never gets in the way. A **required** vendor that shows up *without* a PO gets flagged **Missing PO** so it can't slip through un-matched. So matching applies exactly where you want it and stays out of the way everywhere else."

**Tell (WIIFM — manager/controller):** "You get the control of PO matching on the spend that needs it, without forcing it on the spend that doesn't."

### B. PO Flip — "build the invoice from the PO when the vendor gives you nothing"

> ⚠️ **Demo data: none.** No seeded invoice has a summary total with no line detail, so there is nothing to flip on screen. **Tell it and park it** — name the capability, tie it to the payoff, capture it for scoping. Do not open screens looking for it.

**Signal:** vendors who send summary invoices — a total, no itemization — where the PO or receipt is really your source of truth.

**Tell:** "For the vendors who invoice with no line detail, you don't want AP re-keying lines by hand."

**Show / Tell:** "When the invoice is linked to a receipt, **PO Flip** copies the line detail from the PO/receipt onto the invoice for you — so you get fully coded lines even when the vendor's invoice was just a total. (It flips automatically when there's a single receipt; multi-receipt cases you resolve deliberately.)"

**Tell (WIIFM — processor):** "The line detail you'd otherwise type by hand just… appears, from the document you already trust."

### C. Workflow rules engine — "the rules you run in your head, automated"

> ⚠️ **Demo data: none — and that is the intended play.**
>
> 🚫 **Do not promise Slack.** There is **no native Slack action** today — the executable actions are change match state, flag, call a webhook, and approve. (A webhook can reach Slack via the customer's own tooling; that is a scoping conversation, not a feature claim.) There is no seeded example rule, and the guidance is to tease verbally and park for scoping regardless. **Never build a rule live in a first demo.**

**Signal:** they describe informal, repeatable judgment calls, or want a system pinged when something happens. *This is the one to be most disciplined about — it's powerful and technical, and easy to drown in.*

**Tell (tease — usually no live build):** "You just described a rule you run by hand every time. We have a rules engine that can run those for you."

**Show *only* if it's a technical/ops buyer who'll value it:** "On a PO-match event, a rule checks conditions you define — a vendor list, a variance under a threshold — and takes an action: **change the match state, flag the invoice, call a webhook, or approve it**. So 'if it's Sysco and the variance is under $15, approve it and move on' becomes a rule, not a person's memory."

**Tell + park:** "Exactly how we'd wire your rules is a scoping conversation — I'll capture the ones you just described." *(Don't build a live rule in a first demo unless they push for it.)*

### D. Force-match — "nothing stays stuck, and it's all on the record"

> ⚠️ **Demo data: partial / unverified.** The variance invoices are realistic candidates, but whether **force-match permission is enabled on the demo login is unconfirmed**. Check it in your own dry run *before* you promise to show it live — if it is not enabled, describe it instead.

**Signal:** invoices that are legitimately fine but won't reconcile automatically sit in limbo or get chased. Best shown as a follow-on to the variances segment.

**Tell:** "You asked what happens to the ones that are fine but just won't line up. They don't get stuck."

**Show / Tell:** "With the right permission, you can **force-match** — you're telling the system 'I've reviewed this, it's good, push it through.' It moves to matched and runs your approval policy like any clean match. And it's **logged as a force-match with who did it**, so you keep a clean audit trail — it's a deliberate, accountable override, not a way to hide a problem."

**Tell (WIIFM — manager):** "Your team is never blocked by an edge case, and you can always see exactly what was overridden and by whom."

---

## Guardrails — harmful habits & words to avoid

Straight from *Demonstrating to Win!* — the fastest way to lose a room is self-inflicted.

**Harmful habits:**
- **Spray-and-pray.** Don't show every seeded invoice because you can. One invoice per concept.
- **Apologizing / narrating trouble.** No "normally this is faster," "let me try that again," "sorry, it's loading." Silence beats a nervous apology.
- **Talking to the screen.** Say what you're about to do, then click while looking at *them*, not the monitor.
- **Falling into the weeds.** API details, field mappings, edge-case config → parking lot for scoping.
- **Falling in love with a feature.** If it doesn't map to their pain, cut it, even if it's cool.
- **Driving too fast.** The aha and the close are the two moments to *slow down*.

**Harmful words (they leak uncertainty):**
- "Basically…", "Actually…", "Just / simply…", "Kind of / sort of…"
- "As you can see…" (if they could see it, you wouldn't need to say it)
- "I *think* / I *believe* it does…" — if you're unsure, say "let me confirm that in scoping."
- "Obviously…" (nothing is obvious to a first-time viewer)

---

## Objection & Q&A handling

- **"Does AP still have to review coding?"** — Their choice. Validate at PO creation (best practice — "that's when you have the leverage to tell end users the PO is wrong"), or keep a review step in Ottimate. Auto-approve is optional, per policy.
- **"Will it remember the UOM conversion for every product from that vendor?"** — It's stored per **catalog item** (a specific vendor's item), and the system flags mismatches on its own. Conversions can also come straight from your ERP — and those take priority over ones taught in Ottimate. Best practice is to align the PO/receipt UOM to how the vendor invoices so it's consistent rather than item-by-item.
- **"We chase credits manually today — it's ugly."** — Today: surface the variance, accept/reject with a note, and handle the credit with the vendor outside the system. Set thresholds so tiny discrepancies (a dollar) don't create work. *(If they push on in-system credit automation, park it: "Let me capture that for our product team and confirm what's on the roadmap in scoping.")*
- **"We're tax-exempt but tax sometimes shows up."** — PO Match becomes a second safety net: it flags unexpected tax so you can exclude it from the match or remove it from the invoice (with the right permissions).
- **"How long does this take to stand up?"** — Park it for scoping, but reassure on the differentiator: "Because it lives inside the AP workflow your team already uses, there's no separate system for users to learn — the change is mostly configuration, which is exactly what the scoping call defines."

---

## Demo walk-through (screenshots)

*Captured from the live demo environment.*

### 1 — Three-way match workflow
The mental model: the ERP creates/approves the PO and posts the receiver → Ottimate imports PO + receipt via API → invoice is linked and three-way matched → normal approval → posts back to the ERP → Vendor Pay. *Use to frame, then move on.*

![Three-way match workflow diagram](po-demo-screenshots/01-workflow-diagram.png)

### 2 — The Needs Attention queue
Invoices flagged **Missing PO(s)** and **Unmapped Dimensions**. This is the "before" the demo resolves.

![Needs Attention queue](po-demo-screenshots/L01-needs-attention-queue.jpg)

### 3 — Invoice before matching
Extracted invoice with the red *"8 unmapped line items"* banner — no GL, Cost Code, or Department yet. This is the state you make disappear in the aha.

![Invoice before match with no dimensions](po-demo-screenshots/L02-invoice-before-match.jpg)

### 4 — The PO Match tab (link the PO)
The invoice's PO Match tab with **Link/Unlink PO**. Remove the last digit of the PO number to auto-link (or it links automatically when the number is already correct).

![PO Match tab before linking](po-demo-screenshots/L03-po-match-tab-unlinked.jpg)

### 5 — Variances flagged
The three-way Match Overview — Purchase Order / Receipt(s) / Invoice(s) side by side — with price mismatches in red (e.g., $46.50 vs. $51.11) and a **Lb vs. Case** UOM mismatch.

![Variances flagged in the match overview](po-demo-screenshots/L06-variance-match-overview.jpg)

### 6 — Review the UOM variance
The pounds↔cases conversion up close: Receipt **2 Lb** vs. Invoice **21.45 Case**, unit price $274.67 vs. $25.61 — accept the suggestion, or teach the correct conversion.

![Review UOM variance](po-demo-screenshots/L07-review-uom-variance.jpg)

### 7 — Fully matched
A clean three-way match: green check on Match Overview, "3-Way / Matched" badge, every line reconciled across PO, Receipt, and Invoice. Nothing in red. Use for the aha payoff and the segment-6 reinforcement.

![Fully matched three-way](po-demo-screenshots/L04-fully-matched.jpg)

### 8 — Unmatched items: shipping & tax
The invoice carries a **shipping** charge that isn't on the PO. Matched lines reconcile; the shipping line is flagged as unmatched to **exclude from the match** (stays on the invoice) or remove entirely for tax-exempt scenarios.

![Unmatched shipping and tax handling](po-demo-screenshots/L08-unmatched-shipping-tax.jpg)

### Reference — Purchase Orders tab (variance bucket)
Where PO and receipt data lives, bucketed by Unlinked POs, Missing Receipts, Unmatched Items, Variances, Matched, and Closed. Useful for showing visibility without changing the customer's invoice process.

![Purchase Orders tab variances bucket](po-demo-screenshots/L05-purchase-orders-variances-bucket.png)

---

*Delivery method adapted from Robert Riefstahl,* Demonstrating to Win! *Scenario data and screenshots from the PO Match demo environment ([demo-2026-api.plateiq.com/demoapp](https://demo-2026-api.plateiq.com/demoapp/)) and the [PO Match demo scenarios spreadsheet](https://docs.google.com/spreadsheets/d/1YiyA2V2bUBGR-1A0ZCoNIg8cDCPRiHm8D9RLldGTyhk/edit).*
