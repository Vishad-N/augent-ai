// Intelligent Document Processing page — copy taken verbatim from
// https://www.augent.ai/intelligent-document-processing (nothing here is invented).
// The industry tabs reuse `useCases` / `useCasesSection` from ./content.

export const idpMeta = {
  // Title/description reuse claims already on the page (agentic AI; ingest, classify,
  // extract, validate; ERP delivery; 99% accuracy). Keyword choice informed by OpenSEO SERP data.
  title: "Intelligent Document Processing (IDP) with Agentic AI | AuGENT",
  description:
    "Soothsayer's IDP framework uses agentic AI agents to ingest, classify, extract and validate document data, then deliver ERP-ready output into SAP, Oracle, NetSuite and Microsoft Dynamics. Up to 99% accuracy.",
  path: "/intelligent-document-processing",
  updatedIso: "2026-10-31",
};

export const idpNav = {
  links: [
    { label: "How it Works", href: "#steps" },
    { label: "Impact", href: "#impact" },
    { label: "Framework", href: "#frameworks" },
    { label: "Market", href: "#market" },
  ],
  cta: { label: "Schedule a demo", href: "#cta" },
};

export const idpHero = {
  eyebrow: "Intelligent Document Processing with AuGENT AI",
  title: "Documents In.\nInsights Out.\nInstantly.",
  paragraphs: [
    "From contracts and invoices to insurance claims and shipping forms, documents power your business. The real challenge lies in the time it takes to extract and act on the information inside.",
    "Soothsayer’s IDP framework uses agentic AI. These are intelligent, goal-driven agents that interpret documents, extract key data, and prepare it for your systems.",
    "This is more than automation. It is a self-improving framework that adapts to your workflows, formats, and scale. No templates. No delays. Just intelligent systems built to deliver.",
  ],
  cta: { label: "Schedule a demo", href: "#cta" },
};

export const idpSteps = {
  heading: { accent: "IDP Works", after: " Across All Document Types" },
  subtitle:
    "Whether you are processing 3,000 forms a week or 30,000 records a day, the framework deploys an ensemble of agents that handle classification, extraction, validation, and delivery. It scales to meet demand, adapts to new document types, and integrates seamlessly into your existing environment.",
  items: [
    {
      title: "Intelligent Ingestion",
      paragraphs: [
        "The workflow begins the moment a file enters the system. Ingestion agents continuously monitor inboxes, cloud storage, and document drop points. As soon as a new file appears, it is ingested into the pipeline in real time.",
        "Ingestion can be triggered in real time or handled in batches, depending on how your documents arrive. No manual uploads required. The agents operate continuously, ensuring that every document is captured without delay.",
      ],
    },
    {
      title: "Smart Classification",
      paragraphs: [
        "Each document is evaluated by classification agents that analyze structure, layout, and content to determine type. Whether it is a purchase order, claim form, contract, or inspection report, classification is handled accurately and without the need for templates or manual labeling.",
        "This allows the system to dynamically adapt to new formats and maintain high performance as document types evolve.",
      ],
    },
    {
      title: "Context-Aware Extraction & Validation",
      paragraphs: [
        "Extraction agents interpret the content of each document and isolate only the relevant fields, such as line items, policy numbers, dates, totals, or terms. These agents understand document context and structure, enabling accurate and efficient field-level parsing.",
        "Validation agents then check each extracted value against master data, business rules, or regulatory conditions. The system also includes a human-in-the-loop layer for reviewing flagged data or exceptions before continuing downstream.",
      ],
    },
    {
      title: "Structured ERP-Ready Output Generation",
      paragraphs: [
        "Once validated, output agents reformat the data to match the schemas used by your ERP or business applications. These agents handle field mapping, naming conventions, and structural alignment to ensure compatibility with internal systems.",
        "The result is clean, consistent, and audit-ready data that requires no post-processing or manual correction.",
      ],
    },
    {
      title: "Seamless System Integration",
      paragraphs: [
        "Integration agents securely deliver structured data into your enterprise systems. Whether you use SAP, Oracle, NetSuite, Microsoft Dynamics, or custom-built platforms, these agents manage authentication, data transfer, and system-specific logic.",
        // Source text reads "creates are liable" (sic); corrected spacing only.
        "For workflows with compliance or governance requirements, the system can pause for a final human review before writing to production. This combination of autonomous agents and human oversight creates a reliable, scalable, and trustworthy document processing framework.",
      ],
    },
  ],
};

export const idpImpact = {
  heading: { accent: "Quantitative", after: " Impact" },
  stats: [
    { value: "40,000+", label: "Hours automated" },
    { value: "$14Mn+", label: "Saved Annually" },
    { value: "90%", label: "Faster Cycles" },
    { value: "99%", label: "Accuracy" },
  ],
  deployed: "Deployed across Finance, Legal, Insurance, and more",
  qualitativeHeading: { accent: "Qualitative", after: " Impact" },
  without: {
    title: "Without IDP",
    points: [
      "Manual document review and data entry",
      "Processing cycles stretched over multiple days",
      "Frequent errors due to inconsistent document formats",
      "Additional staff needed to handle scale",
      "Data trapped in emails, scans, or handwritten forms",
    ],
  },
  with: {
    title: "With IDP",
    points: [
      "Up to 99% less manual work",
      "Cycle times reduced to minutes",
      "Significantly higher accuracy with real-time validation",
      "Scaled without increasing headcount",
      "Structured data delivered directly into enterprise systems",
    ],
  },
};

export const idpMarket = {
  heading: { before: "A ", accent: "Market", after: " on the Move" },
  subtitle: "For CIOs, COOs, CFOs, and digital transformation leaders, the time to act is now",
  points: [
    "Automation delivers up to 99% data accuracy and slashes cycle times across claims, compliance, operations, and finance",
    "Organizations using IDP report 35% to 70% cost reduction in document-heavy workflows",
    "With the IDP market expected to surge past $10 billion by 2030, organizations that adopt now are positioning themselves ahead of the curve faster, leaner, and more automated than those still relying on manual processes.",
    "The most successful adopters embed IDP across critical business functions and see measurable results in weeks, not quarters.",
  ],
};

export const idpCta = {
  heading: "Ready to Eliminate the Manual Grind?",
  paragraphs: [
    "If your organization is dealing with high volumes of documents, intelligent automation is no longer optional. Soothsayer can help you reduce cost, accelerate workflows, and increase accuracy – all without disrupting your existing systems.",
  ],
  emphasis: "Let’s talk about how to bring this framework into your enterprise.",
};
