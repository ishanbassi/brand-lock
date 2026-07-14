// Reusable data model for informational "guide" colony pages.
// One flexible shape drives multiple low-competition content clusters
// (trademark status meanings, "trademark for X" use-cases, etc.).
// Each cluster is registered as a GuideSource with its own URL prefix + hub.

export interface GuideHighlight {
  label: string;
  value: string;
  icon: string;
}

export interface GuideSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface GuideRelatedLink {
  title: string;
  route: string;
  icon: string;
  desc: string;
}

export interface GuidePage {
  slug: string;
  /** H1 / display title */
  title: string;
  /** Grouping label used by the hub page */
  category: string;
  metaTitle: string;
  metaDesc: string;
  /** 40-60 word AI-Overview-optimised answer shown in the hero box */
  quickAnswer: string;
  /** Scannable fact strip (action required, timeline, next stage, etc.) */
  highlights: GuideHighlight[];
  intro: string;
  sections: GuideSection[];
  verdict?: string;
  faqs: { question: string; answer: string }[];
  /** Colony internal links — the lever you re-point to rank money pages */
  relatedLinks: GuideRelatedLink[];
  ctaHeading: string;
  ctaText: string;
  leadComment: string;
}

/** Per-cluster configuration: URL prefix, hub metadata, and the dataset. */
export interface GuideSourceConfig {
  key: string;
  urlPrefix: string;      // e.g. '/trademark-status'
  breadcrumbLabel: string; // e.g. 'Trademark Status'
  hubMetaTitle: string;
  hubMetaDesc: string;
  hubH1: string;
  hubIntro: string;
  ctaWhatsappText: string;
  data: Record<string, GuidePage>;
}
