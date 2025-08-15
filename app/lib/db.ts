import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_lgQX2k5OoGPh@ep-royal-breeze-aeyolhgv-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
})

export async function saveScore(playerName: string, score: number) {
  const client = await pool.connect()
  try {
    await client.query(
      'INSERT INTO play_score (player_name, score) VALUES ($1, $2)',
      [playerName, score]
    )
  } finally {
    client.release()
  }
}

export async function getTopScores(limit = 10) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      'SELECT player_name, score FROM play_score ORDER BY score DESC LIMIT $1',
      [limit]
    )
    return res.rows
  } finally {
    client.release()
  }
}
