# Bypass Verification — Make.com + Google Sheet setup

Companion to `CONSISTENCY-GUIDE.md` §10. Estimated setup time: ~45 minutes (one Google Sheet, two Make scenarios). The client side (`bypass-verify-module.js`, injected into the portal and all four dashboards) is built and tested; this document is the **one-time setup on the Make.com / Google side**, plus the two constants to fill in afterwards.

## How it fits together

```
rep confirms a bypass ──► dashboard sends the bypass EVENT (GET to Make webhook #1)
                              id · name · email · role · dashboard · prereqs · time · site
                                     │
                                     ▼
                       Make scenario 1: log row in Sheet + email Enablement
                       (email has  [Approve]  [Reject]  links = Make webhook #2 with ?id=…&action=…)
                                     │
                       you click ────┘
                                     ▼
                       Make scenario 2: update the row's status + email the rep (approved / rejected)
                                     │
                                     ▼
                       Sheet tab "feed" (id,status only) is PUBLISHED as CSV
                                     │
                                     ▼
       every portal/dashboard load: fetch the feed, look up this browser's own ids, apply
          approved → "✓ Admin verified"        rejected → bypass withdrawn, gate returns
```

Nothing about a rep is stored anywhere but the Sheet (which only Enablement can open) and their own browser. The published feed contains **ids and statuses only**.

---

## 1. Google Sheet

Create a sheet **"Ottimate Training — Bypass Log"** with two tabs.

**Tab `log`** (columns, row 1 = headers):

| A `id` | B `status` | C `decided_at` | D `name` | E `email` | F `role` | G `dashboard` | H `prereqs` | I `requested_at` | J `site` | K `note` |
|---|---|---|---|---|---|---|---|---|---|---|

- `status` values the client understands: `approved`, `rejected` (also accepts approve/verified/yes and reject/denied/no). Blank = pending.
- Everything except `status`/`decided_at`/`note` is written by scenario 1 from the webhook payload.

**Tab `feed`** — the only thing that gets published. A1: `id`, B1: `status`, then in A2:

```
=QUERY(log!A2:B, "select A, B where A is not null", 0)
```

**Publish the feed tab only:** File → Share → Publish to web → *Link* → choose the **`feed`** sheet, format **Comma-separated values (.csv)**, tick *Automatically republish when changes are made* → Publish → copy the URL (it looks like `https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=…&single=true&output=csv`). That URL is `OTT_BYPASS_FEED_URL`.

> Published CSV updates take up to ~5 minutes to refresh on Google's side. That's fine — the client applies the decision on the rep's next page load after that.

---

## 2. Make.com — Scenario 2 first: "Training bypass — decision"

Build the *decision* scenario first, because scenario 1's email needs its webhook URL.

1. In Make: **Create a new scenario**. Name it `Training bypass — decision`.
2. Click the **+** → search **Webhooks** → choose **Custom webhook** → **Add** → name `training-bypass-decision` → **Save**. Copy the URL shown (looks like `https://hook.us2.make.com/xxxxxxxx`). Keep it — call it **DECISION_URL**.
   - Click **Redetermine data structure**, then in a browser tab open `DECISION_URL?id=test123&action=approve` once so Make learns the two fields (`id`, `action`). Back in Make it should say *Successfully determined*.
3. Add the next module: **Google Sheets → Search Rows**.
   - Connection: your Google account (authorise if asked).
   - Spreadsheet: *Ottimate Training — Bypass Log*; Sheet: `log`; *Table contains headers*: Yes.
   - Filter: `id (A)` **Equal to** → map the webhook's `id`.
   - Limit: 1.
