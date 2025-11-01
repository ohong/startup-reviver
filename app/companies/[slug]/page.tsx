import { CompanyPageContent } from "./CompanyPageContent";
import { EmptyCompanyPage } from "./EmptyCompanyPage";
import { getCompanyDetails } from "@/lib/mock-company-details";

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  
  // Get initial details (either from mock data or API)
  const details = await getCompanyDetails(normalizedSlug);

  if (!details) {
    return <EmptyCompanyPage slug={slug} />;
  }

  return <CompanyPageContent details={details} slug={normalizedSlug} />;
}
