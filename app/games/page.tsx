'use client'
import { useState } from 'react'
import { GameType } from './types'
import GameSwitcher from './components/GameSwitcher'
import SnakeGame from './components/SnakeGame'
import TetrisGame from './components/TetrisGame'

export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<'snake' | 'tetris'>('snake')
  const [playerName, setPlayerName] = useState('')

  const handleChildData = (data: string) => {
    setPlayerName(data);
  };

 console.info('playerName', playerName.length)
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">游戏中心</h1>
      <GameSwitcher
        currentGame={currentGame}
        onSwitch={setCurrentGame}
        onSendData={handleChildData}
      />
     
      (playerName.length && <div className="mt-8">
        {currentGame === 'snake' ? (
          <SnakeGame playerName={playerName} />
        ) : (
          <TetrisGame playerName={playerName} />
        )}
      </div>)
    </div>
  )
}
