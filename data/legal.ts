export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[] };

export type LegalFaq = { q: string; a: string };

export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  intro: string;
  /** Answer-first key points shown above the full text; also feeds answer engines. */
  summary: string[];
  faqs: LegalFaq[];
  sections: LegalSection[];
};

export const siteUrl = "https://www.augent.ai";
export const orgName = "Soothsayer Analytics";

const company = "Soothsayer Analytics";
const contact = "through the contact form at https://www.augent.ai/#cta";
const updated = "October 28, 2026";
export const updatedIso = "2026-10-28";

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  description: `How ${company} collects, uses and protects personal information on the AuGENT.ai website.`,
  updated,
  intro: `${company} ("we", "us", "our") operates the AuGENT.ai website. This Privacy Policy explains what personal information we collect when you visit the site or contact us, how we use it, and the choices you have.`,
  summary: [
    "We collect the details you submit in our demo form (name, work e-mail, optional mobile number, company, job title, message) plus basic technical data such as IP address, browser and pages viewed.",
    "We use it to answer enquiries, run and improve the website and measure how it is used.",
    "We do not sell personal information. We share it only with service providers acting on our instructions, advisers, or where the law requires.",
    "Depending on where you live you can access, correct, delete or export your data, object to processing and withdraw consent by contacting us.",
  ],
  faqs: [
    { q: "What personal data does AuGENT.ai collect?", a: "Contact details you submit through the demo or enquiry form (name, work e-mail, mobile number, company, job title and message) and technical data such as IP address, browser type, device information and pages viewed." },
    { q: "Does Soothsayer Analytics sell my personal information?", a: "No. We do not sell personal information. We share it only with service providers that act on our instructions, professional advisers, when required by law, or in a business transfer." },
    { q: "How can I access or delete my data?", a: "Contact us through the contact form on augent.ai. Depending on your location you can request access, correction, deletion or export of your data, object to or restrict processing, or withdraw consent." },
    { q: "How long is my data kept?", a: "Only as long as needed for the purposes in this policy, including legal, accounting and reporting requirements, after which it is deleted or anonymised." },
    { q: "Is the AuGENT.ai website meant for children?", a: "No. The site is intended for business audiences and is not directed to children under 16." },
  ],
  sections: [
    {
      heading: "Information we collect",
      paragraphs: ["We collect information in two ways: information you give us and information collected automatically."],
      list: [
        "Contact details you submit through our demo or enquiry form, such as name, work e-mail, mobile number, company, job title and your message.",
        "Technical data collected automatically, such as IP address, browser type, device information, pages viewed and referring URLs.",
        "Cookie and similar technology data, as described in our Cookie Policy.",
      ],
    },
    {
      heading: "How we use information",
      list: [
        "To respond to enquiries and schedule product demonstrations.",
        "To operate, secure, maintain and improve the website.",
        "To understand how visitors use the site and to measure the effectiveness of our content.",
        "To send business communications you have asked for or that are relevant to your enquiry, with an option to opt out.",
        "To comply with legal obligations and to protect our rights.",
      ],
    },
    {
      heading: "Legal bases for processing",
      paragraphs: [
        "Where data protection law such as the GDPR applies, we process personal information based on your consent, to take steps at your request before entering a contract, for our legitimate interests in running and improving our business, and to meet legal obligations.",
      ],
    },
    {
      heading: "Sharing of information",
      paragraphs: [
        "We do not sell your personal information. We share it only with service providers that help us run the website and handle enquiries (for example hosting, analytics and communications providers), with professional advisers, when required by law, or in connection with a business transfer. Service providers act on our instructions and are required to protect your information.",
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "Your information may be processed in countries other than your own. Where required, we use appropriate safeguards such as standard contractual clauses for those transfers.",
      ],
    },
    {
      heading: "Data retention",
      paragraphs: [
        "We keep personal information only as long as needed for the purposes described above, including to meet legal, accounting or reporting requirements, and then delete or anonymise it.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "We use reasonable technical and organisational measures to protect personal information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, delete or export your personal information, to object to or restrict certain processing, to withdraw consent, and to lodge a complaint with your local data protection authority. To exercise these rights, contact us using the details below.",
      ],
    },
    {
      heading: "Children",
      paragraphs: ["The website is intended for business audiences and is not directed to children under 16. We do not knowingly collect their personal information."],
    },
    {
      heading: "Third-party links",
      paragraphs: ["The site may link to third-party websites and social networks. We are not responsible for their privacy practices and encourage you to read their policies."],
    },
    {
      heading: "Changes to this policy",
      paragraphs: ["We may update this policy from time to time. The date at the top shows when it was last revised, and material changes will be highlighted on this page."],
    },
    {
      heading: "Contact us",
      paragraphs: [`For privacy questions or requests, contact ${company} ${contact}.`],
    },
  ],
};

