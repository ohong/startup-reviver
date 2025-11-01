import { slugifyName } from "./utils";
import type { CompanySection, CompanyFact, CompanyDetails } from "./mock-company-details";
import type { Startup } from "./mock-data";

interface ParsedMetadata {
  startup?: string;
  batch?: string;
  oneLiner?: string;
  website?: string;
  status?: string;
  founder?: string;
  category?: string;
  tags?: string;
}

function stripQuotes(value?: string) {
  if (!value) return undefined;
  return value
    .replace(/\uFFFC/g, "")
    .replace(/[""]/g, '"')
    .replace(/^"/, "")
    .replace(/"$/, "")
    .trim();
}

function parseMetadataFromMarkdown(markdown: string): ParsedMetadata {
  const metadata: ParsedMetadata = {};
  
  // Look for metadata at the start of the document (before the first section)
  const lines = markdown.split('\n');
  let inMetadata = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Stop at first heading
    if (trimmed.startsWith('#')) {
      break;
    }
    
    // Parse key: value pairs
    const match = trimmed.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = stripQuotes(match[2].trim());
      
      if (key === 'startup') metadata.startup = value;
      else if (key === 'batch') metadata.batch = value;
      else if (key === 'one-liner') metadata.oneLiner = value;
      else if (key === 'website') metadata.website = value;
      else if (key === 'status' || key === 'status (evidence-based)') metadata.status = value;
      else if (key === 'founder') metadata.founder = value;
      else if (key === 'category') metadata.category = value;
      else if (key === 'tags') metadata.tags = value;
    }
  }
  
  return metadata;
}

function parseSectionsFromMarkdown(markdown: string): CompanySection[] {
  const sections: CompanySection[] = [];
  
  // Try splitting by h2 headers (##)
  let sectionBlocks = markdown.split(/\n##\s+/);
  
  // If no h2 headers found, try splitting by double newlines (plain text format)
  if (sectionBlocks.length === 1) {
    // Plain text format - split by blank lines and treat short lines as headers
    const blocks = markdown.split(/\n\s*\n+/);
    let currentSection: { title: string; body: string[] } | null = null;
    
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;
      
      // If it's a short line (< 100 chars) and looks like a title, treat as section header
      const lines = trimmed.split('\n');
      const firstLine = lines[0].trim();
      
      if (firstLine.length < 100 && lines.length === 1 && !firstLine.match(/[.!?]$/)) {
        // This looks like a section header
        if (currentSection) {
          sections.push({
            id: slugifyName(currentSection.title),
            title: currentSection.title,
            body: currentSection.body,
          });
        }
        currentSection = { title: firstLine, body: [] };
      } else {
        // This is body content
        if (currentSection) {
          const cleaned = trimmed
            .replace(/^#+\s+/, '')
            .replace(/\n#+\s+/g, '\n')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/\*\*([^\*]+)\*\*/g, '$1')
            .replace(/\*([^\*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/￼/g, ''); // Remove object replacement characters
          
          if (cleaned) {
            currentSection.body.push(cleaned);
          }
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection && currentSection.body.length > 0) {
      sections.push({
        id: slugifyName(currentSection.title),
        title: currentSection.title,
        body: currentSection.body,
      });
    }
    
    return sections;
  }
  
  // Standard markdown with ## headers
  const startIndex = sectionBlocks[0].includes('#') ? 0 : 1;
  
  for (let i = startIndex; i < sectionBlocks.length; i++) {
    const section = sectionBlocks[i].trim();
    if (!section) continue;
    
    const lines = section.split('\n');
    const title = lines[0].trim();
    const bodyText = lines.slice(1).join('\n').trim();
    
    // Split into paragraphs
    const paragraphs = bodyText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        // Clean up markdown formatting for display
        return p
          .replace(/^#+\s+/, '') // Remove h1, h3, h4, etc. headers at start of line
          .replace(/\n#+\s+/g, '\n') // Remove headers within paragraph
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
          .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
          .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
          .replace(/`([^`]+)`/g, '$1') // Remove inline code
          .replace(/\n/g, ' ') // Join lines within paragraph
          .replace(/\s{2,}/g, ' ') // Normalize spaces
          .replace(/￼/g, ''); // Remove object replacement characters
      });
    
    sections.push({
      id: slugifyName(title),
      title,
      body: paragraphs.length > 0 ? paragraphs : [''],
    });
  }
  
  return sections;
}

function deriveStatus(statusLine?: string): Startup["status"] {
  if (!statusLine) return "Inactive";
  
  const normalized = statusLine.toLowerCase();
  if (/(inactive|shut\s?down|wound|moved on|defunct|closed)/.test(normalized)) {
    return "Inactive";
  }
  if (/acquired/.test(normalized)) {
    return "Acquired";
  }
  return "Active";
}

function estimateReadingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export function parseMarkdownToCompanyDetails(
  markdown: string,
  slug: string,
  existingStartup?: Startup
): CompanyDetails {
  const metadata = parseMetadataFromMarkdown(markdown);
  const sections = parseSectionsFromMarkdown(markdown);
  
  // Build startup object
  const startupName = metadata.startup || existingStartup?.name || slug;
  const batch = metadata.batch || existingStartup?.batch || "Unknown";
  const status = deriveStatus(metadata.status);
  
  const startup: Startup = {
    slug: existingStartup?.slug ?? slugifyName(startupName),
    name: startupName,
    small_logo_thumb_url: existingStartup?.small_logo_thumb_url || "",
    one_liner: metadata.oneLiner || existingStartup?.one_liner || "",
    batch,
    launched_at: existingStartup?.launched_at ?? Math.floor(Date.now() / 1000),
    website:
      metadata.website ||
      existingStartup?.website ||
      `https://www.ycombinator.com/companies/${slug}`,
    status,
  };
  
  // Extract overview from first section or metadata
  const firstSection = sections[0];
  const overview =
    metadata.oneLiner ||
    (firstSection?.body[0] ? firstSection.body[0].slice(0, 200) + '...' : '') ||
    "Research report available.";
  
  // Build facts
  const facts: CompanyFact[] = [];
  if (batch) {
    facts.push({ label: "Batch", value: batch });
  }
  if (metadata.founder) {
    facts.push({ label: "Founder", value: metadata.founder });
  }
  if (metadata.status) {
    facts.push({ label: "Status", value: metadata.status });
  }
  
  // Build tags
  const tagList: string[] = [];
  if (batch) tagList.push(batch);
  if (metadata.category) tagList.push(metadata.category);
  if (metadata.tags) {
    metadata.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(t => tagList.push(t));
  }
  
  const tags = Array.from(new Set(tagList));
  
  return {
    startup,
    tags: tags.length > 0 ? tags : ["Legacy YC", "Needs Resurrection"],
    overview,
    updatedAt: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    readingTime: estimateReadingTime(markdown),
    sections,
    facts: facts.length > 0 ? facts : [
      { label: "Batch", value: batch },
      { label: "Status", value: "Defunct" },
    ],
    careersUrl: startup.website,
    authors: [
      { name: "Research Agent", role: "Deep Research" },
      { name: "Strategy Agent", role: "2025 Strategy" },
    ],
  };
}

