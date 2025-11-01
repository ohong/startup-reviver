"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { type YCStartup } from "@/lib/meilisearch";

interface EmptyCompanyPageProps {
  slug: string;
}

export function EmptyCompanyPage({ slug }: EmptyCompanyPageProps) {
  const [startup, setStartup] = useState<YCStartup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        console.log("Fetching startup data for:", slug);
        const response = await fetch(`/api/startups/${encodeURIComponent(slug)}`);
        console.log("Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Startup data:", data.startup);
          setStartup(data.startup);
        } else {
          console.log("Failed to fetch startup data");
        }
      } catch (error) {
        console.error("Error fetching startup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartup();
  }, [slug]);

  console.log("Rendering EmptyCompanyPage for:", slug, "startup:", startup, "loading:", isLoading);

  return (
    <div className="min-h-screen" style={{ background: "#F0F2F5" }}>
      {/* Header */}
      <div className="relative" style={{ background: "#F0F2F5" }}>
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-70"
            style={{
              color: "#4B5563",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to graveyard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
        <div
          className="relative w-full"
          style={{
            background: "#fff",
            padding: "64px 48px",
            minHeight: "500px",
          }}
        >
          {/* Corner Accents */}
          <CornerAccents />

          <div className="text-center">
            {/* Logo with Skull Overlay */}
            <div className="mb-8 flex justify-center">
              <div className="relative h-20 w-20">
                {/* Startup Logo Background */}
                {startup?.small_logo_thumb_url && !isLoading && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      background: "#F7F8FA",
                    }}
                  >
                    <Image
                      src={startup.small_logo_thumb_url}
                      alt={`${startup.name} logo`}
                      fill
                      className="object-cover opacity-30"
                      unoptimized
                    />
                  </div>
                )}
                
                {/* Skull Emoji Overlay */}
                <div
                  className="relative flex h-full w-full items-center justify-center"
                  style={{
                    background: isLoading || !startup?.small_logo_thumb_url ? "#F7F8FA" : "transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      lineHeight: "1",
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                    }}
                  >
                    💀
                  </span>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <h1
              className="mb-2"
              style={{
                fontFamily: "var(--font-pt-mono), var(--font-title)",
                color: "var(--ink-900)",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              {startup?.name || slug} is still dead
            </h1>

            {/* Batch and One-liner */}
            {startup && !isLoading && (
              <div className="mb-6 space-y-2">
                {startup.batch && (
                  <div
                    className="inline-block px-3 py-1"
                    style={{
                      background: "var(--paper-050)",
                      color: "var(--ink-700)",
                      fontFamily: "var(--font-pt-mono), var(--font-title)",
                      fontSize: "12px",
                    }}
                  >
                    {startup.batch}
                  </div>
                )}
                {startup.one_liner && (
                  <div className="gap-2"
                  style={{
                    fontFamily: "var(--font-inter), var(--font-body)",
                    color: "var(--ink-600)",
                    lineHeight: "1.4",
                    fontSize: "14px",
                  }}
                  >
                    <span>Famous last words:</span>
                  <span
                    className="max-w-md mx-auto"
                    style={{
                      fontFamily: "var(--font-inter), var(--font-body)",
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{startup.one_liner}&rdquo;
                  </span>
                  </div>
                )}
              </div>
            )}

            {/* Subtitle */}
            <p
              className="mb-8 max-w-md mx-auto"
              style={{
                fontFamily: "var(--font-inter), var(--font-body)",
                color: "var(--ink-500)",
                fontSize: "16px",
                lineHeight: "1.5",
              }}
            >
              This startup hasn&apos;t been resurrected yet. Our agents are still working on the research and strategy.
            </p>

            {/* Action Button */}
            <button
              className="inline-flex items-center gap-3 px-6 py-3 transition-transform hover:-translate-y-px"
              style={{
                background: "var(--ink-900)",
                color: "#fff",
                fontFamily: "var(--font-pt-mono), var(--font-title)",
                fontSize: "14px",
                fontWeight: 600,
              }}
              onClick={() => {
                // TODO: Implement resurrection request
                alert("Resurrection request submitted! Our agents will get to work.");
              }}
            >
              <Zap className="h-4 w-4" />
              Request Resurrection
            </button>

            {/* Status */}
            <div className="mt-12">
              <div
                className="inline-flex items-center gap-2 px-4 py-2"
                style={{
                  background: "var(--paper-050)",
                  color: "var(--ink-600)",
                  fontFamily: "var(--font-pt-mono), var(--font-title)",
                  fontSize: "12px",
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--accent-red-500)" }}
                />
                Status: Not Resurrected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Corner accent component for the brutalist aesthetic
function CornerAccents() {
  const cornerStyle = {
    position: "absolute" as const,
    width: "16px",
    height: "16px",
  };

  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1V15M1 8H15" stroke="var(--ink-400)" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );

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