export const termsOfService: LegalDoc = {
  slug: "terms-of-service",
  title: "Terms of Service",
  description: `The terms that govern your use of the AuGENT.ai website, operated by ${company}.`,
  updated,
  intro: `These Terms of Service ("Terms") govern your access to and use of the AuGENT.ai website operated by ${company}. By using the site you agree to these Terms. If you do not agree, please do not use it.`,
  summary: [
    "By using augent.ai you agree to these terms. Use the site lawfully and do not disrupt, scrape heavily, attack or reverse engineer it.",
    `All site content and the AuGENT name belong to ${company} or its licensors; you may view and link to it but not reproduce it without written permission.`,
    "Site content is general information, not a binding offer. Commercial engagements are covered by separate written agreements.",
    "The site is provided as is, and our liability is limited to the extent the law permits.",
  ],
  faqs: [
    { q: "Who operates the AuGENT.ai website?", a: `The website is operated by ${company}.` },
    { q: "Can I copy content from AuGENT.ai?", a: "Not without written permission. You may view the site and share links to it, but text, graphics, logos and software are protected by intellectual property laws." },
    { q: "Is the information on the site a binding offer?", a: "No. It describes products and capabilities for general information. Any commercial engagement is governed by a separate written agreement." },
    { q: "Are there warranties on the website?", a: "The site is provided \"as is\" and \"as available\" without warranties, and we do not guarantee it will be uninterrupted or error-free." },
    { q: "How will I know if the terms change?", a: "Updated terms are posted on this page with a new \"last updated\" date. Continued use of the site means you accept the changes." },
  ],
  sections: [
    {
      heading: "Use of the website",
      paragraphs: ["You may use the site only for lawful purposes and in line with these Terms. You agree not to:"],
      list: [
        "Attempt to gain unauthorised access to the site, its servers or connected systems.",
        "Interfere with or disrupt the site, including by introducing malware or running automated scraping that burdens our infrastructure.",
        "Use the site to infringe the rights of others or to submit false or misleading information.",
        "Copy, reverse engineer or exploit any part of the site except as permitted by law.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        `All content on the site, including text, graphics, logos, animations, software and the AuGENT name, is owned by ${company} or its licensors and is protected by intellectual property laws. You may view the site and share links to it, but you may not reproduce or distribute its content without our written permission.`,
      ],
    },
    {
      heading: "Information provided on the site",
      paragraphs: [
        "The site describes our products and capabilities for general information. It is not an offer or a binding commitment. Any commercial engagement will be governed by a separate written agreement between you and us.",
      ],
    },
    {
      heading: "Submissions",
      paragraphs: [
        "If you send us questions, comments or feedback, you grant us a non-exclusive, royalty-free right to use them to respond to you and to improve our products and services. Personal information you submit is handled under our Privacy Policy.",
      ],
    },
    {
      heading: "Third-party links",
      paragraphs: ["Links to third-party sites are provided for convenience. We do not control or endorse those sites and are not responsible for their content or practices."],
    },
    {
      heading: "Disclaimer of warranties",
      paragraphs: [
        'The site is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy or non-infringement. We do not warrant that the site will be uninterrupted or error-free.',
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        `To the fullest extent permitted by law, ${company} and its affiliates, directors, employees and agents will not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits, data or goodwill, arising from your use of or inability to use the site.`,
      ],
    },
    {
      heading: "Indemnification",
      paragraphs: [`You agree to indemnify and hold ${company} harmless from claims, losses and expenses arising from your breach of these Terms or misuse of the site.`],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These Terms are governed by the laws of the jurisdiction in which the operating entity of Soothsayer Analytics is established, without regard to conflict-of-law rules. Courts in that jurisdiction have exclusive jurisdiction over disputes, except where local law requires otherwise.",
      ],
    },
    {
      heading: "Changes to these Terms",
      paragraphs: ["We may revise these Terms at any time by posting the updated version here. Continued use of the site after changes take effect means you accept them."],
    },
    {
      heading: "Contact us",
      paragraphs: [`Questions about these Terms can be sent to ${company} ${contact}.`],
    },
  ],
};

