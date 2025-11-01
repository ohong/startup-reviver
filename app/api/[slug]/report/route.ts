import { NextRequest, NextResponse } from "next/server";
import { getCompanyDetails } from "@/lib/mock-company-details";

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

    // Special handling for fetchr - return the mock data
    if (slug.toLowerCase() === 'fetchr') {
      const details = await getCompanyDetails(slug);
      if (details) {
        return NextResponse.json({ report: details });
      }
    }

    // For all other slugs, return 404 for now
    return NextResponse.json(
      { error: "Report not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in report API:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
