import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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

    // Look for markdown file in reports directory
    const reportsDir = path.join(process.cwd(), "reports");
    const reportPath = path.join(reportsDir, `${slug}.md`);
    
    // Check if the file exists
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Read the markdown file
    const markdown = fs.readFileSync(reportPath, "utf8");

    return NextResponse.json({ 
      markdown,
      slug 
    });
  } catch (error) {
    console.error("Error in report API:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
