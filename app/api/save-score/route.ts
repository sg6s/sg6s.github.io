import { NextResponse } from 'next/server'
import { saveScore } from '../../lib/db'

export async function POST(request: Request) {
  try {
    const { playerName, score, gameType = 1 } = await request.json()
    await saveScore(playerName, score, gameType)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('保存分数失败:', error)
    return NextResponse.json(
      { success: false, error: '保存分数失败' },
      { status: 500 }
    )
  }
}
