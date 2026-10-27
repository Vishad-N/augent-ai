// AuGENT clone — all page content.
// Base data comes from the provided augent-content.ts. Section headings, the
// remaining 15 industry tabs, form fields and links were copied verbatim from
// the live https://www.augent.ai/ page (nothing here is invented).

const A = "/assets";

export const meta = {
  title: "Enterprise AI Platform for Secure Neural Workflows | AuGENT",
  description:
    "Unlock advanced analytics and predictions with AuGENT by Soothsayer Analytics. Harness AI-driven insights for better decision-making across various industries.",
};

export const nav = {
  logoDark: `${A}/logo-dark.svg`,
  logoWhite: `${A}/logo-white.svg`,
  links: [
    { label: "Solutions", href: "#solutions" },
    { label: "Core Capabilities", href: "#core-capabilities" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Architecture", href: "#architecture" },
    { label: "Philosophy", href: "#philosophy" },
  ],
  cta: { label: "Schedule a Demo", href: "#cta" },
};

export const hero = {
  title: "Retrieve knowledge.\nAutomate decisions.\nExecute with confidence.",
  subtitle:
    "AuGENT unifies enterprise data, governs AI behavior, and deploys intelligent agents across your organization, securely and at scale.",
  primaryCta: { label: "Schedule a Demo", href: "#cta" },
  secondaryCta: { label: "Explore Architecture", href: "#architecture" },
  // Background videos are streamed from the live site's video host.
  video: "https://video.wixstatic.com/video/53d759_a4466fd354ec47f0b8c9f6a6c3ac6c66/1080p/mp4/file.mp4",
  videoMobile: "https://video.wixstatic.com/video/53d759_e98dca62fc7b4f2ca54f1124e8f8a476/1080p/mp4/file.mp4",
};

export const structuredSystem = {
  heading: { before: "A ", accent: "Structured System", after: " for Enterprise AI" },
  subtitle:
    "Three integrated planes that separate intelligence, control, and execution ensuring clarity, compliance, and scalability.",
};

export const planes = [
  {
    id: "intelligent",
    title: "Intelligent Plane",
    tag: "Creativity + Context",
    description:
      "Generate insights, decisions, and reasoning tailored to business workflows using enterprise knowledge.",
    lottie: `${A}/lottie/intelligent-plane.lottie`,
  },
  {
    id: "control",
    title: "Control Plane",
    tag: "Safety + Compliance",
    description:
      "Deterministic validation, policy alignment, governed tool execution, and human-in-the-loop checkpoints.",
    lottie: `${A}/lottie/control-plane.lottie`,
  },
  {
    id: "core",
    title: "Core Functional Plane",
    tag: "Foundation + Scale",
    description:
      "Hardened identity, security, observability, auditability, and operational lifecycle management for enterprise deployment.",
    lottie: `${A}/lottie/core-plane.lottie`,
  },
];

export const problemSection = {
  heading: { accent: "AI Without", after: " Control Creates More Risk Than Value" },
  subtitle:
    "Organizations investing in AI often face fragmented tools, inconsistent outputs, and limited governance slowing adoption and increasing operational risk.",
};

export const problems = [
  {
    title: "Disconnected AI systems across teams",
    description:
      "AI initiatives operate in silos, preventing seamless collaboration and unified decision-making across the organization.",
    image: `${A}/problems/disconnected.svg`,
  },
  {
    title: "Limited visibility and control",
    description:
      "Lack of centralized oversight makes it difficult to monitor, govern, and manage AI-driven processes effectively.",
    image: `${A}/problems/visibility.svg`,
  },
  {
    title: "Unreliable or non-compliant outputs",
    description:
      "Inconsistent results and absence of guardrails increase the risk of inaccurate, unverified, or non-compliant outcomes.",
    image: `${A}/problems/unreliable.svg`,
  },
  {
    title: "High investment with unclear outcomes",
    description:
      "Significant investments in AI fail to translate into measurable business value due to limited alignment with core objectives.",
    image: `${A}/problems/investment.svg`,
  },
];

export const solutionsSection = {
  heading: { before: "AuGENT Brings ", accent: "Structure to Enterprise AI" },
  subtitle:
    "From knowledge retrieval to decision execution all within a governed, scalable platform designed for enterprise environments.",
  background: `${A}/solutions-bg.png`,
};

export const solutions = [
  {
    title: "Intelligent Document Processing",
    subtitle: "IDP / IDGP — End-to-End Document Automation",
    description:
      "Handles high-volume, complex documents with goal-driven AI agents that ingest, classify, extract, validate, and deliver structured, audit-ready data without templates or manual effort. Integrates directly into ERP, CRM, and compliance systems.",
    lottie: `${A}/lottie/idp.lottie`,
    lottieMobile: `${A}/lottie/idp-mobile.lottie`,
  },
  {
    title: "Ideation to Requirement",
    subtitle: "Ideation to Requirement",
    description:
      "Streamlines the journey from idea to structured requirement documentation. Describe a problem or concept and AI agents generate a document outline, then engage in adaptive conversations to gather all details producing a complete, exportable requirement file.",
    lottie: `${A}/lottie/ideation.lottie`,
    lottieMobile: `${A}/lottie/ideation-mobile.lottie`,
  },
  {
    title: "SalesGENT",
    subtitle: "Sales Prospecting & Meeting Prep Assistant",
    description:
      "Transforms how sales teams prepare for prospecting and meetings. Automates personalized sales intelligence based on target company and title delivering tailored insights, scripts, and talking points in under two minutes.",
    lottie: `${A}/lottie/salesgent.lottie`,
    lottieMobile: `${A}/lottie/salesgent-mobile.lottie`,
  },
];

// Live-site order: four "additional" capability cards sit above the
// "Core Capabilities of AuGENT" heading, three core cards sit beside/below it.
export const additionalCapabilities = [
  {
    title: "Agentic Workflow Engine",
    description: "LangGraph/LangChain, multi-agent orchestration",
    image: `${A}/capabilities/agentic.svg`,
  },
  {
    title: "Multi-Tenant Architecture",
    description: "Isolated environments, data privacy",
    image: `${A}/capabilities/multi-tenant.svg`,
  },
  {
    title: "Multi-LLM Integration",
    description: "Azure OpenAI, Anthropic Claude, Google Gemini",
    image: `${A}/capabilities/multi-llm.svg`,
  },
  {
    title: "Modular RAG Pipelines",
    description: "semantic chunking, hybrid indexing, multi-modal",
    image: `${A}/capabilities/modular-rag.svg`,
  },
];

export const coreCapabilitiesHeading = {
  accent: "Core Capabilities",
  after: "of AuGENT",
  // added for the redesigned section header
  subtitle: "From multi-agent orchestration to governed evaluation, everything needed for secure enterprise AI.",
};

export const coreCapabilities = [
  {
    title: "Evaluation Module",
    description: "semantic scoring, groundedness, Precision@k, MRR, Faithfulness",
    image: `${A}/capabilities/evaluation.png`,
  },
  {
    title: "Enterprise Security",
    description: "SSO, RBAC, OAuth2, Key Vault, VNet, AES-256, PII redaction",
    image: `${A}/capabilities/security.png`,
  },
  {
    title: "Observability & DevOps",
    description: "Azure Monitor, CI/CD, Terraform, agent versioning",
    image: `${A}/capabilities/observability.svg`,
  },
];

export const trusted = {
  heading: { accent: "Trusted ", after: "by Enterprise Teams" },
  subtitle: "Deployed across industries to deliver measurable business outcomes.",
  logos: [
    { name: "Abercrombie & Fitch", src: `${A}/logos/abercrombie.png` },
    { name: "American Electric Power", src: `${A}/logos/aep.svg` },
    { name: "DHL", src: `${A}/logos/dhl.png` },
    { name: "Dow", src: `${A}/logos/dow.png` },
    { name: "Dun & Bradstreet", src: `${A}/logos/dnb.png` },
    { name: "Ford", src: `${A}/logos/ford.png` },
    { name: "GEA", src: `${A}/logos/gea.png` },
    { name: "SABIC", src: `${A}/logos/sabic.png` },
    { name: "Wendy's", src: `${A}/logos/wendys.png` },
    { name: "Whirlpool", src: `${A}/logos/whirlpool.png` },
  ],
};

export const useCasesSection = {
  heading: { before: "One Framework, ", accent: "Many Use Cases" },
  subtitle:
    "Whether you're handling 3000 forms a week or 30,000 records a day, Soothsayer’s pipeline executes each step flawlessly and at scale.",
};

export const useCaseIndustries = [
  "Automotive",
  "Banking & Finance",
  "Energy",
  "Government",
  "Healthcare & Pharma",
  "Hospitality",
  "Insurance",
  "Legal",
  "Manufacturing",
  "Marine & Logistics",
  "Oil & Gas",
  "Professional Services",
  "Real Estate",
  "Retail",
  "Supply Chain",
  "Telecom",
];

export type UseCase = {
  industry: string;
  icon: string;
  outcomes: string;
  documentTypes: string;
  description: string;
};

// Text copied verbatim from each tab on the live site (including the Real
// Estate description, which the live site currently duplicates from Manufacturing).
export const useCases: UseCase[] = [
  {
    industry: "Automotive",
    icon: `${A}/sectors/automotive.svg`,
    outcomes: "Accelerated claims processing, reduced manual review, better aftersales support",
    documentTypes: "Invoices, warranty claims, inspection records",
    description:
      "From warranty claims to inspection records and supplier invoices, automotive workflows rely on high-volume, high-stakes documentation. Manual review slows down customer support, after-sales processes, and supplier payments. We automate the ingestion, classification, and extraction of these documents to accelerate claims, reduce disputes, and ensure accurate warranty tracking across distributed networks.",
  },
  {
    industry: "Banking & Finance",
    icon: `${A}/sectors/banking.svg`,
    outcomes:
      "Faster onboarding and decisioning, stronger compliance, lower processing cost, and audit-ready records",
    documentTypes:
      "KYC packets, identity documents, proof of address, bank statements, remittance advice, loan and mortgage files, trade finance documents, SWIFT messages, reconciliations",
    description:
      "Lawful growth depends on speed and control. Banking teams handle large volumes of multi format documents that demand accuracy and traceability. Soothsayer’s framework uses agentic AI to classify files, extract key fields, validate against core banking data and sanctions lists, and assemble complete case files. The result is higher straight-through rates, fewer exceptions, and a clear audit trail across onboarding, lending, and operations.",
  },
  {
    industry: "Energy",
    icon: `${A}/sectors/energy.svg`,
    outcomes: "Improved data accuracy, timely submissions, and reduced non-compliance risk",
    documentTypes: "Compliance filings, meter data sheets, regulatory reports",
    description:
      "Regulatory filings, meter calibration sheets, and compliance reports must be accurate, timely, and traceable. Yet they often exist in inconsistent formats across regions or teams. We convert these static documents into structured data pipelines that flow directly into internal systems or regulatory portals, improving accuracy, accountability, and on-time submission rates.",
  },
  {
    industry: "Government",
    icon: `${A}/sectors/government.svg`,
    outcomes:
      "Faster citizen services, reduced backlog, improved transparency, and lower administrative cost",
    documentTypes:
      "Visa and residency applications, permits and licenses, tenders and bids, tax filings, customs declarations, court, and land records",
    description:
      "Public agencies process complex applications at scale. Soothsayer’s agentic AI classifies submissions, extracts required fields, checks completeness against eligibility rules, and builds case files ready for decision. Optional human review is available for sensitive steps. For Middle East ministries and authorities, the framework supports Arabic and English documents, seals, and forms, and integrates with existing ECM and ERP platforms to strengthen service delivery and oversight.",
  },
  {
    industry: "Healthcare & Pharma",
    icon: `${A}/sectors/healthcare.svg`,
    outcomes: "Accelerated data entry, better patient care, and regulatory adherence",
    documentTypes: "Patient records, clinical trial reports, lab results",
    description:
      "Clinical environments rely on timely and accurate documentation: patient records, referral notes, lab results, and trial data. Manual entry consumes time, introduces risk, and stalls workflows. Our framework extracts relevant data from structured and semi-structured documents and feeds it into EHR, billing, or research systems. This leads to faster diagnosis support, cleaner trial datasets, and improved patient care.",
  },
  {
    industry: "Hospitality",
    icon: `${A}/sectors/hospitality.svg`,
    outcomes: "Enhanced guest experience, streamlined operations, and better contract visibility",
    documentTypes: "Guest records, vendor contracts, compliance reports",
    description:
      "Guest records, vendor contracts, health certifications, and incident reports all live in documents that must be retrieved, reviewed, and tracked. When done manually, operations slow down and visibility suffers. Soothsayer helps hospitality operators structure these documents automatically, improving guest experience, contract visibility, and operational compliance across locations.",
  },
  {
    industry: "Insurance",
    icon: `${A}/sectors/legal.svg`,
    outcomes: "Enhanced fraud detection, reduced processing time, improved claims accuracy",
    documentTypes: "Claims forms, policy documents, COIs",
    description:
      "Policy documents, claims forms, and certificates of insurance arrive in multiple formats across channels. Manual handling causes delays, inconsistencies, and compliance exposure. Our framework ingests, interprets, and validates insurance documents in real time, accelerating claims processing, enhancing fraud detection, and maintaining high service quality.",
  },
  {
    industry: "Legal",
    icon: `${A}/sectors/legal.svg`,
    outcomes: "Improved case preparation, lower research time, and streamlined document review",
    documentTypes: "Case files, contracts, discovery documents",
    description:
      "Law firms and legal departments are flooded with contracts, case files, depositions, and discovery documents. Time is money, and every delay or misclassification has consequences. Soothsayer’s framework supports legal teams by automating document review, clause extraction, and entity tagging. This dramatically reduces prep time, improves research accuracy, and helps attorneys focus on strategy rather than sorting through PDFs.",
  },
  {
    industry: "Manufacturing",
    icon: `${A}/sectors/manufacturing.svg`,
    outcomes: "Faster quality checks, automated compliance, and improved production traceability",
    documentTypes: "BOMs, quality reports, material certifications",
    description:
      "Factory operations generate an endless trail of paperwork: bills of materials, inspection checklists, quality reports, and compliance certificates. These documents are essential to production but painful to manage manually. Soothsayer’s framework digitizes and validates them automatically, enabling faster quality checks, streamlined compliance reporting, and end-to-end production traceability. This improves agility across plants without adding headcount.",
  },
  {
    industry: "Marine & Logistics",
    icon: `${A}/sectors/marine.svg`,
    outcomes: "Quicker customs clearance, optimized freight processing, reduced delays",
    documentTypes: "Bills of lading, customs paperwork, freight invoices",
    description:
      "Bills of lading, freight invoices, and customs documents are the lifeblood of international logistics. But differing formats and regulations make them hard to process at scale. We unify and streamline these workflows by automating document ingestion, customs validation, and routing logic. That means faster clearances, better shipment visibility, and fewer penalties or delays at borders.",
  },
  {
    industry: "Oil & Gas",
    icon: `${A}/sectors/oil-gas.svg`,
    outcomes: "Streamlined regulatory submissions, safer operations, and faster audit readiness",
    documentTypes: "Permitting documents, safety audits, maintenance logs",
    description:
      "In upstream and downstream operations, documents like permitting files, safety audits, and equipment logs are often trapped in PDFs and scans. This delays decision-making and increases regulatory risk. Soothsayer’s solution unlocks these files by extracting key data points, mapping them to safety and compliance frameworks, and triggering alerts or escalations where needed. The result is safer operations and faster audit readiness.",
  },
  {
    industry: "Professional Services",
    icon: `${A}/sectors/professional.svg`,
    outcomes: "Accurate billing, faster approvals, and reduced compliance errors",
    documentTypes: "Engagement letters, timesheets, audit documentation",
    description:
      "Consulting firms, auditors, and accounting teams handle time sheets, engagement letters, and client correspondence on a daily basis. Manual workflows slow down billing, approvals, and compliance. Our solution digitizes these documents, tracks status, and ensures accuracy. This enables faster billing cycles, cleaner audits, and stronger client relationships.",
  },
  {
    industry: "Real Estate",
    icon: `${A}/sectors/real-estate.svg`,
    outcomes: "Simplified property management, faster deal cycles, and legal risk mitigation",
    documentTypes: "Lease agreements, title deeds, appraisal reports",
    description:
      "Factory operations generate an endless trail of paperwork: bills of materials, inspection checklists, quality reports, and compliance certificates. These documents are essential to production but painful to manage manually. Soothsayer’s framework digitizes and validates them automatically, enabling faster quality checks, streamlined compliance reporting, and end-to-end production traceability. This improves agility across plants without adding headcount.",
  },
  {
    industry: "Retail",
    icon: `${A}/sectors/retail.svg`,
    outcomes:
      "Faster order accuracy, improved in-stock rates, fewer chargebacks, and better customer experience",
    documentTypes:
      "Customer POs, order changes, invoices, RMAs and returns labels, vendor agreements, promotion sheets, tax exemption certificates, product spec sheets",
    description:
      "Omnichannel retail creates constant document traffic across stores, e-commerce, and DCs. Soothsayer’s agentic AI classifies each file, extracts prices, SKUs, quantities, and terms, and validates them against the product and pricing masters. Exceptions are routed instantly, which reduces entry errors, speeds fulfillment, and tightens reconciliation across merchandising, stores, and finance.",
  },
  {
    industry: "Supply Chain",
    icon: `${A}/sectors/supply-chain.svg`,
    outcomes:
      "Real-time shipment visibility, fewer penalties, faster throughput at DCs, and lower cost to serve",
    documentTypes:
      "ASNs, bills of lading, packing lists, proofs of delivery, customs and import documents, carrier invoices, weighbridge tickets",
    description:
      "Global supply chains rely on documents from many partners and carriers. Soothsayer’s agentic AI ingests and classifies these files, extracts shipment IDs, weights, piece counts, and destinations, and validates them against orders and TMS data. Discrepancies are flagged, claim packets are assembled automatically, and clean data flows to ERP and WMS to improve OTIF, reduce chargebacks, and accelerate payment cycles.",
  },
  {
    industry: "Telecom",
    icon: `${A}/sectors/telecom.svg`,
    outcomes:
      "Faster subscriber onboarding, cleaner billing, quicker site rollout, and regulator-ready compliance",
    documentTypes:
      "Subscriber KYC forms, national IDs, contracts, service orders, tower leases, site acquisition and right-of-way permits, vendor invoices, import and customs paperwork",
    description:
      "Telecom operations run on identity checks, contracts, and network rollout documents. Our agentic AI ingests files from branches, partners, and portals, classifies them, and extracts subscriber and contract details with validation against CRM and billing systems. For Middle East operators, the framework handles Arabic and English documents, stamps, and right-to-left scripts. Compliance packets are assembled automatically, reducing cycle time and revenue leakage.",
  },
];

export const architecture = {
  heading: { before: "A Transparent, End-to-End ", accent: "Architecture" },
  subtitle:
    "From data ingestion to decision execution every layer is designed for performance, flexibility, and control.",
  lottie: `${A}/lottie/architecture.lottie`,
  lottieMobile: `${A}/lottie/architecture-mobile.lottie`,
  circles: `${A}/architecture-circles.svg`,
};

// Layers and tools exactly as drawn in the live site's architecture diagram
// (read from public/assets/lottie/architecture.lottie), top to bottom.
export const architectureLayers = [
  { name: "Smart Search & Access", tools: ["Weaviate", "Azure AI Search"] },
  { name: "AI Reasoning Engine", tools: ["Azure", "OpenAI", "Anthropic", "Gemini"] },
  { name: "Workflow Automation", tools: ["LangGraph", "LangChain"] },
  { name: "Application Layer", tools: ["Python Qt", "React"] },
  { name: "Security & Governance", tools: ["Entra ID", "RBAC", "OAuth2", "Key Vault", "VNet"] },
  { name: "Observability & DevOps", tools: ["Azure Monitor", "Terraform", "Azure DevOps"] },
  { name: "Performance Monitoring", tools: ["Semantic Scoring", "Metrics", "Feedback Loops"] },
];

export const whySection = {
  heading: { accent: "Why", after: " AuGENT?" },
  subtitle:
    "From data ingestion to decision execution every layer is designed for performance, flexibility, and control.",
};

export const whyAugent = [
  "No vendor lock-in",
  "No data leakage",
  "No per-seat pricing",
  "No disconnected systems",
];

export const whoUsesSection = {
  heading: { before: "Who Uses ", accent: "AuGENT?" },
  footer: "Discover How Enterprises Like Yours Operationalize AI with AuGENT",
  glow: `${A}/users/glow.svg`,
};

export const whoUses = [
  {
    role: "CIOs & CDOs",
    icon: `${A}/users/cios.svg`,
    description:
      "CIOs & CDOs for a secure GenAI execution layer with full control over data, models, and deployment.",
  },
  {
    role: "Shared Services Teams",
    icon: `${A}/users/shared-services.svg`,
    description:
      "Shared Services Teams such as Legal, Finance, Procurement, and HR can automate repeatable tasks like information extraction, reviews, audits, or policy Q&A securely and at scale.",
  },
  {
    role: "Product, Ops & Transformation Leads",
    icon: `${A}/users/product-ops.svg`,
    description:
      "Product, Ops, and Transformation Leads for a no-code setup to launch AI workflows fast, without waiting on dev resources.",
  },
  {
    role: "Executives & Analysts",
    icon: `${A}/users/executives.svg`,
    description:
      "Executives & Analysts for insights at the right level e.g. summaries, KPIs, visuals, or executable logic.",
  },
  {
    role: "Process Owners & Domain SMEs",
    icon: `${A}/users/process-owners.svg`,
    description:
      "Process Owners & Domain SMEs for configure AI workflows aligned to how your function actually operates, no prompt engineering needed.",
  },
  {
    role: "AI & Data Teams",
    icon: `${A}/users/ai-data.svg`,
    description:
      "AI & Data Teams for a flexible toolkit to build agents, advanced RAG flows, and intelligent pipelines with speed & precision.",
  },
  {
    role: "IT & Infrastructure Teams",
    icon: `${A}/users/it-infra.svg`,
    description:
      "IT & Infrastructure Teams to deploy on-prem or in VPC, integrate with existing stack, and control usage by team, domain, or cost center.",
  },
  {
    role: "Teams in Every Sector",
    icon: `${A}/users/every-sector.svg`,
    description:
      "Teams in Every Sector for everything from claims triage to invoice parsing to equipment audits. AuGENT adapts to how you work.",
  },
];

export const philosophySection = {
  heading: { before: "The ", accent: "Philosophy", after: " Behind the Name" },
  logo: `${A}/philosophy-logo.svg`,
  tagline: "Learn Why This Isn’t Just Another GenAI Tool",
};

// First letter of each line is bolded on the live site (G-E-N-T).
export const philosophy = [
  "Guided means AI should adapt to your logic, domain, and data.",
  "Evolution means it should get smarter with time and usage.",
  "Neural reflects how the architecture thinks and learns.",
  "Transformation is the outcome, not just outputs, but impact.",
];

export const ctaSection = {
  heading: "Bring Structure to Your AI Strategy",
  tick: `${A}/tick.svg`,
  privacyHref: "https://soothsayeranalytics.com/privacy-policy/",
  termsHref: "https://soothsayeranalytics.com/terms-conditions/",
  submitLabel: "Submit",
};

export const ctaPoints = [
  "Secure and compliant deployment",
  "Tailored to your enterprise workflows",
  "Scalable across departments",
  "Measurable ROI from day one",
];

export const ctaFields = {
  left: [
    { name: "name", placeholder: "*Name", type: "text", required: true },
    { name: "email", placeholder: "*E-mail", type: "email", required: true },
    { name: "mobile", placeholder: "Mobile Number", type: "tel", required: false },
  ],
  right: [
    { name: "company", placeholder: "*Company", type: "text", required: true },
    { name: "jobTitle", placeholder: "*Job Title", type: "text", required: true },
  ],
  message: { name: "message", placeholder: "Questions or Comments?" },
};

export const footer = {
  logo: `${A}/logo-white.svg`,
  copyright: "© 2026 Soothsayer Analytics.  All rights reserved.",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/soothsayer-analytics" },
    { label: "Instagram", href: "https://www.instagram.com/soothsayeranalytics" },
    { label: "Facebook", href: "https://www.facebook.com/SoothsayerAnalytics" },
    { label: "YouTube", href: "https://www.youtube.com/@SoothsayerAnalytics" },
  ],
  legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};
