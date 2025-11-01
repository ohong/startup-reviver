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
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleResurrectionRequest = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Fake the API call with a delay for better UX
    setTimeout(() => {
      setIsSubmitted(true);
    }, 2000);

    // Keep the real API call code commented for future use
    /*
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_REPORT_BACKEND_API}/deep_research`;
      console.log("api url:", apiUrl);
      const payload = {
        company: startup?.name || slug,
      };
      
      console.log("Submitting resurrection request to:", apiUrl);
      console.log("Request payload:", payload);
      console.log("User email (stored for UI):", email);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log("Response data:", data);
        setIsSubmitted(true);
      } else {
        const errorText = await response.text().catch(() => "No error details");
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to submit resurrection request: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error submitting resurrection request:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: process.env.NEXT_PUBLIC_REPORT_BACKEND_API,
      });
      alert(`Failed to submit request. Please try again.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsSubmitting(false);
    }
    */
  };

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
            {isLoading ? (
              <div className="mb-2">
                <div
                  className="mx-auto h-8 w-64 animate-pulse"
                  style={{
                    background: "#E5E7EB",
                    borderRadius: "4px",
                  }}
                />
              </div>
            ) : (
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
            )}

            {/* Batch and One-liner */}
            {isLoading ? (
              <div className="mb-6 space-y-3">
                {/* Batch skeleton */}
                <div
                  className="mx-auto h-6 w-16 animate-pulse"
                  style={{
                    background: "#E5E7EB",
                    borderRadius: "4px",
                  }}
                />
                {/* One-liner skeleton */}
                <div className="space-y-2">
                  <div
                    className="mx-auto h-4 w-32 animate-pulse"
                    style={{
                      background: "#E5E7EB",
                      borderRadius: "4px",
                    }}
                  />
                  <div
                    className="mx-auto h-4 w-80 animate-pulse"
                    style={{
                      background: "#E5E7EB",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            ) : startup ? (
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
            ) : (
              <div className="mb-6 space-y-2">
                <div
                  style={{
                    fontFamily: "var(--font-inter), var(--font-body)",
                    color: "var(--ink-500)",
                    fontSize: "14px",
                  }}
                >
                  No startup data found
                </div>
              </div>
            )}

            {!isSubmitted ? (
              <>
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

                {/* Email Input and Action Button */}
                <div className="mb-8 max-w-md mx-auto">
                  <div className="relative mb-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border px-4 py-3 text-base outline-none transition-colors"
                      style={{
                        fontFamily: "var(--font-inter), var(--font-body)",
                        color: "var(--ink-900)",
                        borderColor: "var(--line-200)",
                        background: isSubmitting ? "var(--paper-050)" : "#fff",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSubmitting) {
                          handleResurrectionRequest();
                        }
                      }}
                    />
                  </div>
                  
                  <button
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: "var(--ink-900)",
                      color: "#fff",
                      fontFamily: "var(--font-pt-mono), var(--font-title)",
                      fontSize: "14px",
                      fontWeight: 600,
                      border: "1px solid var(--ink-900)",
                      minWidth: "220px",
                    }}
                    onClick={handleResurrectionRequest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        Summoning agents...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Request Resurrection
                      </>
                    )}
                  </button>
                </div>

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
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="mb-8">
                  <div
                    className="mb-4 text-4xl"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                    }}
                  >
                    ✨
                  </div>
                  <h2
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-pt-mono), var(--font-title)",
                      color: "var(--ink-900)",
                      fontSize: "24px",
                      lineHeight: "1.3",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Resurrection in Progress
                  </h2>
                  <p
                    className="max-w-md mx-auto"
                    style={{
                      fontFamily: "var(--font-inter), var(--font-body)",
                      color: "var(--ink-500)",
                      fontSize: "16px",
                      lineHeight: "1.5",
                    }}
                  >
                    Our AI agents are now deep-diving into {startup?.name || slug}. 
                    We&apos;ll send a detailed resurrection strategy to{" "}
                    <strong style={{ color: "var(--ink-700)" }}>{email}</strong> 
                    {" "}when the analysis is complete.
                  </p>
                </div>

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
                      className="h-2 w-2 rounded-full animate-pulse"
                      style={{ background: "var(--accent-orange-500)" }}
                    />
                    Status: Analyzing
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
