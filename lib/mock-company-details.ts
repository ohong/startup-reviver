import * as fs from "fs";
import * as path from "path";
import { mockStartups, type Startup } from "./mock-data";
import { slugifyName } from "./utils";
import { type YCStartup } from "./meilisearch";

const REPORTS_DIR = path.join(process.cwd(), "reports");
const REPORT_SUFFIX = ".md";

const reportCache = new Map<string, CompanyDetails>();

export interface CompanySection {
  id: string;
  title: string;
  body: string[];
}

export interface CompanyFact {
  label: string;
  value: string;
}

export interface CompanyAuthor {
  name: string;
  role: string;
  url?: string;
}

export interface CompanyDetails {
  startup: Startup;
  tags: string[];
  overview: string;
  updatedAt: string;
  readingTime: string;
  sections: CompanySection[];
  facts: CompanyFact[];
  careersUrl?: string;
  authors: CompanyAuthor[];
}

const defaultSectionOrder: CompanySection[] = [
  {
    id: "why-failed",
    title: "Why The Business Failed",
    body: [
      "Our research synthesis is still inflight. For now, assume the original operation struggled with unit economics, retention, and operational complexity that modern tooling can improve.",
      "Use this section to ground the resurrection strategy with specific evidence from the research agent once the pipeline is wired up.",
    ],
  },
  {
    id: "thesis",
    title: "Thesis",
    body: [
      "Summarize the enduring customer problem and why the company set out to solve it. Include data points, market signals, and the core promise that resonated with early adopters.",
    ],
  },
  {
    id: "founding-story",
    title: "Founding Story",
    body: [
      "Capture the founders, origin moment, and earliest pivots. Highlight the insight they believed gave them an edge.",
    ],
  },
  {
    id: "product",
    title: "Product",
    body: [
      "Describe the user journey, key features, and how the service delivered value. Call out UX friction that emerged over time.",
    ],
  },
  {
    id: "market",
    title: "Market",
    body: [
      "Outline the target segments, market size, and demand drivers. Note competitive dynamics or macro shifts that influenced adoption.",
    ],
  },
  {
    id: "competition",
    title: "Competition",
    body: [
      "List primary competitors and differentiators. Share where the original team struggled to stand out.",
    ],
  },
  {
    id: "business-model",
    title: "Business Model",
    body: [
      "Capture pricing, unit economics, and growth levers. Flag structural issues (e.g., CAC vs. LTV, supply constraints) uncovered in research.",
    ],
  },
  {
    id: "traction",
    title: "Traction",
    body: [
      "Provide funding history, customer milestones, and notable learnings during the company lifecycle.",
    ],
  },
  {
    id: "rebuild-opportunity",
    title: "The Rebuild Opportunity",
    body: [
      "Explain why 2025 is different. Connect modern AI capabilities to each historic failure mode and outline the resurrection approach.",
    ],
  },
  {
    id: "recommended-mvp",
    title: "Recommended MVP",
    body: [
      "Define the initial target customer, the minimum feature set, and the success metrics that prove the resurrection is working.",
    ],
  },
];

const defaultFacts: CompanyFact[] = [
  { label: "Founded", value: "2011" },
  { label: "HQ", value: "San Francisco, CA" },
  { label: "Team Size (peak)", value: "~250" },
  { label: "Funding", value: "$25M" },
  { label: "Status", value: "Defunct" },
];

const defaultAuthors: CompanyAuthor[] = [
  { name: "Research Agent", role: "Deep Research" },
  { name: "Strategy Agent", role: "2025 Strategy" },
];

function buildDetails(startup: Startup): CompanyDetails {
  return {
    startup,
    tags: ["Legacy YC", "Needs Resurrection"],
    overview:
      "This memo is a placeholder while the automated pipeline assembles a full resurrection dossier. It outlines the structure where research, strategy, and architect agents will write their findings.",
    updatedAt: "Oct 31, 2025",
    readingTime: "12 min",
    sections: defaultSectionOrder.map((section) => ({
      ...section,
      body: [...section.body],
    })),
    facts: defaultFacts.map((fact) => ({ ...fact })),
    careersUrl: startup.website,
    authors: defaultAuthors.map((author) => ({ ...author })),
  };
}