4. Add **Google Sheets → Update a Row**.
   - Same spreadsheet/sheet. **Row number**: map `Row number` from the Search Rows module.
   - `status` (B): paste this formula in the field: `{{if(1.action = "approve"; "approved"; "rejected")}}` (where `1` is the webhook module's number — Make inserts it when you click the `action` item; then wrap it as shown).
   - `decided_at` (C): `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`.
   - Leave every other column empty (empty = unchanged).
5. Add a **Router** (Flow control → Router). Two branches:
   - Branch **Approved** — click the wrench on the branch → *Set up a filter*: label `approved`, condition: webhook `action` **Equal to** `approve`.
   - Branch **Rejected** — filter: `action` **Equal to** `reject`.
6. On each branch add **Email → Send an email** (Google/Microsoft connection — the account you send Enablement mail from).
   - **To**: map `email` (column E) from the *Search Rows* module.
   - **Content type**: HTML. Map `name`, `dashboard`, `prereqs`, `site` from Search Rows.

   **Approved branch**
   - Subject: `Your {{dashboard}} bypass was verified`
   - Body:
     ```html
     <p>Hi {{name}},</p>
     <p>Sales Enablement has verified that you completed <strong>{{prereqs}}</strong>. The next time you open the training portal you'll see it marked <strong>✓ Admin verified</strong>, and everything that unlocks with that certification is available to you.</p>
     <p><a href="{{site}}portal.html" style="background:#0A2E4A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;">Open the Training Portal</a></p>
     <p style="color:#6C757D;font-size:13px;">Open it in the same browser you used before — your progress is saved there.</p>
     ```

   **Rejected branch**
   - Subject: `Action needed: your {{dashboard}} bypass could not be verified`
   - Body:
     ```html
     <p>Hi {{name}},</p>
     <p>We weren't able to verify that <strong>{{prereqs}}</strong> was completed, so <strong>{{dashboard}}</strong> has been locked again until it is. Any work you already did in {{dashboard}} is saved and will be waiting for you.</p>
     <p>Please log back in to the training portal and complete {{prereqs}} first:</p>
     <p><a href="{{site}}portal.html" style="background:#0A2E4A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;">Open the Training Portal</a></p>
     <p style="color:#6C757D;font-size:13px;">Questions? Just reply to this email.</p>
     ```
7. After the router (or at the end of each branch) add **Webhooks → Webhook response**: Status `200`, Body:
   `<html><body style="font-family:sans-serif;padding:2rem"><h2>Done</h2><p>Bypass <code>{{1.id}}</code> marked <strong>{{if(1.action = "approve"; "approved"; "rejected")}}</strong>. You can close this tab.</p></body></html>`
   and add a header `Content-Type: text/html`. (This is the page you see after clicking Approve/Reject in your email.)
   - Optional guard: if Search Rows found nothing, respond `Unknown bypass id` instead — add a filter *"Total number of bundles = 0"* on a third router branch.
8. **Save**, then turn the scenario **ON** (toggle bottom-left). Scheduling: *Immediately as data arrives* (default for webhooks).

## 3. Make.com — Scenario 1: "Training bypass — log + notify"

1. **Create a new scenario** → name `Training bypass — log + notify`.
2. **Webhooks → Custom webhook** → name `training-bypass-event` → Save. Copy its URL — this is **`OTT_BYPASS_WEBHOOK_URL`** for the site.
   - Click **Redetermine data structure**, then open in a browser tab (one line):
     `EVENT_URL?event=bypass&id=test123&name=Test%20User&email=you@ottimate.com&role=Sales%20Engineer%20(SE)&dashboard=Demo%20102&prereqs=Demo%20101&time=2026-09-11T20:00:00Z&time_label=Friday%2C%20September%2011%2C%202026&site=https://example.com/training/&legacy=0&since=`
     so Make learns all the fields. (`legacy` is `1` for a bypass that was taken before verification existed — those are registered once, automatically, when this URL goes live — and `since` is its best-known date. Tip: add `{{if(legacy = "1"; " — earlier bypass, " + since; "")}}` to the email subject so they stand out; expect a small batch in the days after you turn this on.)
3. **Google Sheets → Add a Row** → spreadsheet *Ottimate Training — Bypass Log*, sheet `log`, *Table contains headers* Yes. Map: `id`→id, `name`→name, `email`→email, `role`→role, `dashboard`→dashboard, `prereqs`→prereqs, `requested_at`→time_label, `site`→site. Leave `status`, `decided_at`, `note` empty.
4. **Email → Send an email** → **To**: your address. Content type HTML.
   - Subject: `Bypass request: {{name}} — {{dashboard}} (prereqs: {{prereqs}})`
   - Body (replace `DECISION_URL` with the URL from scenario 2, step 2):
     ```html
     <p><strong>{{name}}</strong> ({{email}}, {{role}}) opened <strong>{{dashboard}}</strong> on {{time_label}} and confirmed that <strong>{{prereqs}}</strong> was completed on another device.</p>
     <p>
       <a href="DECISION_URL?id={{id}}&action=approve" style="background:#27AE60;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;">✓ Approve</a>
       &nbsp;&nbsp;
       <a href="DECISION_URL?id={{id}}&action=reject" style="background:#E74C3C;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;">✕ Reject</a>
     </p>
     <p style="color:#6C757D;font-size:13px;">No action needed if you want to leave it as self-attested. Bypass id: {{id}}</p>
     ```
5. **Webhooks → Webhook response**: Status `200`, Body `ok`.
6. **Save** and turn the scenario **ON**.
7. Test it: open the test URL from step 2 again in a browser → within a few seconds you should have a row in `log` and the email in your inbox. Click **Approve** in that email → the confirmation page appears and the row's `status` becomes `approved`. Delete the test row afterwards (or leave it — `test123` will never match a real browser).

**Optional — evidence updates (`event=bypass_details`).** The same webhook also receives a follow-up when a rep adds evidence on the portal's "Completed Elsewhere" card: `event=bypass_details`, `id` (the same bypass id), `prereq` (which prerequisite), and either `cert_id` + `cert_date` + `cert_verticals` (a validated Certificate ID from a certificate this platform issued) or `has_attachment=1` + `attachment_name` (they uploaded their certificate — the file stays in their browser; it is not sent). To use it: add a **Router** after the webhook — branch `event = bypass` → the Add-a-Row + email steps above; branch `event = bypass_details` → **Google Sheets → Search Rows** (id) → **Update a Row** writing `cert_id` / `cert_date` / `cert_verticals` / `has_attachment` into extra columns (add them to `log` after column K), optionally a short FYI email. Or ignore the branch entirely — nothing breaks.

> Once `OTT_BYPASS_WEBHOOK_URL` is set on the site, the dashboards stop sending the old EmailJS bypass email (it remains the fallback only while the URL is blank), so you get exactly one email per bypass.

## 4. Turn it on in the site

In `_shared/bypass-verify-module.js`, fill in the two constants at the top:

```js
var OTT_BYPASS_WEBHOOK_URL = 'https://hook.us2.make.com/…';   // scenario 1 webhook
var OTT_BYPASS_FEED_URL    = 'https://docs.google.com/spreadsheets/d/e/…/pub?gid=…&single=true&output=csv';
```

then roll it out and check drift:

```
node _shared/inject-bypassverify.js portal.html
node _shared/inject-bypassverify.js fundamentals-training.html
node _shared/inject-bypassverify.js demo-training.html
node _shared/inject-bypassverify.js demo102.html
node _shared/inject-bypassverify.js pomatch.html
node _shared/check-consistency.js
```

and publish. Both URLs blank = today's behaviour (EmailJS email, everything stays self-attested).

**Without Make** (manual fallback): leave `OTT_BYPASS_FEED_URL` blank and put decisions in `_shared/bypass-verifications.json` (`{"rows":[{"id":"bp_…","status":"approved"}]}`), then publish the site. The id is in the EmailJS bypass email (`bypass_id`) — add `{{bypass_id}}` and `{{user_email}}` to the EmailJS template `template_aizkufe` so they show up.

---

## 5. What the rep sees

| Decision | Portal | Dashboard |
|---|---|---|
| none (default) | prerequisite card: **☑ Self-attested** (hover explains); bypassed dashboard card: *"☑ Opened via bypass on <date>"* | Learning Path: *"Completed elsewhere (self-attested · via Demo 102 bypass, <date>)"*, playbook unlocked |
| approved | **✓ Admin verified** (green), note gains *"(verified by Sales Enablement)"* | toast *"✓ Sales Enablement verified your Demo 102 bypass"*; Learning Path *"✅ Completed elsewhere — verified by Sales Enablement"* |
| rejected | amber banner *"Sales Enablement could not verify your Demo 102 bypass… complete Demo 101 here first — your progress in Demo 102 is kept"* (dismissible); prerequisite back to Not Started; bypassed dashboard locked | if open at the time: same notice with a *Back to Portal* button (session not interrupted); on next load the gate returns with the notice and **no bypass link** |

A rejected bypass can still be approved later (the same row, status changed to `approved`) — the client restores it. "Not you? / Reset" clears everything, including the ids, so a new person on the same browser starts clean.

## 6. Testing without Make

`scratchpad/verify-test.js` (session tooling) drives the whole flow headlessly with a mocked feed and webhook. To test by hand on the published site: bypass once, read the id from the email, add a row to the Sheet (or the JSON fallback) with `approved`/`rejected`, wait for the feed to republish, reload the portal.
