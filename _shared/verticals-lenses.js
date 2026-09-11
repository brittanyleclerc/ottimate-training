/* verticals-lenses.js — per-dashboard "lens" call-outs shown under each vertical profile in the
   shared Industry Verticals tab: how THIS dashboard's product/demo lands for that vertical.
   Keyed by dashboard filename → vertical key → { draft?, points: [ [title, text], ... ] }.
   Fundamentals is the general profile, so it has no lens.
   `draft: true` shows a "Draft — pending Enablement review" chip; flip to false once reviewed.
   PO Match lenses were expanded from the dashboard's existing VERTICAL_LENS one-liners + the demo script.
   Demo 101 / Demo 102 lenses were DRAFTED (2026-09-10) from those dashboards' own module content — review before removing the draft flag. */
const VERTICAL_LENSES = {
  'demo-training': {
    _title: 'Core AP + Statements lens',
    restaurants: { draft: true, points: [
      ['Lead with capture', 'Show mobile/photo capture on a handwritten DSD receipt and an emailed PDF — the "every format" pain is the hook.'],
      ['Code to the P&L they run', 'Line-item GL coding to food, beverage, and supplies by location; call out how coding rules learn the chef’s vendors.'],
      ['Approvals by GM / location', 'Route by location and amount; show stand-in approvers for the GM who is on the floor, not at a desk (fallback approvers are the separate time-based escalation).'],
      ['Statements = the closer', 'Reconcile a broadline distributor statement to catch missing invoices and unapplied credits — the food-cost payoff.']
    ]},
    hospitality: { draft: true, points: [
      ['Multi-department coding', 'F&B, rooms, engineering, spa — show one invoice split across departments and properties.'],
      ['Department-level approvals', 'Route by department head and property controller; emphasize the audit trail for ownership groups.'],
      ['Volume across outlets', 'Batch capture for many outlets feeding one AP team; email routing rules per property.'],
      ['Statements for service vendors', 'Reconcile large service and utility vendors at month-end to close faster across properties.']
    ]},
    retail: { draft: true, points: [
      ['Price protection is the story', 'Line-level checks against contracted pricing surface overcharges before approval — quantify it.'],
      ['Multi-location coding', 'Store-level GL and department coding, with approval thresholds by store manager vs. HQ.'],
      ['High-volume suppliers', 'Show capture + auto-coding on a long line-item invoice; that is where the hours go.'],
      ['Statements for top suppliers', 'Reconcile the largest suppliers’ statements to surface missing invoices, credit memos, and total discrepancies on thin margins.']
    ]},
    grocery: { draft: true, points: [
      ['DSD receiving at the back door', 'Receiver scans the DSD receipt; capture + price-catalog validation happen instantly.'],
      ['Thousands of SKUs, no keying', 'Batch upload hundreds of invoices; auto-code by department (produce, meat, dairy, grocery).'],
      ['Department approvals', 'Department managers approve their own spend; store director sees exceptions only.'],
      ['Statements for DSD vendors', 'Weekly statement reconciliation to surface missing invoices and credit memos across many small DSD vendors.']
    ]},
    seniorliving: { draft: true, points: [
      ['Community-level coding', 'Dietary, housekeeping, maintenance, medical supplies — coded per community from one AP team.'],
      ['Centralized AP, local approvers', 'Executive directors approve on mobile; corporate AP keeps control and the audit trail.'],
      ['Compliance-ready trail', 'Every capture, code, and approval is timestamped — show it once, it answers the auditor question.'],
      ['Statements for pharmacy & med suppliers', 'Reconcile recurring supplier statements to surface missing invoices and credit memos before close (statement rec does not check payment status).']
    ]},
    healthcare: { draft: true, points: [
      ['GL + cost-center coding', 'Department and cost-center coding per line; show a supply invoice split across clinics.'],
      ['Approval policy & audit', 'Policy-based routing with stand-in approvers for clinical staff who are with patients; the audit trail is the compliance answer.'],
      ['Supply-vendor volume', 'Capture and auto-code long medical-supply invoices — the manual-keying pain is real here.'],
      ['Statements for key suppliers', 'Reconcile major supply and pharmacy vendors monthly; surface missing invoices before close.']
    ]}
  },
  'demo102': {
    _title: 'Vendor Pay & Reporting lens',
    restaurants: { draft: true, points: [
      ['Payment mix', 'Many small local vendors on check/ACH; broadline distributors are the vCard rebate opportunity.'],
      ['Turn AP into revenue', 'Size the vCard rebate on distributor spend — Demo 102 frames this as tens of thousands per year for large AP operations. Quote their numbers, not a payback promise.'],
      ['Reporting that lands', 'Spend Analysis by location and category; Hot List to time payments against cash flow.'],
      ['Reconciliation', 'One-to-one payment-to-invoice reconciliation removes the month-end scramble across locations.']
    ]},
    hospitality: { draft: true, points: [
      ['Property-level payments', 'Centralized Vendor Pay across properties with per-property visibility and controls.'],
      ['vCard on services & contracts', 'Service vendors and recurring contracts are strong vCard acceptance candidates.'],
      ['Calendar View', 'Show payment timing across properties; controllers care about the cash calendar.'],
      ['Dashboards per property', 'Spend dashboards by property and department for ownership reporting.']
    ]},
    retail: { draft: true, points: [
      ['Supplier payment hierarchy', 'ACH for high-volume suppliers, vCard where accepted, check as the fallback — show the hierarchy.'],
      ['Price-variance reporting', 'Standard reports that surface overcharges by supplier — pairs with the AP demo story.'],
      ['Disbursement workflow', 'If the ERP cannot import third-party payments, walk the disbursement-file workflow (Module 4).'],
      ['Store-level spend', 'Spend Analysis by store and category for margin management.']
    ]},
    grocery: { draft: true, points: [
      ['DSD payment cadence', 'Weekly DSD vendor payments on ACH; keep the cadence but remove the manual runs.'],
      ['⚠️ No vCard rebates for grocery', 'vCard rebates are NOT available for grocery clients — do not pitch the rebate story here. Lead with one-to-one reconciliation and payment efficiency instead.'],
      ['Department spend analysis', 'Spend Analysis by department (produce, meat, dairy) is what the store director asks for.'],
      ['Reconciliation', 'One-to-one reconciliation of payments to invoices — critical with high invoice counts.']
    ]},
    seniorliving: { draft: true, points: [
      ['Centralized payments, community view', 'Corporate AP pays; each community sees its own payments and reports.'],
      ['Controls on disbursement', 'Approval controls on the payment run satisfy board and ownership oversight.'],
      ['Disbursement workflow', 'Fund/legacy ERPs often cannot apply third-party payments — the disbursement file is common here.'],
      ['Reporting per community', 'Standard reports by community for budget-vs-actual conversations.']
    ]},
    healthcare: { draft: true, points: [
      ['Compliance on payments', 'Approval controls and a full payment audit trail — lead with control, not convenience.'],
      ['ACH to supply vendors', 'Major supply vendors on ACH; vCard for services and smaller suppliers.'],
      ['Cost-center reporting', 'Standard reports by cost center and department for finance leadership.'],
      ['Disbursement workflow', 'Healthcare ERPs frequently need the disbursement-file path — be ready to show Module 4.']
    ]}
  },
  'pomatch': {
    _title: 'PO Match lens',
    restaurants: { points: [
      ['Quantity-based, high volume', 'Food and produce POs are mostly quantity-driven; lead with the auto-link → auto-match → auto-approve aha.'],
      ['Catch-weight & UOM variances', 'Show the UOM conversion + confirm on a variance — this is the daily reality for proteins and produce.'],
      ['Price-catalog variances', 'Contracted-price variances are surfaced for review, not hidden — and freight/tax lines that are not on the PO can be excluded from the match while staying on the invoice.']
    ]},
    hospitality: { points: [
      ['Mixed goods + services', 'Pair amount-based matching (service contracts, burn-down) with quantity-based F&B on the same demo.'],
      ['Vendor-level PO requirements', 'Menu A: decide which vendors must have a PO — properties rarely put everything on a PO.'],
      ['Approval policy', 'Auto-approve on a clean match, but show the controller stays in control of the policy.']
    ]},
    retail: { points: [
      ['DSD receiver matches', 'Two-way DSD Receiver Match with no PO is common — demo the receiver-based flow.'],
      ['Force-match on the record', 'Menu D: nothing stays stuck, and every override is logged.'],
      ['Three-way where they receive', 'Confirm whether they receive in the ERP; if yes, show the receipt in the match.']
    ]},
    grocery: { points: [
      ['DSD-heavy', 'Two-way receiver matches at the back door; the receiver is the source of truth.'],
      ['Catch-weight UOM conversions', 'Show the Review UOM variance flow — grocery lives on it.'],
      ['Tax & freight exclusions', 'Exclude shipping/tax lines and keep them on the invoice — the quiet differentiator.']
    ]},
    seniorliving: { points: [
      ['Multi-location, services-heavy', 'Amount-based matching for service contracts; per-community vendor PO requirements.'],
      ['Missing-PO flags', 'PO-required vendors invoicing without a PO get flagged, not paid.'],
      ['Workflow rules', 'Menu C: the rules communities run by hand today, automated.']
    ]},
    healthcare: { points: [
      ['Compliance-driven', 'PO-required vendors and approval-policy gating are the story; auto-approve only on a clean match.'],
      ['Missing PO & force-match logging', 'Show that exceptions are surfaced and every override is on the record.'],
      ['ERP closes the PO', 'Ottimate links the bill to the PO; the ERP closes it out — say it before they ask.']
    ]}
  }
};
module.exports = { VERTICAL_LENSES };