function stripQuotes(value?: string) {
  if (!value) return undefined;
  return value
    .replace(/\uFFFC/g, "")
    .replace(/[“”]/g, "\"")
    .replace(/^"/, "")
    .replace(/"$/, "")
    .trim();
}

function normalizeParagraph(text: string) {
  return text
    .replace(/\uFFFC/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseMetadataBlock(block: string) {
  const metadata = new Map<string, string>();
  block
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        metadata.set(match[1].trim().toLowerCase(), stripQuotes(match[2].trim()) ?? "");
      }
    });
  return metadata;
}

function parseReportSection(block: string): CompanySection | null {
  const trimmed = block.trim();
  if (!trimmed) {
    return null;
  }

  const lines = trimmed.split(/\n/);
  while (lines.length > 0 && !lines[0].trim()) {
    lines.shift();
  }

  if (lines.length === 0) {
    return null;
  }

  const rawTitle = lines.shift()?.trim();
  if (!rawTitle) {
    return null;
  }

  const bodyRaw = lines.join("\n").trim();
  const paragraphs = bodyRaw
    ? bodyRaw
        .split(/\n\s*\n/)
        .map((paragraph) => normalizeParagraph(paragraph))
        .filter(Boolean)
    : [];

  const id = slugifyName(rawTitle) || slugifyName(rawTitle.replace(/[^a-z0-9]+/gi, "-"));

  return {
    id,
    title: rawTitle,
    body: paragraphs.length > 0 ? paragraphs : [""],
  };
}

function deriveStatus(statusLine?: string, fallback: Startup["status"] = "Inactive"): Startup["status"] {
  if (!statusLine) {
    return fallback;
  }

  const normalized = statusLine.toLowerCase();
  if (/(inactive|shut\s?down|wound|moved on|defunct|closed)/.test(normalized)) {
    return "Inactive";
  }
  if (/acquired/.test(normalized)) {
    return "Acquired";
  }
  return "Active";
}

function deriveLaunchTimestamp(batch?: string, fallback?: number) {
  if (batch) {
    const match = batch.match(/(20\d{2})/);
    if (match) {
      const year = Number(match[1]);
      if (!Number.isNaN(year)) {
        return Math.floor(new Date(year, 0, 1).getTime() / 1000);
      }
    }
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return Math.floor(Date.now() / 1000);
}

function estimateReadingTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function findReportPath(slug: string): string | undefined {
  try {
    const direct = path.join(REPORTS_DIR, `${slug}${REPORT_SUFFIX}`);
    if (fs.existsSync(direct)) {
      return direct;
    }

    if (!fs.existsSync(REPORTS_DIR)) {
      return undefined;
    }

    const files = fs.readdirSync(REPORTS_DIR);
    const match = files.find((file) => {
      if (!file.toLowerCase().endsWith(REPORT_SUFFIX)) {
        return false;
      }
      const base = file.slice(0, -REPORT_SUFFIX.length);
      return slugifyName(base) === slug;
    });

    return match ? path.join(REPORTS_DIR, match) : undefined;
  } catch {
    return undefined;
  }
}

function parseReportMarkdown(filePath: string): CompanyDetails {
  const raw = fs.readFileSync(filePath, "utf8");
  const sanitized = raw.replace(/\r\n/g, "\n").replace(/\uFFFC/g, "");
  const blocks = sanitized
    .split(/\n?\s*⸻\s*\n?/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const metaBlock = blocks.shift() ?? "";
  const metadata = parseMetadataBlock(metaBlock);

  const name = metadata.get("startup") ?? "";
  const slugFromFile = slugifyName(path.basename(filePath, path.extname(filePath)).replace(/-report$/i, ""));
  const slug = slugifyName(name) || slugFromFile;

  const baseStartup = mockStartups.find(
    (startup) => slugifyName(startup.slug) === slug || slugifyName(startup.name) === slug
  );

  const batch = metadata.get("batch") || baseStartup?.batch || "Unknown";
  const oneLiner = metadata.get("one-liner") || baseStartup?.one_liner || "";
  const statusLine = metadata.get("status (evidence-based)") || metadata.get("status");
  const status = deriveStatus(statusLine, baseStartup?.status ?? "Inactive");

  const startup: Startup = {
    slug: baseStartup?.slug ?? slug,
    name: name || baseStartup?.name || slug,
    small_logo_thumb_url:
      baseStartup?.small_logo_thumb_url ??
      `https://www.ycombinator.com/companies/${slug}/card_image`,
    one_liner: oneLiner,
    batch,
    launched_at: deriveLaunchTimestamp(batch, baseStartup?.launched_at),
    website:
      metadata.get("website") ||
      baseStartup?.website ||
      `https://www.ycombinator.com/companies/${slug}`,
    status,
  };

  const sections = blocks
    .map((block) => parseReportSection(block))
    .filter((section): section is CompanySection => section !== null);

  const summaryParagraph = sections
    .find((section) => section.title.toLowerCase().startsWith("why"))
    ?.body.find((paragraph) => /^summary:/i.test(paragraph));

  const overview = summaryParagraph
    ? summaryParagraph.replace(/^summary:\s*/i, "").trim()
    : oneLiner || sections[0]?.body[0] || "Research report in progress.";

  const facts: CompanyFact[] = [];
  if (batch) {
    facts.push({ label: "Batch", value: batch });
  }
  const founder = metadata.get("founder");
  if (founder) {
    facts.push({ label: "Founder", value: founder });
  }
  if (statusLine) {
    facts.push({ label: "Status", value: statusLine });
  }

  const rawTags = metadata.get("tags");
  const tagList: string[] = [];
  if (batch) {
    tagList.push(batch);
  }
  const category = metadata.get("category");
  if (category) {
    tagList.push(category);
  }
  if (rawTags) {
    rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tagList.push(tag));
  }

  const tags = Array.from(new Set(tagList));

  const updatedAt = (() => {
    try {
      const stats = fs.statSync(filePath);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(stats.mtime);
    } catch {
      return "Oct 31, 2025";
    }
  })();

  const readingTime = estimateReadingTime(sanitized);

  return {
    startup,
    tags,
    overview,
    updatedAt,
    readingTime,
    sections: sections.length > 0 ? sections : defaultSectionOrder,
    facts: facts.length > 0 ? facts : defaultFacts,
    careersUrl: startup.website,
    authors: defaultAuthors.map((author) => ({ ...author })),
  };
}

function loadReportDetails(slug: string): CompanyDetails | undefined {
  const normalized = slugifyName(slug);
  if (!normalized) {
    return undefined;
  }

  if (reportCache.has(normalized)) {
    return reportCache.get(normalized);
  }

  const reportPath = findReportPath(normalized);
  if (!reportPath) {
    return undefined;
  }

  const details = parseReportMarkdown(reportPath);
  reportCache.set(normalized, details);
  return details;
}

const detailIndex: Record<string, CompanyDetails> = mockStartups.reduce(
  (acc, startup) => {
    const details = buildDetails(startup);
    acc[startup.slug] = details;
    acc[slugifyName(startup.name)] = details;
    return acc;
  },
  {} as Record<string, CompanyDetails>
);

/**
 * Convert YCStartup from Meilisearch to Startup type
 */
function convertYCStartupToStartup(ycStartup: YCStartup): Startup {
  return {
    slug: ycStartup.slug || slugifyName(ycStartup.name || ""),
    name: ycStartup.name || "",
    small_logo_thumb_url: ycStartup.small_logo_thumb_url || `https://www.ycombinator.com/companies/${ycStartup.slug}/card_image`,
    one_liner: ycStartup.one_liner || "",
    batch: ycStartup.batch || "Unknown",
    launched_at: ycStartup.launched_at || Math.floor(Date.now() / 1000),
    website: ycStartup.website || `https://www.ycombinator.com/companies/${ycStartup.slug}`,
    status: ycStartup.status || "Active",
  };
}

export async function getCompanyDetails(slug: string): Promise<CompanyDetails | undefined> {
  const normalized = slugifyName(slug);
  
  // Try to fetch startup data from Meilisearch first (server-side)
  let ycStartup: YCStartup | null = null;
  if (typeof window === 'undefined') {
    // Server-side: Use direct Meilisearch import
    try {
      const { getStartupBySlug } = await import('./meilisearch');
      ycStartup = await getStartupBySlug(normalized);
    } catch (error) {
      console.error("Error fetching startup from Meilisearch:", error);
    }
  }
  
  // Convert to Startup format if we got data from Meilisearch
  const startupFromDb = ycStartup ? convertYCStartupToStartup(ycStartup) : undefined;
  
  // Try to load from report markdown
  const reportPath = findReportPath(normalized);
  if (reportPath) {
    const raw = fs.readFileSync(reportPath, "utf8");
    const sanitized = raw.replace(/\r\n/g, "\n").replace(/\uFFFC/g, "");
    const blocks = sanitized
      .split(/\n?\s*⸻\s*\n?/g)
      .map((block) => block.trim())
      .filter(Boolean);

    const metaBlock = blocks.shift() ?? "";
    const metadata = parseMetadataBlock(metaBlock);

    const name = metadata.get("startup") ?? "";
    const slugFromFile = slugifyName(path.basename(reportPath, path.extname(reportPath)).replace(/-report$/i, ""));
    const reportSlug = slugifyName(name) || slugFromFile;

    // Use startup from DB if available, otherwise fall back to mock data
    const baseStartup = startupFromDb ?? mockStartups.find(
      (startup) => slugifyName(startup.slug) === reportSlug || slugifyName(startup.name) === reportSlug
    );

    const batch = metadata.get("batch") || baseStartup?.batch || "Unknown";
    const oneLiner = metadata.get("one-liner") || baseStartup?.one_liner || "";
    const statusLine = metadata.get("status (evidence-based)") || metadata.get("status");
    const status = deriveStatus(statusLine, baseStartup?.status ?? "Inactive");

    const startup: Startup = {
      slug: baseStartup?.slug ?? reportSlug,
      name: name || baseStartup?.name || reportSlug,
      small_logo_thumb_url:
        baseStartup?.small_logo_thumb_url ??
        `https://www.ycombinator.com/companies/${reportSlug}/card_image`,
      one_liner: oneLiner,
      batch,
      launched_at: deriveLaunchTimestamp(batch, baseStartup?.launched_at),
      website:
        metadata.get("website") ||
        baseStartup?.website ||
        `https://www.ycombinator.com/companies/${reportSlug}`,
      status,
    };

    const sections = blocks
      .map((block) => parseReportSection(block))
      .filter((section): section is CompanySection => section !== null);

    const summaryParagraph = sections
      .find((section) => section.title.toLowerCase().startsWith("why"))
      ?.body.find((paragraph) => /^summary:/i.test(paragraph));

    const overview = summaryParagraph
      ? summaryParagraph.replace(/^summary:\s*/i, "").trim()
      : oneLiner || sections[0]?.body[0] || "Research report in progress.";

    const facts: CompanyFact[] = [];
    if (batch) {
      facts.push({ label: "Batch", value: batch });
    }
    const founder = metadata.get("founder");
    if (founder) {
      facts.push({ label: "Founder", value: founder });
    }
    if (statusLine) {
      facts.push({ label: "Status", value: statusLine });
    }

    const rawTags = metadata.get("tags");
    const tagList: string[] = [];
    if (batch) {
      tagList.push(batch);
    }
    const category = metadata.get("category");
    if (category) {
      tagList.push(category);
    }
    if (rawTags) {
      rawTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => tagList.push(tag));
    }

    const tags = Array.from(new Set(tagList));

    const updatedAt = (() => {
      try {
        const stats = fs.statSync(reportPath);
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(stats.mtime);
      } catch {
        return "Oct 31, 2025";
      }
    })();

    const readingTime = estimateReadingTime(sanitized);

    const reportDetails: CompanyDetails = {
      startup,
      tags,
      overview,
      updatedAt,
      readingTime,
      sections: sections.length > 0 ? sections : defaultSectionOrder,
      facts: facts.length > 0 ? facts : defaultFacts,
      careersUrl: startup.website,
      authors: defaultAuthors.map((author) => ({ ...author })),
    };
    
    // Cache the result
    detailIndex[normalized] = reportDetails;
    detailIndex[reportDetails.startup.slug] = reportDetails;
    detailIndex[slugifyName(reportDetails.startup.slug)] = reportDetails;
    
    return reportDetails;
  }

  // Check in-memory cache
  if (detailIndex[normalized] || detailIndex[slug]) {
    return detailIndex[normalized] ?? detailIndex[slug];
  }

  // Try to fetch from API (only on client side)
  // On server side, we skip this since relative URLs don't work with fetch
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch(`/api/startups/${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.startup) {
          const startup = convertYCStartupToStartup(data.startup);
          const details = buildDetails(startup);
          
          // Cache the result
          detailIndex[normalized] = details;
          detailIndex[startup.slug] = details;
          detailIndex[slugifyName(startup.name)] = details;
          
          return details;
        }
      }
    } catch (error) {
      console.error("Error fetching startup from API:", error);
    }
  }
  
  // If we have startup from DB but no report, return undefined to show EmptyCompanyPage
  // (Don't build default details with placeholder text)

  return undefined;
}

export const companySectionOrder = defaultSectionOrder.map((section) => ({
  id: section.id,
  title: section.title,
}));
