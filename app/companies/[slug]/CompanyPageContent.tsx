"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CompanyDetails } from "@/lib/mock-company-details";
import { parseMarkdownToCompanyDetails } from "@/lib/markdown-parser";

// Add CSS keyframes for spinner animation
const spinnerStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1V15M1 8H15" stroke="var(--ink-400)" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: "spin 1s linear infinite",
        transformOrigin: "center",
        display: "inline-block",
      }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

// Corner accent component for the brutalist aesthetic
function CornerAccents() {
  const cornerStyle = {
    position: "absolute" as const,
    width: "16px",
    height: "16px",
  };

  return (
    <>
      {/* Top-left */}
      <div style={{ ...cornerStyle, top: "-8px", left: "-8px" }}><PlusIcon /></div>
      {/* Top-right */}
      <div style={{ ...cornerStyle, top: "-8px", right: "-8px" }}><PlusIcon /></div>
      {/* Bottom-left */}
      <div style={{ ...cornerStyle, bottom: "-8px", left: "-8px" }}><PlusIcon /></div>
      {/* Bottom-right */}
      <div style={{ ...cornerStyle, bottom: "-8px", right: "-8px" }}><PlusIcon /></div>
    </>
  );
}

interface CompanyPageContentProps {
  details: CompanyDetails;
  slug: string;
}

const stickyOffset = 96;

