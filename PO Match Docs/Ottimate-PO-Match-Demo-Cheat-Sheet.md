# PO Match — Live-Demo Cheat Sheet

**Demo environment:** [demo-2026-api.plateiq.com/demoapp](https://demo-2026-api.plateiq.com/demoapp/) — no access? Contact your manager or Ottimate rep.

*One-page glance sheet for the [full script](Ottimate-PO-Match-Demo-Script.md). Ask discovery first — the answers tell you what to show. Lead with the aha, close on the outcome, show only what a signal lights up.*

---

## Discovery → what it unlocks

**Core five (always ask):**

| # | Ask | Their answer drives… |
|---|-----|----------------------|
| 1 | Doing POs today, or brand new? | **Framing.** New = *Vision Generation* (go slow, sell the concept). Existing = *Vision Re-engineering* (lead with what's broken today). |
| 2 | Two-way or three-way (do you receive)? | **Segment 1 + invoice picks.** 3-way → show the receiver + McKesson/Gordon. 2-way → drop the receiver step. |
| 3 | Items vs. services? Qty vs. amount? | **Scenario selection.** Probe fixed vs. burn-down services → capture for scoping. |
| 4 | Which ERP? | **Segment 1 wording** — name *their* ERP in the workflow. |
| 5 | Who validates coding, and where? | **Segment 3** — the auto-approve conversation (validate at PO creation vs. review in Ottimate). |

**Conditional probes (ask only on a signal — each unlocks one menu item):**

| # | Ask | Signal → unlocks | When to show |
|---|-----|------------------|--------------|
| 6 | All vendors on POs, or only some? | "mixed" → **Menu A: Vendor-level PO requirements** | Work into core flow |
| 7 | Any vendors who invoice with just a total? | "yes" → **Menu B: PO Flip** | Reactive — only if real pain |
| 8 | Informal rules you run by hand? Slack pings? | "yes" → **Menu C: Workflow rules engine** | Tease + park for scoping |
| 9 | What happens to invoices that won't reconcile? | "they sit / we chase" → **Menu D: Force-match** | Reactive, *after* variances |

---

## Core flow (the spine — always run this)

| # | Segment | Riefstahl move |
|---|---------|----------------|
| 0 | **Open on the promise** — "watch an invoice with no coding code + approve itself, inside your AP workflow" | Lead with the payoff (primacy) |
| 1 | Set the model — workflow diagram, *fast*, then out of the weeds | Frame, don't dwell |
| 2 | **The aha** — remove a digit → auto-link → auto-code → auto-approve | The wow moment |
| 3 | You stay in control — thresholds, auto-approve policy, buyer routing | Tie to WIIFM |
| 4 | Exceptions come to you — variances surfaced + resolve (price / UOM) | Show you surface, not hide |
| 5 | Safety net — shipping/tax exclude vs. remove | Quiet differentiator |
| 6 | Proof it's real — an already-matched invoice | Reinforce end-state |
| 7 | **Close on the outcome + next step** — restate the promise, book scoping | Recency |

---

## The menu (pull out only on the signal)

- **A. Vendor-level PO requirements** ⚠️ *partial demo data — show the Missing PO flag, describe the setting* — flag each vendor PO-required / not-required / mixed. Required vendor with no PO → flagged **Missing PO**. *"Matching applies where you want it, stays out of the way everywhere else."*
- **B. PO Flip** ⚠️ *no demo data — tell & park* — copies PO/receipt line detail onto a no-detail invoice. *"The lines you'd re-key by hand just appear."* (Auto only when single receipt.)
- **C. Workflow rules engine** ⚠️ *no demo data — tease & park* — on a match event, check conditions → **change state / flag / call a webhook / approve** (no native Slack). *"The rule you run in your head, automated."* Tease; build live only for a technical buyer.
- **D. Force-match** ⚠️ *permission on the demo login unverified — check before promising* — reviewed-and-good override → matched + runs approval; **logged with who did it**. *"Nothing stays stuck, and it's all on the record."*

> ⚠️ **None of these four are seeded in the demo environment.** Show what is on screen; describe and park the rest. Full status + what to request: see the **Optional Capabilities** tab of the full script.

---

## Guardrails (say / don't say)

**Slow down** at the aha (segment 2) and the close (segment 7). **One invoice per concept** — no spray-and-pray. **Park** deep config: *"Great — that's a scoping conversation, let me note it."*

**Kill these words:** "basically," "actually," "just / simply," "as you can see," "obviously," "I *think* it does…" (→ "let me confirm that in scoping"). Never apologize for the software.
