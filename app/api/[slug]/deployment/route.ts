import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { slug } = await params;

    // Import the deployments JSON dynamically
    const deployments = await import("@/deployments/deployments.json");

    const deploymentUrl = deployments[slug];

    if (!deploymentUrl) {
      return NextResponse.json(
        { error: "No deployment found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ url: deploymentUrl });
  } catch (error) {
    console.error("Error reading deployments:", error);
    return NextResponse.json(
      { error: "Failed to read deployments" },
      { status: 500 }
    );
  }
}
