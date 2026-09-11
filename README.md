# Ottimate Sales Training & Certification Portal

Live site: **https://brittanyleclerc.github.io/ottimate-training/portal.html**
(The former address, `/Demo-101/`, forwards here automatically.)

Self-contained single-file training dashboards for the Ottimate sales team, deployed with GitHub Pages:

| Level | Dashboard | File |
|---|---|---|
| 1 | Fundamentals | `fundamentals-training.html` |
| 1 | Demo 101 — Core AP & Statements | `demo-training.html` |
| 1 | Demo 102 — Vendor Pay & Basic Reports | `demo102.html` |
| 2 | Demo 201 — PO Match | `pomatch.html` |

`portal.html` is the hub. Progress and certifications live in each rep's browser (localStorage) and are never
affected by a deploy. `_shared/` holds the single-source modules and injectors that keep every dashboard
consistent — start with `_shared/CONSISTENCY-GUIDE.md` before editing anything. `PO Match Docs/` holds the
Demo 201 script and cheat sheet (`.md` sources → generated `.html`).
