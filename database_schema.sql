-- 游戏分数表 DDL 语句
-- 如果表已存在，先删除
DROP TABLE IF EXISTS play_score;

-- 创建新的 play_score 表
CREATE TABLE play_score (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    game_type INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_play_score_game_type ON play_score(game_type);
CREATE INDEX idx_play_score_score ON play_score(score DESC);
CREATE INDEX idx_play_score_player_name ON play_score(player_name);

-- 添加注释
COMMENT ON TABLE play_score IS '游戏分数记录表';
COMMENT ON COLUMN play_score.id IS '主键ID';
COMMENT ON COLUMN play_score.player_name IS '玩家姓名';
COMMENT ON COLUMN play_score.score IS '游戏分数';
COMMENT ON COLUMN play_score.game_type IS '游戏类型：1=贪吃蛇，2=俄罗斯方块';
COMMENT ON COLUMN play_score.created_at IS '创建时间';

-- 插入一些测试数据（可选）
INSERT INTO play_score (player_name, score, game_type) VALUES 
('测试玩家1', 100, 1),
('测试玩家2', 200, 1),
('测试玩家3', 150, 2),
('测试玩家4', 300, 2);
