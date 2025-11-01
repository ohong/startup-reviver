"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Search, Share2 } from "lucide-react";
import type { CompanyDetails } from "@/lib/mock-company-details";

interface CompanyPageContentProps {
  details: CompanyDetails;
}

const stickyOffset = 96;

export function CompanyPageContent({ details }: CompanyPageContentProps) {
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
        <div className="flex items-center gap-3" style={{ color: "var(--ink-400)" }}>
          <button
            type="button"
            aria-label="Search"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              display: "grid",
              placeItems: "center",
              padding: "6px",
            }}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              display: "grid",
              placeItems: "center",
              padding: "6px",
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="More actions"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              display: "grid",
              placeItems: "center",
              padding: "6px",
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
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
            className="relative overflow-hidden"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "12px",
              background: "var(--paper-050)",
              marginBottom: "24px",
            }}
          >
            <Image
              src={details.startup.small_logo_thumb_url}
              alt={`${details.startup.name} logo`}
              fill
              className="object-cover"
              unoptimized
            />
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
            className="mb-6 grid gap-3 border-b border-[color:var(--line-200)] pb-4 lg:hidden"
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
            style={{
              border: "1px solid var(--line-200)",
              borderRadius: "12px",
              background: "var(--paper-000)",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              style={{
                width: "100%",
                background: "var(--ink-900)",
                color: "var(--paper-000)",
                border: "none",
                borderRadius: "10px",
                padding: "14px 16px",
                fontFamily: "var(--font-pt-mono), var(--font-title)",
                fontSize: "14px",
                letterSpacing: "-0.01em",
                cursor: "pointer",
              }}
            >
              Revive this startup
            </button>
          </section>

          <section
            style={{
              border: "1px solid var(--line-200)",
              borderRadius: "12px",
              background: "var(--paper-000)",
              padding: "24px",
            }}
          >
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
