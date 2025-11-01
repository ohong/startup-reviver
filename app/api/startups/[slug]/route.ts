import { NextRequest, NextResponse } from "next/server";
import { getStartupBySlug } from "@/lib/meilisearch";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const startup = await getStartupBySlug(slug);

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error("Error in startup API:", error);
    return NextResponse.json(
      { error: "Failed to fetch startup" },
      { status: 500 }
    );
  }
}
