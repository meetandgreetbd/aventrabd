/**
 * The copy for every page. Edit the text here; the admin only manages SEO for pages.
 */
export const pageDefaults = {
  home: {
    eyebrow: "A Multi-Discipline Holding Company",
    titleLead: "Building a Smarter, Stronger",
    titleAccent: "Tomorrow",
    text: "Driven by people. Powered by innovation. Committed to sustainable growth.",
    primaryCta: "Explore Our Journey",
    secondaryCta: "Watch Our Story",
    secondaryCtaUrl: "/about",
    values: ["Innovation Driven", "People Focused", "Growth Oriented", "Lasting Impact"],
    sectionTitle: "Together, we create a better tomorrow.",
    sectionText: "At Aventra, we believe in the power of people, technology and purpose.",
    sectionCta: "Learn More",
  },
  about: {
    eyebrow: "About Aventra",
    title: "A New Perspective on Progress",
    text: "Aventra is a forward-thinking holding company built on a foundation of trust, innovation, and operational excellence. We bring together expertise, people, and technology to deliver long-term value across diverse industries.",
    cta: "Our Story",
    stats: [
      { value: "10+", label: "Business Initiatives" },
      { value: "1000+", label: "Talented Professionals" },
      { value: "1 Vision", label: "A Stronger Tomorrow" },
    ],
    missionTitle: "Our Mission",
    missionText: "To create opportunities, drive progress, and build a better tomorrow.",
    missionCta: "Our Culture",
  },
  culture: {
    eyebrow: "Our Culture",
    title: "People. Purpose. Possibilities.",
    text: "At Aventra, our culture is built on collaboration, inclusion and continuous learning. We empower our people to think bigger, grow faster, and make a meaningful impact.",
    cta: "Life at Aventra",
    cards: ["Collaborative Workspace", "Continuous Learning", "Career Growth", "Wellbeing First"],
    sectionTitle: "A Place to Belong",
    sectionText: "A supportive and inclusive environment where everyone can thrive.",
    sectionCta: "Our People",
  },
  careers: {
    eyebrow: "Careers",
    title: "Your Next Chapter Starts Here",
    text: "Join a team that values innovation, collaboration, and growth. At Aventra, you'll find opportunities to build a rewarding career and make an impact.",
    cta: "Explore Open Positions",
    whyTitle: "Why Work at Aventra?",
    cards: [
      "Accelerate Your Growth",
      "Be Part of a Winning Team",
      "Make a Real Impact",
      "Enjoy Work-Life Balance",
    ],
    jobsTitle: "Open Positions",
    jobsEmpty: "There are no open positions right now. Please check back soon.",
    bannerText: "Let's Build What's Next Together.",
  },
  life: {
    eyebrow: "Life at Aventra",
    title: "More Than a Workplace",
    text: "At Aventra, life is about balance — between ambition and well-being, growth and belonging, purpose and performance.",
    cta: "Explore Life at Aventra",
    cards: ["Team Events", "Wellness Programs", "Community Impact"],
  },
  learning: {
    eyebrow: "Learning & Development",
    title: "Learn. Grow. Lead.",
    text: "At Aventra, we invest in your growth. From world-class training programs to mentorship opportunities, we're committed to helping you build the skills for a successful future.",
    cta: "Explore Learning Programs",
    listTitle: "Invest in Your Growth",
    list: [
      "Skill Development Programs",
      "Leadership Training",
      "Mentorship Opportunities",
      "Knowledge Sharing Sessions",
    ],
    bannerText: "Your Growth. Our Commitment.",
  },
  leadership: {
    eyebrow: "Our Leadership",
    title: "Vision That Moves Us Forward",
    text: "Our leadership team brings together industry expertise, strategic thinking, and a shared commitment to excellence.",
    cta: "Meet Our Leaders",
    bannerText: "Building a Stronger Tomorrow — Together",
  },
  contact: {
    eyebrow: "Contact Us",
    title: "Let's Connect",
    text: "Have a question? Want to learn more? We'd love to hear from you.",
    formButton: "Send Message",
  },
};

export type PageSlug = keyof typeof pageDefaults;
export type PageContent<S extends PageSlug> = (typeof pageDefaults)[S];

export const pageInfo: Record<PageSlug, { name: string; path: string; description: string }> = {
  home: {
    name: "Home",
    path: "/",
    description:
      "Aventra is a multi-discipline holding company driven by people, powered by innovation and committed to sustainable growth.",
  },
  about: {
    name: "About",
    path: "/about",
    description:
      "A forward-thinking holding company built on trust, innovation and operational excellence.",
  },
  culture: {
    name: "Culture",
    path: "/culture",
    description: "A culture built on collaboration, inclusion and continuous learning.",
  },
  careers: {
    name: "Careers",
    path: "/careers",
    description: "Explore open positions and build a rewarding career at Aventra.",
  },
  life: {
    name: "Life at Aventra",
    path: "/life",
    description: "Balance between ambition and well-being, growth and belonging.",
  },
  learning: {
    name: "Learning & Development",
    path: "/learning",
    description: "Training programs and mentorship to help you learn, grow and lead.",
  },
  leadership: {
    name: "Leadership",
    path: "/leadership",
    description: "Meet the leadership team that moves Aventra forward.",
  },
  contact: {
    name: "Contact",
    path: "/contact",
    description: "Get in touch with Aventra.",
  },
};

export const pageSlugs = Object.keys(pageDefaults) as PageSlug[];

export function isPageSlug(value: string): value is PageSlug {
  return Object.prototype.hasOwnProperty.call(pageDefaults, value);
}

export const settingsDefaults = {
  siteName: "Aventra",
  tagline: "Building a Smarter, Stronger Tomorrow",
  phone: "+880 1234 567890",
  email: "info@aventra.com",
  address: "Dhaka, Bangladesh",
  linkedin: "",
  facebook: "",
  youtube: "",
  x: "",
  notifyEmail: "",
  shareImage: "",
  siteNoindex: false,
};

export type SiteSettings = typeof settingsDefaults;

/** Keeps only keys that exist in the defaults and whose stored type still matches. */
export function mergeWithDefaults<T extends Record<string, unknown>>(defaults: T, stored: unknown): T {
  const result: Record<string, unknown> = { ...defaults };
  // MariaDB (common on cPanel) stores JSON columns as text and returns them unparsed.
  if (typeof stored === "string") {
    try {
      stored = JSON.parse(stored);
    } catch {
      return result as T;
    }
  }
  if (!stored || typeof stored !== "object") return result as T;
  const source = stored as Record<string, unknown>;
  for (const key of Object.keys(defaults)) {
    const fallback = defaults[key];
    const value = source[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(fallback)) {
      if (Array.isArray(value)) result[key] = value;
    } else if (typeof value === typeof fallback) {
      result[key] = value;
    }
  }
  return result as T;
}

