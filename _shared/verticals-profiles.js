/* verticals-profiles.js — CANONICAL industry vertical profiles (single source).
   Used by _shared/inject-verticals.js to build the shared Industry Verticals reference tab in every
   dashboard AND to regenerate VERTICAL_DATA (Module 3 content) in fundamentals-training.html / demo-training.html.
   Edit here, then re-run the injector on every dashboard. Fields: emoji, label, tagline, desc, pain[], solve[[title, text]], icp, voice. */
const VERTICAL_PROFILES = {
  "restaurants": {
    "emoji": "🍽️",
    "label": "Restaurants",
    "tagline": "Your Financial Sous-Chef",
    "desc": "Restaurants manage dozens of vendors, receive invoices in every format imaginable, and operate on razor-thin margins. AP chaos directly impacts food cost, cash flow, and operator sanity.",
    "pain": [
      "High volume of invoices from produce, protein, beverage, and supply vendors",
      "Mixed formats — handwritten DSD receipts, emailed PDFs, fax, and EDI",
      "Chef/kitchen staff handling paper invoices with no AP training",
      "Price fluctuations between order and delivery create food cost variance",
      "Multi-unit groups lack consolidated spend visibility across locations",
      "Manual entry is a daily 2–4 hour time drain for small AP teams"
    ],
    "solve": [
      [
        "Mobile capture",
        "Chefs snap a photo → invoice is in Ottimate instantly. No paper, no manual entry."
      ],
      [
        "Email routing rules",
        "Vendor emails auto-forward into Ottimate. Zero manual upload."
      ],
      [
        "Cost file validation",
        "Catch price overcharges from vendors before any payment goes out."
      ],
      [
        "DSD Receiving",
        "Driver delivers, receiver scans the receipt. Ottimate flags any discrepancy immediately."
      ],
      [
        "Multi-location rollup",
        "See spend across every restaurant location in one dashboard."
      ],
      [
        "GL coding",
        "AI maps produce, protein, beverage costs to correct GL codes automatically."
      ]
    ],
    "icp": "Fine dining groups, fast casual chains, multi-unit operators, restaurant management companies",
    "voice": "\"We're not spending a lot of time on every single invoice. Before, I was probably spending 15 to 20 hours a week. And now, I go in every morning for about half an hour.\" — Mary Herrington, Accounting Manager"
  },
  "hospitality": {
    "emoji": "🏨",
    "label": "Hospitality",
    "tagline": "Your Financial Concierge",
    "desc": "Hotels, resorts, country clubs, and casinos manage complex multi-department spending with approval chains that span F&B, housekeeping, maintenance, and more. AP chaos here means unhappy guests and poor financial controls.",
    "pain": [
      "Multiple departments (F&B, housekeeping, maintenance, spa) each receiving invoices",
      "Cross-department approval workflows are manual and slow",
      "Seasonal volume spikes create processing backlogs",
      "Lack of centralized visibility across properties or departments",
      "Price discrepancies from DSD and direct vendor deliveries",
      "Decentralized purchasing makes budget control difficult"
    ],
    "solve": [
      [
        "Department-level GL coding",
        "Each line item coded to the right department, cost center, and property."
      ],
      [
        "Configurable approval workflows",
        "Route invoices by department, amount, or vendor — automatically."
      ],
      [
        "Multi-property visibility",
        "Corporate finance gets real-time view across all locations."
      ],
      [
        "Cost file validation",
        "Catch vendor overcharges across all procurement categories."
      ],
      [
        "Inn-Flow & M3 integration",
        "Native support for hospitality-specific ERPs."
      ],
      [
        "Vendor statement reconciliation",
        "Ensure what vendors say you owe matches your records."
      ]
    ],
    "icp": "Hotels, resorts, country clubs, casinos, multi-property hospitality groups",
    "voice": "Hospitality operators using Ottimate report dramatic reductions in invoice processing time and improved visibility into spend across all cost centers."
  },
  "retail": {
    "emoji": "🛒",
    "label": "Retail",
    "tagline": "Safeguard Your Margins",
    "desc": "Retail businesses operate on thin margins where even small price discrepancies from vendors add up quickly. With DSD deliveries, high invoice volumes, and multi-location operations, AP automation is a margin protection tool.",
    "pain": [
      "DSD vendors deliver directly to stores — invoices are often handwritten or paper-based",
      "Price variances from dozens of vendors go undetected without automation",
      "High invoice volume makes manual processing unsustainable",
      "Multi-store operators lack consolidated spend visibility",
      "Petty cash and small purchases are hard to track and control",
      "POS/ERP integration complexity across store systems"
    ],
    "solve": [
      [
        "DSD Receiving",
        "Scan DSD receipts at the back door. Ottimate checks against the price catalog instantly."
      ],
      [
        "Cost file validation",
        "Ensure every line item matches the contracted vendor price — zero overpayments."
      ],
      [
        "Invoice automation",
        "Batch upload hundreds of invoices at once — Ottimate separates, organizes, and processes."
      ],
      [
        "Spend management",
        "Replace petty cash with digital spend tracking and approval workflows."
      ],
      [
        "Real-time reporting",
        "Track expenses and spending patterns across all store locations."
      ],
      [
        "POS & ERP integration",
        "Connects with retail-specific systems for seamless data flow."
      ]
    ],
    "icp": "Regional retail chains, specialty retail groups, convenience stores, multi-location retail operators",
    "voice": "Retailers using Ottimate report catching price discrepancies that account for 0.5–1% of annual spend — meaningful savings at scale."
  },
  "grocery": {
    "emoji": "🥬",
    "label": "Grocery",
    "tagline": "Your Financial Customer Service Manager",
    "desc": "Grocery operates on some of the thinnest margins in retail. With thousands of SKUs, multiple DSD vendors per day, and complex price catalogs, even small AP errors have outsized impact on profitability.",
    "pain": [
      "Hundreds of DSD deliveries per week — each with its own receipt and pricing",
      "Vendor price catalogs have thousands of SKUs with constantly changing prices",
      "Manual receipt-to-price-catalog comparison is impossible at scale",
      "Invoice volume is among the highest of any industry",
      "Shrinkage and price discrepancies directly erode thin margins",
      "Multi-store chains have no consolidated view of procurement spend"
    ],
    "solve": [
      [
        "DSD Receiving",
        "Receiver scans DSD receipt → AI instantly checks against the price catalog."
      ],
      [
        "Price catalog validation",
        "Compare every line item to contracted pricing — thousands of SKUs, automatically."
      ],
      [
        "Batch upload",
        "Process hundreds of invoices simultaneously — Ottimate separates and organizes multi-page PDFs."
      ],
      [
        "GL automation",
        "Produce, dairy, frozen, dry goods — all coded to correct GL codes without human intervention."
      ],
      [
        "3-way matching",
        "Invoice × PO × receiving report for all purchase-order-based procurement."
      ],
      [
        "Chain-wide reporting",
        "See spend across every store location in real time."
      ]
    ],
    "icp": "Independent grocers, regional grocery chains, specialty food retailers, co-ops",
    "voice": "For a grocery chain spending $20M annually on inventory, catching just 0.5% in price discrepancies means $100K/year in recovered margin."
  },
  "seniorliving": {
    "emoji": "🏠",
    "label": "Senior Living",
    "tagline": "Smarter AP for Resident-Centered Care",
    "desc": "Senior living organizations balance care quality with financial discipline. Manual AP creates hidden costs, compliance risk, and operational drag — all of which ultimately impact resident care.",
    "pain": [
      "Dozens of vendors per community (food, medical supplies, maintenance, landscaping)",
      "Multi-community organizations have decentralized, inconsistent AP processes",
      "HIPAA and state-level compliance requirements demand documentation and audit readiness",
      "Small, overstretched AP teams spend hours on manual invoice entry",
      "Limited real-time spend visibility until invoices are fully processed",
      "Late payments strain vendor relationships and disrupt services"
    ],
    "solve": [
      [
        "Centralized visibility",
        "Corporate finance sees all communities in one dashboard — consistent, real-time."
      ],
      [
        "Standardized workflows",
        "Configure approval workflows across all communities for consistency."
      ],
      [
        "Audit trails",
        "Every action logged with timestamp — always audit-ready."
      ],
      [
        "Automated GL coding",
        "Food, medical, maintenance coded correctly every time."
      ],
      [
        "Staffing efficiency",
        "90%+ automation frees small AP teams to focus on exceptions, not entry."
      ],
      [
        "Vendor management",
        "Track payment terms, manage vendor records, and stay on top of what's owed."
      ]
    ],
    "icp": "Sub-acute care facilities, assisted living communities, memory care centers, dental and specialty senior health groups",
    "voice": "\"Before Ottimate, we had invoices sitting in piles. Now everything is processed and approved the same day.\" — Senior Living Finance Director"
  },
  "healthcare": {
    "emoji": "🏥",
    "label": "Healthcare",
    "tagline": "Your Financial Front Desk Coordinator",
    "desc": "Healthcare organizations depend on accurate, timely AP to ensure medical supplies, medications, and services flow without interruption. AP errors here have consequences beyond the balance sheet.",
    "pain": [
      "Complex compliance requirements (HIPAA, state audits, Medicare/Medicaid documentation)",
      "High vendor count across medical supplies, pharmaceuticals, and facilities",
      "Invoice errors can delay critical supplies and impact patient care",
      "Multiple departments and cost centers create approval complexity",
      "Manual processes make audit preparation time-consuming and risky",
      "Limited real-time visibility into supply chain spend"
    ],
    "solve": [
      [
        "Audit trails",
        "Complete documentation of every invoice, approval, and payment — always audit-ready."
      ],
      [
        "Compliance support",
        "SOC 2 certified platform with data security controls for healthcare data."
      ],
      [
        "Automated GL coding",
        "Medical supplies, pharmaceuticals, facility costs coded to correct cost centers."
      ],
      [
        "Approval workflows",
        "Route by department, cost center, or amount — ensuring the right person approves."
      ],
      [
        "Real-time visibility",
        "See supply spend across all departments and facilities as it happens."
      ],
      [
        "Vendor management",
        "Track outstanding obligations, payment terms, and vendor contacts in one place."
      ]
    ],
    "icp": "Hospitals, primary care clinics, dental groups, nursing homes, assisted living facilities, healthcare management companies",
    "voice": "Healthcare finance teams using Ottimate report spending significantly less time on invoice processing and more time on strategic financial management."
  }
};
module.exports = { VERTICAL_PROFILES };
