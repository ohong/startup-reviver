import { notFound } from "next/navigation";
import { getCompanyDetails } from "@/lib/mock-company-details";
import { CompanyPageContent } from "./CompanyPageContent";

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const details = getCompanyDetails(slug.toLowerCase());

  if (!details) {
    notFound();
  }

  return <CompanyPageContent details={details} />;
}
