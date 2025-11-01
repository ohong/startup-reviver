import { CompanyPageContent } from "./CompanyPageContent";
import { EmptyCompanyPage } from "./EmptyCompanyPage";

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchCompanyReport(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/${slug}/report`, {
      cache: 'no-store' // Ensure fresh data for development
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.report;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching company report:", error);
    return null;
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const details = await fetchCompanyReport(slug.toLowerCase());

  if (!details) {
    return <EmptyCompanyPage slug={slug} />;
  }

  return <CompanyPageContent details={details} />;
}
