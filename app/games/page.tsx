'use client'
import { useState } from 'react'
import GameSwitcher from './components/GameSwitcher'
import SnakeGame from './components/SnakeGame'
import TetrisGame from './components/TetrisGame'
import Leaderboard from './components/Leaderboard'

export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<'snake' | 'tetris'>('snake')
  const [playerName, setPlayerName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0) // 添加刷新键状态

  const handleChildData = (data: string) => {
    setPlayerName(data);
  };

  // 游戏结束回调，刷新排行榜
  const handleGameEnd = () => {
    setRefreshKey(prev => prev + 1)
  }

 console.info('playerName', playerName.length)
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">游戏中心</h1>
      <GameSwitcher
        currentGame={currentGame}
        onSwitch={setCurrentGame}
        onSendData={handleChildData}
      />
     
      {playerName.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentGame === 'snake' ? (
              <SnakeGame playerName={playerName} onGameEnd={handleGameEnd} />
            ) : (
              <TetrisGame playerName={playerName} onGameEnd={handleGameEnd} />
            )}
          </div>
          <div className="lg:col-span-1">
            <Leaderboard 
              gameType={currentGame === 'snake' ? 1 : 2} 
              gameName={currentGame === 'snake' ? '贪吃蛇' : '俄罗斯方块'} 
              refreshKey={refreshKey}
            />
          </div>
        </div>
      )}
    </div>
  )
}
