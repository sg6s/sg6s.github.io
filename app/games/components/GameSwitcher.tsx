'use client'
import { useState } from 'react'
type GameType = 'snake' | 'tetris'

type GameSwitcherProps = {
  currentGame: GameType
  onSwitch: (game: GameType) => void
  onSendData: (data: string) => void;
}

export default function GameSwitcher({ currentGame, onSwitch, onSendData }: GameSwitcherProps) {
  const [showNameInput, setShowNameInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowNameInput(e.target.value);
  };

  const handleSubmit = () => {
    if (showNameInput.trim()) {
      setSubmitted(true)
      onSendData(showNameInput)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!submitted && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={showNameInput}
            onChange={handleChange} 
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="玩家姓名"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            提交
          </button>
        </div>
      )}
      <div className="flex justify-center gap-4">
      <button
        onClick={() => onSwitch('snake')}
        className={`px-4 py-2 rounded-l-lg font-medium ${currentGame === 'snake' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        贪吃蛇
      </button>
      <button
        onClick={() => onSwitch('tetris')}
        className={`px-4 py-2 rounded-r-lg font-medium ${currentGame === 'tetris' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        俄罗斯方块
      </button>
      </div>
    </div>
  )
}
