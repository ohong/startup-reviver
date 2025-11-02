import { MeiliSearch } from "meilisearch";

// Initialize Meilisearch client (server-side only)
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY || "",
});

const INDEX_NAME = process.env.MEILISEARCH_INDEX || "yc-all";

export interface YCStartup {
  id?: string;
  slug?: string;
  name?: string;
  small_logo_thumb_url?: string;
  one_liner?: string;
  batch?: string;
  launched_at?: number;
  website?: string;
  status?: "Active" | "Acquired" | "Inactive";
  [key: string]: unknown;
}

/**
 * Search for startups in the Meilisearch index
 * Multi-pass strategy prioritizing: Inactive + Logo > Inactive + No Logo > Active + Logo > Active + No Logo
 */
export async function searchStartups(query: string, limit = 100): Promise<YCStartup[]> {
  try {
    const index = client.index(INDEX_NAME);
    const attributesToRetrieve = [
      "id",
      "slug",
      "name",
      "small_logo_thumb_url",
      "one_liner",
      "batch",
      "launched_at",
      "website",
      "status",
    ];
    
    const results: YCStartup[] = [];
    
    // Pass 1: Inactive + With Logo
    if (results.length < limit) {
      const pass1 = await index.search<YCStartup>(query, {
        limit: limit - results.length,
        attributesToRetrieve,
        filter: 'status = "Inactive" AND small_logo_thumb_url != "/company/thumb/missing.png"',
      });
      results.push(...(pass1.hits || []));
    }
    
    // Pass 2: Inactive + Without Logo
    if (results.length < limit) {
      const pass2 = await index.search<YCStartup>(query, {
        limit: limit - results.length,
        attributesToRetrieve,
        filter: 'status = "Inactive" AND small_logo_thumb_url = "/company/thumb/missing.png"',
      });
      results.push(...(pass2.hits || []));
    }
    
    // Pass 3: Non-Inactive + With Logo
    if (results.length < limit) {
      const pass3 = await index.search<YCStartup>(query, {
        limit: limit - results.length,
        attributesToRetrieve,
        filter: 'status != "Inactive" AND small_logo_thumb_url != "/company/thumb/missing.png"',
      });
      results.push(...(pass3.hits || []));
    }
    
    // Pass 4: Non-Inactive + Without Logo
    if (results.length < limit) {
      const pass4 = await index.search<YCStartup>(query, {
        limit: limit - results.length,
        attributesToRetrieve,
        filter: 'status != "Inactive" AND small_logo_thumb_url = "/company/thumb/missing.png"',
      });
      results.push(...(pass4.hits || []));
    }
    
    return results;
  } catch (error) {
    console.error("Error searching startups:", error);
    return [];
  }
}

/**
 * Get all startups from the Meilisearch index
 */
export async function getAllStartups(limit = 1000, offset = 0): Promise<YCStartup[]> {
  try {
    const index = client.index(INDEX_NAME);
    const documents = await index.getDocuments<YCStartup>({
      limit,
      offset,
      fields: [
        "id",
        "slug",
        "name",
        "small_logo_thumb_url",
        "one_liner",
        "batch",
        "launched_at",
        "website",
        "status",
      ],
    });
    
    return documents.results || [];
  } catch (error) {
    console.error("Error fetching all startups:", error);
    return [];
  }
}

/**
 * Get a single startup by slug or id
 */
export async function getStartupBySlug(slug: string): Promise<YCStartup | null> {
  try {
    const index = client.index(INDEX_NAME);
    
    // First try searching by slug
    const searchResults = await index.search<YCStartup>(slug, {
      limit: 1,
      filter: `slug = "${slug}"`,
    });
    
    if (searchResults.hits && searchResults.hits.length > 0) {
      return searchResults.hits[0];
    }
    
    // If not found by slug, try by name
    const nameResults = await index.search<YCStartup>(slug, {
      limit: 1,
      attributesToSearchOn: ["name", "slug"],
    });
    
    if (nameResults.hits && nameResults.hits.length > 0) {
      return nameResults.hits[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching startup by slug:", error);
    return null;
  }
}

/**
 * Get a document by its ID
 */
export async function getStartupById(id: string): Promise<YCStartup | null> {
  try {
    const index = client.index(INDEX_NAME);
    const document = await index.getDocument<YCStartup>(id);
    return document;
  } catch (error) {
    console.error("Error fetching startup by ID:", error);
    return null;
  }
}

export { client };

