'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 30

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
]

interface TetrisGameProps {
  playerName: string;
  onGameEnd?: () => void; // 添加游戏结束回调
}

const saveScore = async (playerName: string, score: number) => {
  if (!playerName) return

  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerName,
        score,
        gameType: 2 // 俄罗斯方块游戏类型
      }),
    })

    if (!response.ok) {
      throw new Error('保存分数失败')
    }
  } catch (error) {
    console.error('保存分数失败:', error)
  }
}

export default function TetrisGame(props: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const [score, setScore] = useState(0)
  const [gameSpeed, setGameSpeed] = useState(1000)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [hasStartedOnce, setHasStartedOnce] = useState(false)

  const boardRef = useRef<number[][]>(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)))
  const currentPieceRef = useRef({
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    x: Math.floor(COLS / 2) - 1,
    y: 0
  })

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制已固定的方块
    boardRef.current.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = '#333'
          ctx.fillRect(x * (canvas.width / COLS), y * (canvas.height / ROWS),
            canvas.width / COLS, canvas.height / ROWS)
          ctx.strokeStyle = '#fff'
          ctx.strokeRect(x * (canvas.width / COLS), y * (canvas.height / ROWS),
            canvas.width / COLS, canvas.height / ROWS)
        }
      })
    })

    // 绘制当前移动的方块
    const { shape, x, y } = currentPieceRef.current
    shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          ctx.fillStyle = '#ff5252'
          ctx.fillRect(
            (x + dx) * (canvas.width / COLS),
            (y + dy) * (canvas.height / ROWS),
            canvas.width / COLS,
            canvas.height / ROWS
          )
          ctx.strokeStyle = '#fff'
          ctx.strokeRect(
            (x + dx) * (canvas.width / COLS),
            (y + dy) * (canvas.height / ROWS),
            canvas.width / COLS,
            canvas.height / ROWS
          )
        }
      })
    })
  }, [])

  const checkCollision = useCallback((x: number, y: number, shape: number[][]) => {
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (
          shape[dy][dx] &&
          (x + dx < 0 ||
            x + dx >= COLS ||
            y + dy >= ROWS ||
            (y + dy >= 0 && boardRef.current[y + dy][x + dx]))
        ) {
          return true
        }
      }
    }
    return false
  }, [])

  const moveDown = useCallback(() => {
    if (!gameStarted || gameOver) return

    const { shape, x, y } = currentPieceRef.current
    if (!checkCollision(x, y + 1, shape)) {
      currentPieceRef.current.y++
    } else {
      // 合并方块到棋盘
      shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value && y + dy >= 0) {
            boardRef.current[y + dy][x + dx] = 1
          }
        })
      })

      // 清除完整的行
      let linesCleared = 0
      for (let y = ROWS - 1; y >= 0; y--) {
        if (boardRef.current[y].every(cell => cell)) {
          boardRef.current.splice(y, 1)
          boardRef.current.unshift(Array(COLS).fill(0))
          linesCleared++
          y++
        }
      }
      if (linesCleared > 0) {
        // 新的得分逻辑：一次消除4行给500分，低于4行则消除一行给100分
        let scoreToAdd = 0
        if (linesCleared >= 4) {
          scoreToAdd = 500
        } else {
          scoreToAdd = linesCleared * 100
        }
        setScore(prev => prev + scoreToAdd)
        setGameSpeed(prev => Math.max(100, prev - linesCleared * 50))
      }

      // 生成新方块
      currentPieceRef.current = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        x: Math.floor(COLS / 2) - 1,
        y: 0
      }

             // 检查游戏结束
       if (checkCollision(currentPieceRef.current.x, currentPieceRef.current.y, currentPieceRef.current.shape)) {
         setGameOver(true)
         saveScore(props.playerName, score)
         setGameStarted(false)
         // 通知父组件游戏结束，更新排行榜
         if (props.onGameEnd) {
           props.onGameEnd()
         }
       }
    }
    drawBoard()
  }, [gameStarted, gameOver, checkCollision, drawBoard, props.playerName, score])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setHasStartedOnce(true)
    setScore(0)
    setGameSpeed(1000)
    boardRef.current = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
    currentPieceRef.current = {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      x: Math.floor(COLS / 2) - 1,
      y: 0
    }
    drawBoard()
  }, [drawBoard])

  const pauseGame = useCallback(() => {
    setGameStarted(false)
  }, [])

  const continueGame = useCallback(() => {
    setGameStarted(true)
  }, [])

  const resetGame = useCallback(() => {
    setGameStarted(true) // 直接开始游戏
    setGameOver(false)
    setScore(0)
    setGameSpeed(1000)
    boardRef.current = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
    currentPieceRef.current = {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      x: Math.floor(COLS / 2) - 1,
      y: 0
    }
    drawBoard()
  }, [drawBoard])

  // 初始化游戏和事件监听
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 调整画布大小
    const updateCanvasSize = () => {
      const maxHeight = window.innerHeight * 0.7
      const blockSize = Math.min(BLOCK_SIZE, Math.floor(maxHeight / ROWS))
      canvas.width = COLS * blockSize
      canvas.height = ROWS * blockSize
      drawBoard()
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // 键盘控制
    const handleKeyDown = (e: KeyboardEvent) => {
      const { shape, x, y } = currentPieceRef.current
      switch (e.key) {
        case 'ArrowLeft':
          if (gameStarted && !gameOver && !checkCollision(x - 1, y, shape)) {
            currentPieceRef.current.x--
            drawBoard()
          }
          break
        case 'ArrowRight':
          if (gameStarted && !gameOver && !checkCollision(x + 1, y, shape)) {
            currentPieceRef.current.x++
            drawBoard()
          }
          break
        case 'ArrowDown':
          if (gameStarted && !gameOver) {
            moveDown()
          }
          break
        case 'ArrowUp':
          if (gameStarted && !gameOver) {
            const newShape = shape[0].map((_, i) =>
              shape.map(row => row[i]).reverse()
            )
            if (!checkCollision(x, y, newShape)) {
              currentPieceRef.current.shape = newShape
              drawBoard()
            }
          }
          break
        case ' ':
          e.preventDefault()
          if (gameOver) {
            resetGame()
          } else if (!gameStarted && !hasStartedOnce) {
            startGame()
          } else if (!gameStarted && hasStartedOnce) {
            continueGame()
          } else if (gameStarted) {
            pauseGame()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // 游戏主循环
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, gameSpeed)
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('keydown', handleKeyDown)
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [moveDown, gameSpeed, drawBoard, checkCollision, gameStarted, gameOver, startGame, pauseGame, continueGame, resetGame])

  // 更新游戏循环速度
  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      gameLoopRef.current = setInterval(moveDown, gameSpeed)
    }
  }, [gameSpeed, gameStarted, gameOver, moveDown])

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">俄罗斯方块</h2>

      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-800">玩家: {props.playerName}</span>
        <span className="font-semibold text-gray-800">分数: {score}</span>
      </div>

      {gameOver && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
          游戏结束！最终分数: {score}
        </div>
      )}

             <div className="flex justify-center gap-2 mb-4">
         {!gameStarted && !gameOver && !hasStartedOnce && (
           <button
             onClick={startGame}
             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
           >
             开始游戏
           </button>
         )}
         {!gameStarted && !gameOver && hasStartedOnce && (
           <button
             onClick={continueGame}
             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
           >
             继续游戏
           </button>
         )}
         {gameStarted && !gameOver && (
           <button
             onClick={pauseGame}
             className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
           >
             暂停
           </button>
         )}
         {gameOver && (
           <button
             onClick={resetGame}
             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
           >
             重新开始
           </button>
         )}
       </div>

      <div id="play-pannel" className="flex-1 w-full min-h-[400px]">
        <div className="h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-300"
            style={{ height: 'calc(100% - 20px)', width: '300px' }}
          />
        </div>
      </div>
      
      <p className="mt-4 text-gray-800">
        使用方向键控制: ↑旋转 ←→移动 ↓加速下落<br/>
        空格键: {gameOver ? '重新开始' : !gameStarted && !hasStartedOnce ? '开始游戏' : !gameStarted && hasStartedOnce ? '继续游戏' : '暂停'}
      </p>
    </div>
  )
}
