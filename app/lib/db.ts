import { Pool } from 'pg'

// 从环境变量获取数据库连接信息
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lgQX2k5OoGPh@ep-royal-breeze-aeyolhgv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString,
  // 添加连接池配置
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// 测试数据库连接
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err)
})

export async function saveScore(playerName: string, score: number, gameType: number = 1) {
  let retries = 3
  while (retries > 0) {
    const client = await pool.connect()
    try {
      await client.query(
        'INSERT INTO play_score (player_name, score, game_type) VALUES ($1, $2, $3)',
        [playerName, score, gameType]
      )
      return // 成功则直接返回
    } catch (error) {
      console.error(`保存分数失败 (重试 ${4-retries}/3):`, error)
      retries--
      if (retries === 0) {
        throw error
      }
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      client.release()
    }
  }
}

export async function getTopScores(limit = 10, gameType?: number) {
  const client = await pool.connect()
  try {
    let query = 'SELECT player_name, score, game_type FROM play_score'
    const params: (string | number)[] = []
    
    if (gameType !== undefined) {
      query += ' WHERE game_type = $1'
      params.push(gameType)
    }
    
    query += ' ORDER BY score DESC LIMIT $' + (params.length + 1)
    params.push(limit)
    
    const res = await client.query(query, params)
    return res.rows
  } catch (error) {
    console.error('获取排行榜失败:', error)
    throw error
  } finally {
    client.release()
  }
}

// 初始化数据库表（如果不存在）
export async function initDatabase() {
  const client = await pool.connect()
  try {
    // 检查表是否存在
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'play_score'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      // 创建新表
      await client.query(`
        CREATE TABLE play_score (
          id SERIAL PRIMARY KEY,
          player_name VARCHAR(100) NOT NULL,
          score INTEGER NOT NULL,
          game_type INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
    } else {
      // 检查是否需要添加game_type字段
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'play_score' AND column_name = 'game_type'
        )
      `)
      
      if (!columnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE play_score ADD COLUMN game_type INTEGER DEFAULT 1
        `)
      }
    }
  } catch (error) {
    console.error('初始化数据库失败:', error)
    throw error
  } finally {
    client.release()
  }
}
