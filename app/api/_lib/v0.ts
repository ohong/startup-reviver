import { v0, ChatDetail, DeploymentDetail } from 'v0-sdk'

export const API_KEY_MISSING_RESPONSE = {
  error: 'API_KEY_MISSING',
  message: 'V0_API_KEY must be set on the server',
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, unknown>

  constructor(
    message: string,
    options: { status?: number; code?: string; details?: Record<string, unknown> } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 500
    this.code = options.code
    this.details = options.details
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string, options: { code?: string } = {}) {
    super(message, { status: 504, code: options.code ?? 'TIMEOUT' })
    this.name = 'TimeoutError'
  }
}

type GenerationPayload = {
  message: string
  chatId?: string
  projectId?: string
  modelId?: string
  imageGenerations?: boolean
  thinking?: boolean
  attachments?: unknown[]
}

type GenerationOptions = {
  waitForVersion?: boolean
  pollIntervalMs?: number
  maxWaitMs?: number
  generationTimeoutMs?: number
}

type GenerationResult = {
  chat: ChatDetail
  latestVersion?: ChatDetail['latestVersion']
}

type DeploymentParams = {
  projectId: string
  chatId: string
  versionId: string
}

type DeploymentOptions = {
  deploymentTimeoutMs?: number
}

const DEFAULT_GENERATION_TIMEOUT_MS = 120_000 // 2 minutes
const DEFAULT_POLL_INTERVAL_MS = 2_000
const DEFAULT_POLL_TIMEOUT_MS = 120_000
const DEFAULT_DEPLOY_TIMEOUT_MS = 120_000

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function ensureV0ApiKey() {
  if (!process.env.V0_API_KEY) {
    throw new ApiError(API_KEY_MISSING_RESPONSE.message, {
      status: 401,
      code: API_KEY_MISSING_RESPONSE.error,
    })
  }
}

function messageIndicatesMissingApiKey(message: string) {
  const lower = message.toLowerCase()
  return (
    lower.includes('api key is required') ||
    lower.includes('v0_api_key') ||
    lower.includes('config.apikey') ||
    lower.includes('unauthorized') ||
    lower.includes('invalid api key') ||
    lower.includes('authentication') ||
    lower.includes('401')
  )
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeoutHandle: NodeJS.Timeout | undefined
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new TimeoutError(`Timed out after ${ms}ms while ${label}.`))
      }, ms)
    })
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

async function waitForLatestVersion(chatId: string, options: GenerationOptions = {}) {
  const pollInterval = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS
  const maxWait = options.maxWaitMs ?? DEFAULT_POLL_TIMEOUT_MS
  const deadline = Date.now() + maxWait

  let latestChat: ChatDetail | undefined

  while (Date.now() <= deadline) {
    latestChat = await withTimeout(
      v0.chats.getById({ chatId }),
      options.generationTimeoutMs ?? DEFAULT_GENERATION_TIMEOUT_MS,
      'fetching chat status from V0',
    )

    const version = latestChat.latestVersion
    if (version) {
      if (version.status === 'completed') {
        return { chat: latestChat, latestVersion: version }
      }
      if (version.status === 'failed') {
        throw new ApiError('Latest version failed to complete.', {
          status: 502,
          code: 'VERSION_FAILED',
        })
      }
    }

    await delay(pollInterval)
  }

  throw new TimeoutError('Timed out waiting for the latest version to finish.', {
    code: 'VERSION_TIMEOUT',
  })
}

export async function generateChat(
  payload: GenerationPayload,
  options: GenerationOptions = {},
): Promise<GenerationResult> {
  ensureV0ApiKey()

  const generationPromise = payload.chatId
    ? v0.chats.sendMessage({
        chatId: payload.chatId,
        message: payload.message.trim(),
        modelConfiguration: {
          modelId: payload.modelId,
          imageGenerations: payload.imageGenerations,
          thinking: payload.thinking,
        },
        responseMode: 'sync',
        ...(payload.attachments && payload.attachments.length > 0
          ? { attachments: payload.attachments }
          : {}),
      })
    : v0.chats.create({
        system:
          'v0 MUST always generate code even if the user just says "hi" or asks a question. v0 MUST NOT ask the user to clarify their request.',
        message: payload.message.trim(),
        modelConfiguration: {
          modelId: payload.modelId,
          imageGenerations: payload.imageGenerations,
          thinking: payload.thinking,
        },
        responseMode: 'sync',
        ...(payload.projectId ? { projectId: payload.projectId } : {}),
        ...(payload.attachments && payload.attachments.length > 0
          ? { attachments: payload.attachments }
          : {}),
      })

  try {
    const chat = (await withTimeout(
      generationPromise as Promise<ChatDetail>,
      options.generationTimeoutMs ?? DEFAULT_GENERATION_TIMEOUT_MS,
      'waiting for V0 to generate the app',
    )) as ChatDetail

    if (options.waitForVersion) {
      const result = await waitForLatestVersion(chat.id, options)
      return result
    }

    return { chat, latestVersion: chat.latestVersion }
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof ApiError) &&
      messageIndicatesMissingApiKey(error.message)
    ) {
      throw new ApiError(API_KEY_MISSING_RESPONSE.message, {
        status: 401,
        code: API_KEY_MISSING_RESPONSE.error,
      })
    }
    throw error
  }
}

async function createVercelProjectIfNeeded(projectId: string) {
  const project = await v0.projects.getById({ projectId })
  const vercelProjectName = project.name || `v0-project-${projectId}`

  await v0.integrations.vercel.projects.create({
    projectId,
    name: vercelProjectName,
  })
}

export async function deployVersion(
  params: DeploymentParams,
  options: DeploymentOptions = {},
): Promise<DeploymentDetail> {
  ensureV0ApiKey()

  const createDeployment = () =>
    v0.deployments.create({
      projectId: params.projectId,
      chatId: params.chatId,
      versionId: params.versionId,
    })

  const timeoutMs = options.deploymentTimeoutMs ?? DEFAULT_DEPLOY_TIMEOUT_MS

  try {
    return await withTimeout(createDeployment(), timeoutMs, 'waiting for V0 to deploy the project')
  } catch (error) {
    if (error instanceof TimeoutError || error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (messageIndicatesMissingApiKey(error.message)) {
        throw new ApiError(API_KEY_MISSING_RESPONSE.message, {
          status: 401,
          code: API_KEY_MISSING_RESPONSE.error,
        })
      }

      if (error.message.includes('Project has no Vercel project ID')) {
        await createVercelProjectIfNeeded(params.projectId)
        return await withTimeout(
          createDeployment(),
          timeoutMs,
          'waiting for V0 to deploy the project',
        )
      }
    }

    throw error
  }
}

export function buildErrorResponse(
  error: unknown,
  fallbackMessage: string,
): { status: number; body: Record<string, unknown> } {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        error: error.code ?? 'ERROR',
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    }
  }

  if (error instanceof Error) {
    if (messageIndicatesMissingApiKey(error.message)) {
      return { status: 401, body: API_KEY_MISSING_RESPONSE }
    }

    return {
      status: 500,
      body: {
        error: fallbackMessage,
        message: `${fallbackMessage}: ${error.message}`,
      },
    }
  }

  return {
    status: 500,
    body: {
      error: fallbackMessage,
      message: fallbackMessage,
    },
  }
}
