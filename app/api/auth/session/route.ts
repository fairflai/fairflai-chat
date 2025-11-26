import { NextResponse } from 'next/server'
import { verifyAccessCode, createSession } from '@/lib/security/access-control'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || !verifyAccessCode(code)) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      )
    }

    const sessionId = createSession()
    return NextResponse.json({ sessionId })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
