import { NextResponse } from 'next/server'
import { getTopScores } from '../../lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get('gameType')
    const limit = parseInt(searchParams.get('limit') || '3')
    
    const scores = await getTopScores(limit, gameType ? parseInt(gameType) : undefined)
    return NextResponse.json({ success: true, scores })
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return NextResponse.json(
      { success: false, error: '获取排行榜失败' },
      { status: 500 }
    )
  }
}
