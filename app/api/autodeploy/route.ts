import { NextRequest, NextResponse } from 'next/server'

import {
  API_KEY_MISSING_RESPONSE,
  ApiError,
  buildErrorResponse,
  deployVersion,
  generateChat,
} from '../_lib/v0'

type AutoDeployRequest = {
  message: string
  projectId?: string
  chatId?: string
  modelId?: string
  imageGenerations?: boolean
  thinking?: boolean
  attachments?: unknown[]
  generationTimeoutMs?: number
  versionPollIntervalMs?: number
  versionMaxWaitMs?: number
  deploymentTimeoutMs?: number
}

const AUTONOMOUS_ERROR_FALLBACK = 'Failed to run autonomous deployment'

export async function POST(request: NextRequest) {
  if (!process.env.V0_API_KEY) {
    return NextResponse.json(API_KEY_MISSING_RESPONSE, { status: 401 })
  }

  try {
    const body = (await request.json()) as AutoDeployRequest
    const {
      message,
      projectId,
      chatId,
      modelId = 'v0-1.5-md',
      imageGenerations = false,
      thinking = false,
      attachments = [],
      generationTimeoutMs,
      versionPollIntervalMs,
      versionMaxWaitMs,
      deploymentTimeoutMs,
    } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 },
      )
    }

    const generation = await generateChat(
      {
        message,
        chatId,
        projectId,
        modelId,
        imageGenerations,
        thinking,
        attachments,
      },
      {
        waitForVersion: true,
        generationTimeoutMs,
        pollIntervalMs: versionPollIntervalMs,
        maxWaitMs: versionMaxWaitMs,
      },
    )

    const resolvedProjectId =
      generation.chat.projectId || projectId || undefined

    if (!resolvedProjectId) {
      throw new ApiError(
        'Project ID missing after generation. Check the V0 chat for details.',
        { status: 502, code: 'PROJECT_ID_MISSING' },
      )
    }

    const latestVersion = generation.latestVersion
    if (!latestVersion?.id) {
      throw new ApiError(
        'Unable to determine the latest version to deploy.',
        {
          status: 502,
          code: 'VERSION_MISSING',
        },
      )
    }

    const deployment = await deployVersion(
      {
        projectId: resolvedProjectId,
        chatId: generation.chat.id,
        versionId: latestVersion.id,
      },
      { deploymentTimeoutMs },
    )

    const previewUrl =
      latestVersion.demoUrl ?? generation.chat.latestVersion?.demoUrl
    const deploymentMessageRecord = deployment as unknown as {
      message?: unknown
    }
    const deploymentMessage =
      typeof deploymentMessageRecord.message === 'string'
        ? deploymentMessageRecord.message
        : undefined

    return NextResponse.json({
      projectId: resolvedProjectId,
      chatId: generation.chat.id,
      versionId: latestVersion.id,
      deploymentId: deployment.id,
      webUrl: deployment.webUrl,
      inspectorUrl: deployment.inspectorUrl,
      previewUrl,
      chatUrl: generation.chat.webUrl,
      message: deploymentMessage,
    })
  } catch (error) {
    const { status, body } = buildErrorResponse(error, AUTONOMOUS_ERROR_FALLBACK)
    return NextResponse.json(body, { status })
  }
}
