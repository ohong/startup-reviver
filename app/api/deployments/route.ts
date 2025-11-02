import { NextRequest, NextResponse } from 'next/server'

import {
  API_KEY_MISSING_RESPONSE,
  buildErrorResponse,
  deployVersion,
} from '../_lib/v0'

export async function POST(request: NextRequest) {
  if (!process.env.V0_API_KEY) {
    return NextResponse.json(API_KEY_MISSING_RESPONSE, { status: 401 })
  }

  try {
    const { projectId, chatId, versionId } = await request.json()

    if (!projectId || !chatId || !versionId) {
      return NextResponse.json(
        {
          error: 'projectId, chatId, and versionId are required',
          details: {
            projectId: Boolean(projectId),
            chatId: Boolean(chatId),
            versionId: Boolean(versionId),
          },
        },
        { status: 400 },
      )
    }

    const result = await deployVersion({ projectId, chatId, versionId })
    return NextResponse.json(result)
  } catch (error) {
    const { status, body } = buildErrorResponse(
      error,
      'Failed to create deployment',
    )
    return NextResponse.json(body, { status })
  }
}
