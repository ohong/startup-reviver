"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { type YCStartup } from "@/lib/meilisearch";
import { slugifyName } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startups, setStartups] = useState<YCStartup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch startups from API when search query changes
  useEffect(() => {
    const fetchStartups = async () => {
      if (!searchQuery.trim()) {
        setStartups([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/startups/search?q=${encodeURIComponent(searchQuery)}&limit=100`);
        if (!response.ok) {
          throw new Error('Failed to fetch startups');
        }
        const data = await response.json();
        setStartups(data.startups || []);
      } catch (error) {
        console.error("Error fetching startups:", error);
        setStartups([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchStartups, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Prioritize inactive startups
  const sortedStartups = useMemo(() => {
    return [...startups].sort((a, b) => {
      if (a.status === "Inactive" && b.status !== "Inactive") return -1;
      if (a.status !== "Inactive" && b.status === "Inactive") return 1;
      return 0;
    });
  }, [startups]);

  return (
    <div className="min-h-screen" style={{ background: "var(--paper-075)" }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: "var(--paper-075)" }}>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
          {/* Hero Grid - Title Left, Image Right */}
          <div className="mx-auto mb-4 grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              {/* Title */}
              <h1
                className="mb-4"
                style={{
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                  color: "var(--ink-900)",
                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                  lineHeight: "1.2",
                  letterSpacing: "-0.01em",
                }}
              >
                Startup of the Dead
              </h1>

              {/* Subtitle */}
              <p
                className="mx-auto max-w-md text-base lg:mx-0"
                style={{
                  fontFamily: "var(--font-inter), var(--font-body)",
                  color: "var(--ink-500)",
                  lineHeight: "1.5",
                }}
              >
                Revive any YC startup from the previous batches
              </p>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative -my-8" style={{ transform: "scale(1.3) translate(-10%, 10%)", transformOrigin: "center" }}>
              <div className="relative aspect-video w-full overflow-visible">
                <Image
                  src="/dithering-effect.svg"
                  alt="Dithered illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div
              className="relative flex items-center gap-3 px-4"
              style={{
                background: "#fff",
                height: "40px",
              }}
            >
              {/* Corner Accents */}
              <CornerAccents />
              
              <Search
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--ink-400)" }}
              />
              <input
                type="text"
                placeholder="Search for a startup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent text-base outline-none"
                style={{
                  fontFamily: "var(--font-inter), var(--font-body)",
                  color: "var(--ink-900)",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results - Pre-allocated Space */}
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 lg:px-8">
        <div 
          className="relative w-full"
          style={{ 
            minHeight: "400px",
            background: "#fff",
            padding: "32px",
          }}
        >
          {/* Corner Accents */}
          <CornerAccents />
          
          {searchQuery.trim() ? (
            <>
              {/* Results Header - Absolute Position */}
              <div style={{ position: "absolute", top: "32px", left: "32px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    color: "var(--ink-900)",
                    fontSize: "24px",
                    lineHeight: "32px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {sortedStartups.length} result{sortedStartups.length !== 1 ? "s" : ""}
                </h2>
              </div>

              {/* Results Content with Padding */}
              <div style={{ paddingTop: "64px", minHeight: "336px" }}>
                {isLoading ? (
                  <div className="flex items-center justify-center" style={{ minHeight: "272px", marginTop: "-32px" }}>
                    <div className="text-center">
                      <p
                        style={{
                          fontFamily: "var(--font-pt-mono), var(--font-title)",
                          color: "var(--ink-400)",
                          fontSize: "24px",
                          letterSpacing: "0.05em",
                          fontWeight: 400,
                        }}
                      >
                        Searching...
                      </p>
                    </div>
                  </div>
                ) : sortedStartups.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedStartups.map((startup) => (
                      <StartupCard key={startup.slug || startup.id || startup.name} startup={startup} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={{ minHeight: "272px", marginTop: "-32px" }}>
                    <div className="text-center">
                      <p
                        style={{
                          fontFamily: "var(--font-pt-mono), var(--font-title)",
                          color: "var(--ink-400)",
                          fontSize: "24px",
                          letterSpacing: "0.05em",
                          fontWeight: 400,
                        }}
                      >
                        No startups found matching &ldquo;{searchQuery}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center" style={{ paddingTop: "64px", minHeight: "336px", marginTop: "-32px" }}>
              <div className="text-center">
                <p
                  style={{
                    fontFamily: "var(--font-pt-mono), var(--font-title)",
                    color: "var(--ink-400)",
                    fontSize: "24px",
                    letterSpacing: "0.05em",
                    fontWeight: 400,
                  }}
                >
                  The graveyard is empty
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1V15M1 8H15" stroke="var(--ink-400)" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

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

interface StartupCardProps {
  startup: YCStartup;
}

function StartupCard({ startup }: StartupCardProps) {
  const isInactive = startup.status === "Inactive";
  const slug = startup.slug || slugifyName(startup.name || "");
  const href = `/companies/${slug}`;

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden transition-transform hover:translate-y-[-2px]"
      style={{
        background: "var(--paper-050)",
        padding: "20px",
      }}
    >
      {/* Corner Accents */}
      <CornerAccents />

      {/* Header with Logo and RIP Badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        {/* Logo */}
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden"
          style={{
            background: "var(--paper-050)",
          }}
        >
          {startup.small_logo_thumb_url && (
            <Image
              src={startup.small_logo_thumb_url}
              alt={`${startup.name} logo`}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>

        {/* RIP Badge for Inactive Startups */}
        {isInactive && (
          <span
            className="shrink-0"
            style={{
              background: "var(--ink-900)",
              color: "#fff",
              fontFamily: "var(--font-pt-mono), var(--font-title)",
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
            }}
          >
            RIP
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <h3
          className="mb-2"
          style={{
            fontFamily: "var(--font-pt-mono), var(--font-title)",
            color: "var(--ink-900)",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
          }}
        >
          {startup.name}
        </h3>
        <p
          className="mb-4 line-clamp-2"
          style={{
            fontFamily: "var(--font-inter), var(--font-body)",
            color: "var(--ink-500)",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          {startup.one_liner}
        </p>

        {/* Metadata - pushed to bottom */}
        <div className="mt-auto space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {startup.batch && (
              <span
                className="inline-flex items-center"
                style={{
                  background: "#fff",
                  color: "var(--ink-700)",
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                  fontSize: "12px",
                  padding: "4px 10px",
                }}
              >
                {startup.batch}
              </span>
            )}

            {startup.status && (
              <span
                className="inline-flex items-center"
                style={{
                  background: "#fff",
                  color:
                    startup.status === "Active"
                      ? "var(--accent-green-500)"
                      : startup.status === "Acquired"
                      ? "#F59E0B"
                      : startup.status === "Inactive"
                      ? "var(--accent-red-500)"
                      : "var(--ink-700)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                }}
              >
                {startup.status}
              </span>
            )}
          </div>

          {startup.launched_at && (
            <span
              className="block"
              style={{
                color: "var(--ink-400)",
                fontFamily: "var(--font-inter), var(--font-body)",
                fontSize: "12px",
              }}
            >
              Launched {new Date(startup.launched_at * 1000).getFullYear()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
