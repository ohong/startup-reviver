import { NextRequest, NextResponse } from 'next/server'

import { placeOutboundCall } from '@/lib/livekit'

type OutboundCallRequest = {
  to: string
  fromNumber?: string
  roomName?: string
  questions?: string[]
  agentName?: string
  waitUntilAnswered?: boolean
  recipientName?: string
  rowIndex?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OutboundCallRequest
    const {
      to,
      fromNumber,
      roomName,
      questions,
      agentName,
      waitUntilAnswered,
      recipientName,
      rowIndex,
    } = body

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: 'TO_NUMBER_REQUIRED', message: '`to` phone number is required' },
        { status: 400 },
      )
    }

    const { roomName: createdRoom, sipParticipant } = await placeOutboundCall({
      to,
      fromNumber,
      roomName,
      questions,
      agentName,
      waitUntilAnswered,
      recipientName,
      rowIndex,
    })

    return NextResponse.json({
      roomName: createdRoom,
      participant: sipParticipant,
      metadata: {
        to,
        phone_number: to,
        fromNumber,
        recipient_name: recipientName,
        row_index: rowIndex,
        questions,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'CALL_FAILED', message }, { status: 500 })
  }
}
