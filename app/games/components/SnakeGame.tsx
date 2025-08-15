'use client'
import { useEffect, useRef, useState } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20

interface SnakeGameProps {
  playerName: string;
}

export default function SnakeGame(props: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  const snakeRef = useRef<{ x: number, y: number }[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const foodRef = useRef({ x: 5, y: 5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    canvas.width = GRID_SIZE * CELL_SIZE
    canvas.height = GRID_SIZE * CELL_SIZE

    // 初始化游戏
    const initGame = () => {
      snakeRef.current = [{ x: 10, y: 10 }]
      directionRef.current = 'RIGHT'
      foodRef.current = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
      drawGame()
    }

    // 确保食物不会出现在蛇身上
    while (snakeRef.current.some(segment =>
      segment.x === foodRef.current.x && segment.y === foodRef.current.y)) {
      foodRef.current = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    }

    // 绘制游戏
    const drawGame = () => {
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

          // 蛇眼
          ctx.fillStyle = 'white'
          ctx.beginPath()
          ctx.arc(
            segment.x * CELL_SIZE + CELL_SIZE / 3,
            segment.y * CELL_SIZE + CELL_SIZE / 3,
            CELL_SIZE / 8,
            0,
            Math.PI * 2
          )
          ctx.arc(
            segment.x * CELL_SIZE + CELL_SIZE * 2 / 3,
            segment.y * CELL_SIZE + CELL_SIZE / 3,
            CELL_SIZE / 8,
            0,
            Math.PI * 2
          )
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
    }

    // 游戏循环
    const gameLoop = (timestamp: number) => {
      console.info('gameLoop')
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

        // 检查碰撞
        if (
          head.x < 0 || head.x >= GRID_SIZE ||
          head.y < 0 || head.y >= GRID_SIZE ||
          snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          saveScore(snakeRef.current.length - 1)
          initGame()
          return
        }

        // 检查是否吃到食物
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          // 生成新食物
          foodRef.current = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          }
        } else {
          // 移除蛇尾
          snakeRef.current.pop()
        }

        // 添加新头部
        snakeRef.current.unshift(head)
        drawGame()
      }

      // 确保游戏循环继续运行
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // 键盘控制
    const handleKeyDown = (e: KeyboardEvent) => {

      console.info('e.key:', e.key)
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
    }

    // 确保canvas获得焦点
    canvas.focus()
    window.addEventListener('keydown', handleKeyDown)

    // 强制初始化游戏并立即开始
    initGame()
    lastMoveTimeRef.current = performance.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)

    // 立即开始游戏循环
    const startLoop = () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    startLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [])

  const [playerName, setPlayerName] = useState('')
  const [score, setScore] = useState(0)

  const drawGame = () => {
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

        // 蛇眼
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(
          segment.x * CELL_SIZE + CELL_SIZE / 3,
          segment.y * CELL_SIZE + CELL_SIZE / 3,
          CELL_SIZE / 8,
          0,
          Math.PI * 2
        )
        ctx.arc(
          segment.x * CELL_SIZE + CELL_SIZE * 2 / 3,
          segment.y * CELL_SIZE + CELL_SIZE / 3,
          CELL_SIZE / 8,
          0,
          Math.PI * 2
        )
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
  }

  useEffect(() => {
    // 自动开始游戏
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // 重置游戏状态
        snakeRef.current = [{ x: 10, y: 10 }]
        directionRef.current = 'RIGHT'
        foodRef.current = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        }

        // 确保食物不在蛇身上
        while (snakeRef.current.some(segment =>
          segment.x === foodRef.current.x && segment.y === foodRef.current.y)) {
          foodRef.current = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          }
        }

        // 绘制初始状态
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'darkgreen'
        ctx.fillRect(
          snakeRef.current[0].x * CELL_SIZE,
          snakeRef.current[0].y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        )
        ctx.fillStyle = 'red'
        ctx.fillRect(
          foodRef.current.x * CELL_SIZE,
          foodRef.current.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        )

        // 开始游戏循环
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current)
        }
        const gameLoop = () => {
          // 更新蛇的位置
          const head = { ...snakeRef.current[0] }
          switch (directionRef.current) {
            case 'UP': head.y -= 1; break
            case 'DOWN': head.y += 1; break
            case 'LEFT': head.x -= 1; break
            case 'RIGHT': head.x += 1; break
          }
          console.log('directionRef.current:', directionRef.current)

          // 检查碰撞
          if (
            head.x < 0 || head.x >= GRID_SIZE ||
            head.y < 0 || head.y >= GRID_SIZE ||
            snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)
          ) {
            saveScore(snakeRef.current.length - 1)
            // 5秒后自动重启游戏
            setTimeout(() => {
              snakeRef.current = [{ x: 10, y: 10 }]
              directionRef.current = 'RIGHT'
              foodRef.current = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
              }
              drawGame()
            }, 5000)
            return
          }

          // 检查是否吃到食物
          if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
            // 生成新食物
            foodRef.current = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE)
            }
            setScore(prev => prev + 10) // 每次吃到食物加10分
          } else {
            // 移除蛇尾
            snakeRef.current.pop()
          }

          // 添加新头部
          snakeRef.current.unshift(head)

          // 绘制游戏
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = 'darkgreen'
          ctx.fillRect(
            snakeRef.current[0].x * CELL_SIZE,
            snakeRef.current[0].y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          )
          ctx.fillStyle = 'green'
          snakeRef.current.slice(1).forEach(segment => {
            ctx.fillRect(
              segment.x * CELL_SIZE,
              segment.y * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            )
          })
          ctx.fillStyle = 'red'
          ctx.fillRect(
            foodRef.current.x * CELL_SIZE,
            foodRef.current.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          )

          gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
        console.info('Starting game loop')
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
      canvas.focus()
    }
  }, [])

  const saveScore = async (score: number) => {
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

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">贪吃蛇游戏</h2>

      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-800">玩家: {props.playerName}</span>
        <span className="font-semibold text-gray-800">分数: {score}</span>
      </div>

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
          <li>吃到红色食物会增加长度</li>
          <li>撞到墙壁或自身游戏会重置</li>
        </ul>
      </div>
    </div>
  )
}
