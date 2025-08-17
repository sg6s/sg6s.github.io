'use client'
import { useEffect, useState } from 'react'

interface Score {
  player_name: string
  score: number
  game_type: number
}

interface LeaderboardProps {
  gameType: number
  gameName: string
  refreshKey?: number // 添加刷新键
}

export default function Leaderboard({ gameType, gameName, refreshKey }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?gameType=${gameType}&limit=3`)
      const data = await response.json()
      
      if (data.success) {
        setScores(data.scores)
      } else {
        setError('获取排行榜失败')
      }
    } catch (error) {
      setError('获取排行榜失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [gameType, refreshKey])

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `${index + 1}.`
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">排行榜</h3>
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">排行榜</h3>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{gameName}排行榜</h3>
      {scores.length === 0 ? (
        <div className="text-gray-500">暂无记录</div>
      ) : (
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMedal(index)}</span>
                <span className="font-medium text-gray-800">{score.player_name}</span>
              </div>
              <span className="font-bold text-blue-600">{score.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
