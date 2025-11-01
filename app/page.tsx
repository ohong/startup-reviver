'use client'

import { useMemo, useState } from 'react'

type GenerationResult = {
  chatId: string
  projectId: string
  versionId?: string
  demoUrl?: string
  previewUrl?: string
}

type DeploymentResult = {
  id: string
  webUrl?: string
  inspectorUrl?: string
  message?: string
}

const DEFAULT_PROMPT =
  'Create a minimal hello world landing page with a prominent hero heading.'

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generation, setGeneration] = useState<GenerationResult | null>(null)

  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentError, setDeploymentError] = useState<string | null>(null)
  const [deployment, setDeployment] = useState<DeploymentResult | null>(null)

  const canDeploy = useMemo(() => {
    if (!generation) return false
    return Boolean(generation.projectId && generation.chatId && generation.versionId)
  }, [generation])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setGenerationError('Enter a prompt before generating.')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setDeployment(null)
    setDeploymentError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Generation failed')
      }

      const chatId: string | undefined = data?.id
      const projectId: string | undefined = data?.projectId
      const versionId: string | undefined = data?.latestVersion?.id

      if (!chatId || !projectId) {
        throw new Error(
          'Generation succeeded but missing identifiers. Check the V0 dashboard.',
        )
      }

      setGeneration({
        chatId,
        projectId,
        versionId,
        demoUrl: data?.latestVersion?.demoUrl ?? data?.demoUrl,
        previewUrl: data?.previewUrl ?? data?.latestVersion?.demoUrl,
      })
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : 'Generation failed',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeploy = async () => {
    if (!generation) {
      setDeploymentError('Generate an app before deploying.')
      return
    }

    if (!generation.versionId) {
      setDeploymentError(
        'Latest version ID is missing. Regenerate the prompt or deploy from the V0 UI.',
      )
      return
    }

    setIsDeploying(true)
    setDeploymentError(null)
    setDeployment(null)

    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: generation.projectId,
          chatId: generation.chatId,
          versionId: generation.versionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Deployment failed')
      }

      setDeployment({
        id: data?.id,
        webUrl: data?.webUrl,
        inspectorUrl: data?.inspectorUrl,
        message: data?.message,
      })
    } catch (error) {
      setDeploymentError(
        error instanceof Error ? error.message : 'Deployment failed',
      )
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-3">
          <span className="text-sm uppercase tracking-widest text-zinc-400">
            Startup Reviver
          </span>
          <h1 className="text-3xl font-semibold text-zinc-50 sm:text-4xl">
            Generate and deploy a V0 project in one place
          </h1>
          <p className="text-base text-zinc-400">
            Provide a prompt, let the V0 Platform build the project, then deploy
            it to Vercel with a single click.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <label
            htmlFor="prompt"
            className="text-sm font-medium text-zinc-200 sm:text-base"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-[160px] resize-y rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-base text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/50"
            placeholder="Describe the app you want V0 to build…"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-100 px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-200"
            >
              {isGenerating ? 'Generating…' : 'Generate with V0'}
            </button>
            <p className="text-xs text-zinc-500">
              Uses the API routes in this project. Make sure `V0_API_KEY` is set.
            </p>
          </div>
          {generationError && (
            <p className="rounded-lg border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-200">
              {generationError}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">
            2. Review generation details
          </h2>
          <p className="text-sm text-zinc-400">
            Once generation completes we capture the identifiers required for
            deployment.
          </p>

          {generation ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Project ID
                </dt>
                <dd className="truncate text-sm font-medium text-zinc-100">
                  {generation.projectId}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Chat ID
                </dt>
                <dd className="truncate text-sm font-medium text-zinc-100">
                  {generation.chatId}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Version ID
                </dt>
                <dd className="truncate text-sm font-medium text-zinc-100">
                  {generation.versionId ?? (
                    <span className="text-zinc-400">
                      Pending — check V0 or regenerate
                    </span>
                  )}
                </dd>
              </div>
              {(generation.demoUrl || generation.previewUrl) && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Preview
                  </dt>
                  <dd className="truncate text-sm font-medium text-zinc-100">
                    <a
                      href={generation.demoUrl || generation.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-200 underline"
                    >
                      Open preview
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">
              Run a generation to populate this section.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">
            3. Deploy to Vercel
          </h2>
          <p className="text-sm text-zinc-400">
            Deployment uses the `/api/deployments` route. We create the Vercel
            project automatically if it does not exist yet.
          </p>

          <button
            type="button"
            onClick={handleDeploy}
            disabled={!canDeploy || isDeploying}
            className="inline-flex h-11 w-fit items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-200"
          >
            {isDeploying ? 'Deploying…' : 'Deploy latest version'}
          </button>

          {!generation && (
            <p className="text-sm text-zinc-500">
              Generate a project first to enable deployment.
            </p>
          )}

          {generation && !generation.versionId && (
            <p className="text-sm text-amber-400">
              Waiting for a version ID. If this doesn’t resolve after a minute,
              check the chat in V0 or regenerate.
            </p>
          )}

          {deploymentError && (
            <p className="rounded-lg border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-200">
              {deploymentError}
            </p>
          )}

          {deployment && (
            <div className="flex flex-col gap-3 rounded-xl border border-emerald-900 bg-emerald-500/10 p-4">
              <h3 className="text-sm font-semibold text-emerald-200">
                Deployment created
              </h3>
              <dl className="space-y-2 text-sm text-emerald-100">
                <div>
                  <dt className="text-emerald-300">Deployment ID</dt>
                  <dd>{deployment.id}</dd>
                </div>
                {deployment.webUrl && (
                  <div>
                    <dt className="text-emerald-300">Live URL</dt>
                    <dd>
                      <a
                        href={deployment.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {deployment.webUrl}
                      </a>
                    </dd>
                  </div>
                )}
                {deployment.inspectorUrl && (
                  <div>
                    <dt className="text-emerald-300">Inspector</dt>
                    <dd>
                      <a
                        href={deployment.inspectorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Open in Vercel
                      </a>
                    </dd>
                  </div>
                )}
                {deployment.message && (
                  <div>
                    <dt className="text-emerald-300">Message</dt>
                    <dd>{deployment.message}</dd>
                  </div>
                )}
              </dl>
              <p className="text-xs text-emerald-300/80">
                Vercel preview deployments may respond with 401 until you sign
                in or configure a bypass token.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
