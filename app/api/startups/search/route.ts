import { NextRequest, NextResponse } from "next/server";
import { searchStartups } from "@/lib/meilisearch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "*";
    const limitParam = searchParams.get("limit");

    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    const startups = await searchStartups(query, limit);

    return NextResponse.json({ startups });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Failed to search startups" },
      { status: 500 }
    );
  }
}
