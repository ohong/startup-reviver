import { NextRequest, NextResponse } from 'next/server'

import {
  API_KEY_MISSING_RESPONSE,
  buildErrorResponse,
  generateChat,
} from '../_lib/v0'

export async function POST(request: NextRequest) {
  if (!process.env.V0_API_KEY) {
    return NextResponse.json(API_KEY_MISSING_RESPONSE, { status: 401 })
  }

  try {
    const {
      message,
      chatId,
      projectId,
      modelId = 'v0-1.5-md',
      imageGenerations = false,
      thinking = false,
      attachments = [],
    } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 },
      )
    }

    const { chat } = await generateChat(
      {
        message,
        chatId,
        projectId,
        modelId,
        imageGenerations,
        thinking,
        attachments,
      },
      { waitForVersion: false },
    )

    return NextResponse.json(chat)
  } catch (error) {
    const { status, body } = buildErrorResponse(error, 'Failed to generate app')
    return NextResponse.json(body, { status })
  }
}
