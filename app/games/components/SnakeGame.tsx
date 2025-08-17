'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20

interface SnakeGameProps {
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
        gameType: 1 // 贪吃蛇游戏类型
      }),
    })

    if (!response.ok) {
      throw new Error('保存分数失败')
    }
  } catch (error) {
    console.error('保存分数失败:', error)
  }
}

export default function SnakeGame(props: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  
  const snakeRef = useRef<{ x: number, y: number }[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const foodRef = useRef({ x: 5, y: 5 })

  // 绘制游戏
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制蛇
    snakeRef.current.forEach((segment, index) => {
      // 蛇头
      if (index === 0) {
        ctx.fillStyle = 'darkgreen'
        ctx.beginPath()
        ctx.arc(
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // 根据方向绘制蛇眼
        ctx.fillStyle = 'white'
        ctx.beginPath()
        
        const eyeSize = CELL_SIZE / 8
        
        switch (directionRef.current) {
          case 'RIGHT':
            // 眼睛在右侧
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE * 3 / 4,
              segment.y * CELL_SIZE + CELL_SIZE / 3,
              eyeSize, 0, Math.PI * 2
            )
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE * 3 / 4,
              segment.y * CELL_SIZE + CELL_SIZE * 2 / 3,
              eyeSize, 0, Math.PI * 2
            )
            break
          case 'LEFT':
            // 眼睛在左侧
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE / 4,
              segment.y * CELL_SIZE + CELL_SIZE / 3,
              eyeSize, 0, Math.PI * 2
            )
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE / 4,
              segment.y * CELL_SIZE + CELL_SIZE * 2 / 3,
              eyeSize, 0, Math.PI * 2
            )
            break
          case 'UP':
            // 眼睛在上方
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE / 3,
              segment.y * CELL_SIZE + CELL_SIZE / 4,
              eyeSize, 0, Math.PI * 2
            )
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE * 2 / 3,
              segment.y * CELL_SIZE + CELL_SIZE / 4,
              eyeSize, 0, Math.PI * 2
            )
            break
          case 'DOWN':
            // 眼睛在下方
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE / 3,
              segment.y * CELL_SIZE + CELL_SIZE * 3 / 4,
              eyeSize, 0, Math.PI * 2
            )
            ctx.arc(
              segment.x * CELL_SIZE + CELL_SIZE * 2 / 3,
              segment.y * CELL_SIZE + CELL_SIZE * 3 / 4,
              eyeSize, 0, Math.PI * 2
            )
            break
        }
        ctx.fill()
      }
      // 蛇身
      else {
        ctx.fillStyle = 'green'
        ctx.fillRect(
          segment.x * CELL_SIZE,
          segment.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        )
      }
    })

    // 绘制食物
    ctx.fillStyle = 'red'
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    )
  }, [])

  // 初始化游戏
  const initGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }]
    directionRef.current = 'RIGHT'
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setScore(0)
    setGameOver(false)
    
    // 确保食物不会出现在蛇身上
    while (snakeRef.current.some(segment =>
      segment.x === foodRef.current.x && segment.y === foodRef.current.y)) {
      foodRef.current = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    }
    
    drawGame()
  }, [drawGame])

  // 游戏结束处理
  const handleGameOver = useCallback(() => {
    setGameOver(true)
    saveScore(props.playerName, score)
    
    // 通知父组件游戏结束，更新排行榜
    if (props.onGameEnd) {
      props.onGameEnd()
    }
    
    // 3秒后自动重启游戏
    setTimeout(() => {
      initGame()
    }, 3000)
  }, [props.playerName, score, initGame, props.onGameEnd])

  // 游戏循环
  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver) return
    
    // 控制游戏速度 (200ms移动一次)
    if (!lastMoveTimeRef.current || timestamp - lastMoveTimeRef.current > 200) {
      lastMoveTimeRef.current = timestamp

      // 更新蛇的位置
      const head = { ...snakeRef.current[0] }
      switch (directionRef.current) {
        case 'UP': head.y -= 1; break
        case 'DOWN': head.y += 1; break
        case 'LEFT': head.x -= 1; break
        case 'RIGHT': head.x += 1; break
      }

      // 检查是否吃到食物
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        // 吃到食物，不移除蛇尾，蛇身会增长
        setScore(prev => prev + 10) // 每次吃到食物加10分
        
        // 生成新食物
        let newFood: { x: number, y: number }
        do {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          }
        } while (snakeRef.current.some(segment =>
          segment.x === newFood.x && segment.y === newFood.y))
        
        foodRef.current = newFood
      } else {
        // 没吃到食物，移除蛇尾
        snakeRef.current.pop()
      }

      // 添加新头部
      snakeRef.current.unshift(head)

      // 检查碰撞（在添加新头部之后检查）
      if (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        snakeRef.current.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        handleGameOver()
        return
      }
      drawGame()
    }

    // 继续游戏循环
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameOver, handleGameOver, drawGame])

  // 键盘控制
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return
    
    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current !== 'DOWN') directionRef.current = 'UP'
        break
      case 'ArrowDown':
        if (directionRef.current !== 'UP') directionRef.current = 'DOWN'
        break
      case 'ArrowLeft':
        if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'
        break
      case 'ArrowRight':
        if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'
        break
    }
  }, [gameOver])

  // 初始化游戏和事件监听
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置画布大小
    canvas.width = GRID_SIZE * CELL_SIZE
    canvas.height = GRID_SIZE * CELL_SIZE

    // 初始化游戏
    initGame()

    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)

    // 开始游戏循环
    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [initGame, handleKeyDown, gameLoop])

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">贪吃蛇游戏</h2>

      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-800">玩家: {props.playerName}</span>
        <span className="font-semibold text-gray-800">分数: {score}</span>
      </div>

      {gameOver && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          游戏结束！3秒后自动重启...
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-2 border-gray-300 w-full outline-none"
        tabIndex={0}
      />

      <div className="mt-4 text-gray-800">
        <p className="font-semibold">操作说明:</p>
        <ul className="list-disc pl-5">
          <li>方向键 ↑↓←→ 控制蛇的移动</li>
          <li>吃到红色食物会增加长度和分数</li>
          <li>撞到墙壁或自身游戏会结束</li>
        </ul>
      </div>
    </div>
  )
}