export function CompanyPageContent({ details: initialDetails, slug }: CompanyPageContentProps) {
  const [details, setDetails] = useState<CompanyDetails>(initialDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [hasDeployment, setHasDeployment] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeploymentSubmitted, setIsDeploymentSubmitted] = useState(false);

  // Fetch markdown report from API
  useEffect(() => {
    async function fetchReport() {
      try {
        // Fetch both the report markdown and startup data
        const [reportResponse, startupResponse] = await Promise.all([
          fetch(`/api/${slug}/report`),
          fetch(`/api/startups/${slug}`)
        ]);
        
        if (reportResponse.ok) {
          const reportData = await reportResponse.json();
          if (reportData.markdown) {
            // Use startup data from API if available
            let startupToUse = initialDetails.startup;
            if (startupResponse.ok) {
              const startupData = await startupResponse.json();
              if (startupData.startup && startupData.startup.small_logo_thumb_url) {
                // Merge startup data, prioritizing API data for logo
                startupToUse = {
                  ...initialDetails.startup,
                  ...startupData.startup,
                  slug: startupData.startup.slug || initialDetails.startup.slug,
                  name: startupData.startup.name || initialDetails.startup.name,
                };
              }
            }
            
            // Parse markdown and update details
            const parsedDetails = parseMarkdownToCompanyDetails(
              reportData.markdown,
              slug,
              startupToUse
            );
            setDetails(parsedDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [slug, initialDetails.startup]);

  // Fetch deployment information
  useEffect(() => {
    async function fetchDeployment() {
      try {
        const response = await fetch(`/api/${slug}/deployment`);
        if (response.ok) {
          const data = await response.json();
          setDeploymentUrl(data.url);
          setHasDeployment(true);
        } else {
          setHasDeployment(false);
        }
      } catch (error) {
        console.error("Error fetching deployment:", error);
        setHasDeployment(false);
      }
    }

    fetchDeployment();
  }, [slug]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_REPORT_BACKEND_API;
      if (!backendUrl) {
        console.error("NEXT_PUBLIC_REPORT_BACKEND_API is not defined");
        return;
      }

      // Fake the deployment with a delay for better UX
      setTimeout(() => {
        setIsDeploymentSubmitted(true);
      }, 2000);

      /* Real API call - commented out for now
      const response = await fetch(`${backendUrl}/create_coding_specs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        console.error("Failed to create coding specs:", response.statusText);
      } else {
        console.log("Deployment initiated successfully");
      }
      */
    } catch (error) {
      console.error("Error deploying:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  const sectionIds = useMemo(
    () => details.sections.map((section) => section.id),
    [details.sections]
  );

  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const next = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (next) {
          setActiveSection(next.target.id);
        }
      },
      {
        rootMargin: "-45% 0px -45%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) {
        observer.observe(node);
      }
    });

    return () => {
      sectionIds.forEach((id) => {
        const node = document.getElementById(id);
        if (node) {
          observer.unobserve(node);
        }
      });
      observer.disconnect();
    };
  }, [sectionIds]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = spinnerStyles;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--paper-075)" }}>
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b"
        style={{
          background: "var(--paper-000)",
          borderColor: "var(--line-200)",
          padding: "12px 24px",
        }}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-pt-mono), var(--font-title)",
              color: "var(--ink-900)",
              fontSize: "16px",
              letterSpacing: "-0.01em",
              textDecoration: "none",
            }}
          >
            Startup of the Dead
          </Link>
          <nav
            aria-label="Company tabs"
            className="hidden items-center gap-6 md:flex"
            role="tablist"
            style={{
              fontFamily: "var(--font-pt-mono), var(--font-title)",
              fontSize: "14px",
            }}
          >
            {[
              { label: "Overview", href: "#overview", active: false },
              { label: "Report", href: `#${sectionIds[0] ?? "report"}`, active: true },
              { label: "Spec", href: "#", active: false },
            ].map((tab) => (
              <a
                key={tab.label}
                href={tab.href}
                role="tab"
                aria-selected={tab.active}
                style={{
                  color: tab.active ? "var(--ink-900)" : "var(--ink-500)",
                  textDecoration: "none",
                  padding: "8px 0",
                  borderBottom: tab.active
                    ? "2px solid var(--ink-900)"
                    : "2px solid transparent",
                }}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
        {/* Icon buttons removed */}
      </header>

      <div
        className="mx-auto grid gap-8 px-4 pb-24 pt-10 lg:px-6"
        style={{
          maxWidth: "1240px",
          gridTemplateColumns: "240px minmax(0, 1fr) 300px",
        }}
      >
        <aside
          aria-label="Memo sections"
          className="hidden lg:block"
          style={{ position: "sticky", top: `${stickyOffset}px`, alignSelf: "flex-start" }}
        >
          <div
            className="relative"
            style={{
              width: "140px",
              height: "140px",
              background: "var(--paper-000)",
              marginBottom: "24px",
            }}
          >
            <CornerAccents />
            <div
              className="relative overflow-hidden"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {details.startup.small_logo_thumb_url && (
                <Image
                  src={details.startup.small_logo_thumb_url}
                  alt={`${details.startup.name} logo`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
          </div>
          <ul
            className="grid gap-2"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontFamily: "var(--font-pt-mono), var(--font-title)",
              fontSize: "13px",
            }}
          >
            {details.sections.map((section) => {
              const navLabel = section.title.replace(/\s*[—–:]+.*$/, "").trim() || section.title;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    style={{
                      color: activeSection === section.id
                        ? "var(--ink-900)"
                        : "var(--ink-500)",
                      fontWeight: activeSection === section.id ? 600 : 400,
                      textDecoration: "none",
                    }}
                    aria-current={activeSection === section.id ? "true" : undefined}
                  >
                    {navLabel}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        <main>
          <nav
            aria-label="Memo sections"
            className="mb-6 grid gap-3 border-b border-line-200 pb-4 lg:hidden"
            style={{
              fontFamily: "var(--font-pt-mono), var(--font-title)",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-400)",
              }}
            >
              Sections
            </div>
            <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: "4px" }}>
              {details.sections.map((section) => {
                const navLabel = section.title.replace(/\s*[—–:]+.*$/, "").trim() || section.title;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    style={{
                      color: activeSection === section.id
                        ? "var(--ink-900)"
                        : "var(--ink-500)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {navLabel}
                  </a>
                );
              })}
            </div>
          </nav>

          <header id="overview" style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
                fontFamily: "var(--font-pt-mono), var(--font-title)",
              }}
            >
              <Link
                href={details.startup.website}
                style={{
                  color: "var(--accent-blue-600)",
                  fontSize: "13px",
                  textDecoration: "underline",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {details.startup.website.replace(/^https?:\/\//, "")}
              </Link>
              <span
                style={{
                  color: "var(--ink-400)",
                  fontSize: "12px",
                }}
              >
                {details.startup.batch}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-pt-mono), var(--font-title)",
                fontSize: "36px",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: "var(--ink-900)",
                margin: 0,
              }}
            >
              {details.startup.name}
            </h1>
            <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
              {details.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--paper-050)",
                    color: "var(--ink-700)",
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    fontSize: "12px",
                    padding: "6px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p
              style={{
                fontFamily: "var(--font-inter), var(--font-body)",
                color: "var(--ink-500)",
                fontSize: "16px",
                lineHeight: 1.6,
                maxWidth: "70ch",
              }}
            >
              {details.overview}
            </p>
          </header>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--ink-400)",
              fontSize: "12px",
              padding: "12px 0",
              borderTop: "1px solid var(--line-200)",
              borderBottom: "1px solid var(--line-200)",
              marginBottom: "24px",
            }}
          >
            <span>Updated: {details.updatedAt}</span>
            <span>Reading time: {details.readingTime}</span>
          </div>

          <article
            style={{
              fontFamily: "var(--font-inter), var(--font-body)",
              color: "var(--ink-700)",
              fontSize: "16px",
              lineHeight: 1.7,
            }}
          >
            {details.sections.map((section) => (
              <section key={section.id} id={section.id} style={{ marginBottom: "32px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    fontSize: "24px",
                    lineHeight: 1.3,
                    color: "var(--ink-900)",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {section.title}
                </h2>
                {section.body.map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: "12px" }}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </main>

        <aside
          className="hidden lg:block"
          style={{ position: "sticky", top: `${stickyOffset}px`, alignSelf: "flex-start" }}
        >
          <section
            className="relative"
            style={{
              background: "var(--paper-000)",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <CornerAccents />
            {isDeploymentSubmitted ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "12px",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                  }}
                >
                  ✨
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    fontSize: "16px",
                    color: "var(--ink-900)",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Deployment Initiated
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter), var(--font-body)",
                    fontSize: "14px",
                    color: "var(--ink-500)",
                    lineHeight: 1.5,
                  }}
                >
                  Our agents are now building the MVP for {details.startup.name}. We'll notify you when it&apos;s ready!
                </p>
              </div>
            ) : isDeploying ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: "12px" }}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      animation: "spin 1s linear infinite",
                      transformOrigin: "center",
                      display: "inline-block",
                      transform: "scale(2)",
                    }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M8 2a6 6 0 0 1 6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                    />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    fontSize: "16px",
                    color: "var(--ink-900)",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Deploying...
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter), var(--font-body)",
                    fontSize: "14px",
                    color: "var(--ink-500)",
                    lineHeight: 1.5,
                  }}
                >
                  Building the resurrected MVP
                </p>
              </div>
            ) : hasDeployment && deploymentUrl ? (
              <Link
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  background: "var(--ink-900)",
                  color: "var(--paper-000)",
                  border: "1px solid var(--ink-900)",
                  padding: "14px 16px",
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                  fontSize: "14px",
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Visit deployed MVP
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                style={{
                  width: "100%",
                  background: "var(--ink-900)",
                  color: "var(--paper-000)",
                  border: "1px solid var(--ink-900)",
                  padding: "14px 16px",
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                  fontSize: "14px",
                  letterSpacing: "-0.01em",
                  cursor: isDeploying ? "not-allowed" : "pointer",
                  opacity: isDeploying ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isDeploying && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      animation: "spin 1s linear infinite",
                      transformOrigin: "center",
                      display: "inline-block",
                    }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M8 2a6 6 0 0 1 6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                    />
                  </svg>
                )}
                {isDeploying ? "Deploying..." : "Deploy a resurrected MVP"}
              </button>
            )}
          </section>

          <section
            className="relative"
            style={{
              background: "var(--paper-000)",
              padding: "24px",
            }}
          >
            <CornerAccents />
            <dl style={{ margin: 0, display: "grid", gap: "16px" }}>
              {details.facts.map((fact) => (
                <div key={fact.label}>
                  <dt
                    style={{
                      fontSize: "12px",
                      color: "var(--ink-400)",
                      fontFamily: "var(--font-pt-mono), var(--font-title)",
                      marginBottom: "4px",
                    }}
                  >
                    {fact.label}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      color: "var(--ink-900)",
                      fontFamily: "var(--font-inter), var(--font-body)",
                    }}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
