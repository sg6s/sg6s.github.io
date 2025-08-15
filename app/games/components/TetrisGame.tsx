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
}

const saveScore = async (playerName: string, score: number) => {
  console.info('score', playerName, score)
  if (!playerName) return

  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerName,
        score
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
  console.info('input', props)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const [score, setScore] = useState(0)
  const [gameSpeed, setGameSpeed] = useState(500)
  const [gameStarted, setGameStarted] = useState(false)



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
        setScore(prev => prev + linesCleared * 100)
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
        if (props.playerName) {
          saveScore(props.playerName, score)
        }
        setGameStarted(false)
        setScore(0)
        setGameSpeed(1000)
        boardRef.current = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
        currentPieceRef.current = {
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          x: Math.floor(COLS / 2) - 1,
          y: 0
        }
        drawBoard()
        boardRef.current = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
        setScore(0)
        setGameSpeed(1000)
      }
    }
    drawBoard()
  }, [score,checkCollision, drawBoard])

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
          if (!checkCollision(x - 1, y, shape)) currentPieceRef.current.x--
          break
        case 'ArrowRight':
          if (!checkCollision(x + 1, y, shape)) currentPieceRef.current.x++
          break
        case 'ArrowDown':
          moveDown()
          break
        case 'ArrowUp':
          const newShape = shape[0].map((_, i) =>
            shape.map(row => row[i]).reverse()
          )
          if (!checkCollision(x, y, newShape)) {
            currentPieceRef.current.shape = newShape
          }
          break
      }
      drawBoard()
    }

    window.addEventListener('keydown', handleKeyDown)

    // 游戏主循环
    gameLoopRef.current = setInterval(moveDown, gameSpeed)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('keydown', handleKeyDown)
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [moveDown, gameSpeed, drawBoard, checkCollision])

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">俄罗斯方块</h2>

      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-800">玩家: {props.playerName}</span>
        <span className="font-semibold text-gray-800">分数: {score}</span>
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
        使用方向键控制: ↑旋转 ←→移动 ↓加速下落
      </p>
    </div>
  )
}