export const cookiePolicy: LegalDoc = {
  slug: "cookie-policy",
  title: "Cookie Policy",
  description: `How the AuGENT.ai website, operated by ${company}, uses cookies and similar technologies.`,
  updated,
  intro: `This Cookie Policy explains how ${company} uses cookies and similar technologies on the AuGENT.ai website, and how you can control them. It should be read together with our Privacy Policy.`,
  summary: [
    "AuGENT.ai uses cookies and similar technologies to make the site work, remember preferences and understand usage.",
    "Strictly necessary cookies are always on; analytics, preference and marketing cookies are optional where the law requires consent.",
    "Some cookies come from third-party services such as analytics providers or embedded media.",
    "You can block or delete cookies in your browser settings; blocking all of them may affect parts of the site.",
  ],
  faqs: [
    { q: "What cookies does AuGENT.ai use?", a: "Strictly necessary cookies, preference cookies, analytics and performance cookies, and, where enabled, marketing cookies." },
    { q: "Can I turn cookies off?", a: "Yes. Use your browser settings to block or delete cookies, or the consent option where one is offered. Strictly necessary cookies cannot be switched off in our systems, and blocking all cookies may affect how the site works." },
    { q: "Do third parties set cookies on AuGENT.ai?", a: "Some cookies are set by third-party services such as analytics providers, embedded media or social networks. They have their own privacy and cookie policies." },
    { q: "How long do cookies last?", a: "Session cookies are deleted when you close your browser. Persistent cookies stay for a set period or until you delete them." },
  ],
  sections: [
    {
      heading: "What are cookies?",
      paragraphs: [
        "Cookies are small text files stored on your device when you visit a website. They help the site work, remember your preferences and provide information to site owners. Similar technologies include local storage, pixels and tags, and we refer to all of them as cookies here.",
      ],
    },
    {
      heading: "Types of cookies we use",
      list: [
        "Strictly necessary: required for the site to function, for example to keep the page secure and load correctly. These cannot be switched off in our systems.",
        "Preferences: remember choices such as display settings so the experience stays consistent.",
        "Analytics and performance: help us understand how visitors use the site, which pages are popular and where problems occur. Data is used in aggregate to improve the site.",
        "Marketing: where enabled, help us measure campaigns and show relevant content. We only set these with your consent where the law requires it.",
      ],
    },
    {
      heading: "Third-party cookies",
      paragraphs: [
        "Some cookies are set by third-party services we use, such as analytics providers, embedded media or social networks. These providers have their own privacy and cookie policies, which we encourage you to review.",
      ],
    },
    {
      heading: "How long cookies last",
      paragraphs: [
        "Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them.",
      ],
    },
    {
      heading: "Managing your preferences",
      paragraphs: [
        "You can accept or reject non-essential cookies where a consent option is offered, and you can control cookies through your browser settings, including deleting existing cookies and blocking new ones. Blocking all cookies may affect how parts of the site work. You can also opt out of analytics tracking using tools offered by the relevant providers.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: ["We may update this Cookie Policy as our use of cookies changes. The date at the top shows the latest revision."],
    },
    {
      heading: "Contact us",
      paragraphs: [`If you have questions about our use of cookies, contact ${company} ${contact}.`],
    },
  ],
};

export const legalDocs = [privacyPolicy, termsOfService, cookiePolicy];
