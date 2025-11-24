import pkg from 'pg';
const { Pool } = pkg;

class Database {
  constructor() {
    this.pool = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não configurada. Defina a variável de ambiente para conectar ao PostgreSQL.');
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      await this.pool.query('SELECT NOW()');
      console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!');
      this.initialized = true;
      await this.createTables();
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      throw error;
    }
  }

  async createTables() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(20) NOT NULL,
          guild_id VARCHAR(20) NOT NULL,
          chat_xp INTEGER DEFAULT 0,
          chat_level INTEGER DEFAULT 0,
          voice_xp INTEGER DEFAULT 0,
          voice_level INTEGER DEFAULT 0,
          messages INTEGER DEFAULT 0,
          voice_time INTEGER DEFAULT 0,
          last_message_time BIGINT DEFAULT 0,
          last_daily_time BIGINT DEFAULT 0,
          daily_streak INTEGER DEFAULT 0,
          coins INTEGER DEFAULT 0,
          pets JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, guild_id)
        );

        CREATE TABLE IF NOT EXISTS guild_configs (
          id SERIAL PRIMARY KEY,
          guild_id VARCHAR(20) UNIQUE NOT NULL,
          welcome_channel_id VARCHAR(20),
          level_up_channel_id VARCHAR(20),
          chat_role_rewards JSONB DEFAULT '[]',
          voice_role_rewards JSONB DEFAULT '[]',
          shop_items JSONB DEFAULT '[]',
          role_buttons JSONB DEFAULT '[]',
          select_menus JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS voice_tracking (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(20) NOT NULL,
          guild_id VARCHAR(20) NOT NULL,
          start_time BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, guild_id)
        );

        CREATE INDEX IF NOT EXISTS idx_users_guild ON users(guild_id);
        CREATE INDEX IF NOT EXISTS idx_users_user_guild ON users(user_id, guild_id);
        CREATE INDEX IF NOT EXISTS idx_voice_tracking_user_guild ON voice_tracking(user_id, guild_id);
      `);
      
      console.log('✅ Tabelas do banco de dados criadas/verificadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabelas:', error.message);
      throw error;
    }
  }

  async getUser(guildId, userId) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );

      if (result.rows.length === 0) {
        await this.pool.query(
          'INSERT INTO users (user_id, guild_id) VALUES ($1, $2)',
          [userId, guildId]
        );
        return {
          userId,
          guildId,
          chatXP: 0,
          chatLevel: 0,
          voiceXP: 0,
          voiceLevel: 0,
          messages: 0,
          voiceTime: 0,
          lastMessageTime: 0,
          lastDailyTime: 0,
          dailyStreak: 0,
          coins: 0,
          pets: []
        };
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        guildId: row.guild_id,
        chatXP: row.chat_xp,
        chatLevel: row.chat_level,
        voiceXP: row.voice_xp,
        voiceLevel: row.voice_level,
        messages: row.messages,
        voiceTime: row.voice_time,
        lastMessageTime: row.last_message_time,
        lastDailyTime: row.last_daily_time,
        dailyStreak: row.daily_streak,
        coins: row.coins,
        pets: row.pets || []
      };
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }

  async updateUser(guildId, userId, data) {
    try {
      const user = await this.getUser(guildId, userId);
      const merged = { ...user, ...data };

      await this.pool.query(
        `UPDATE users SET 
          chat_xp = $1, chat_level = $2, voice_xp = $3, voice_level = $4,
          messages = $5, voice_time = $6, last_message_time = $7,
          last_daily_time = $8, daily_streak = $9, coins = $10, pets = $11,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $12 AND guild_id = $13`,
        [
          merged.chatXP, merged.chatLevel, merged.voiceXP, merged.voiceLevel,
          merged.messages, merged.voiceTime, merged.lastMessageTime,
          merged.lastDailyTime, merged.dailyStreak, merged.coins,
          JSON.stringify(merged.pets), userId, guildId
        ]
      );

      return merged;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async addChatXP(guildId, userId, amount) {
    const user = await this.getUser(guildId, userId);
    return this.updateUser(guildId, userId, { chatXP: user.chatXP + amount });
  }

  async addVoiceXP(guildId, userId, amount) {
    const user = await this.getUser(guildId, userId);
    return this.updateUser(guildId, userId, {
      voiceXP: user.voiceXP + amount,
      voiceTime: user.voiceTime + (amount / 10) * 60000
    });
  }

  async getChatLeaderboard(guildId, limit = 10) {
    try {
      const result = await this.pool.query(
        'SELECT user_id, chat_xp FROM users WHERE guild_id = $1 ORDER BY chat_xp DESC LIMIT $2',
        [guildId, limit]
      );

      return result.rows.map(row => ({
        userId: row.user_id,
        guildId,
        chatXP: row.chat_xp
      }));
    } catch (error) {
      console.error('Erro ao obter leaderboard de chat:', error);
      return [];
    }
  }

  async getVoiceLeaderboard(guildId, limit = 10) {
    try {
      const result = await this.pool.query(
        'SELECT user_id, voice_xp FROM users WHERE guild_id = $1 ORDER BY voice_xp DESC LIMIT $2',
        [guildId, limit]
      );

      return result.rows.map(row => ({
        userId: row.user_id,
        guildId,
        voiceXP: row.voice_xp
      }));
    } catch (error) {
      console.error('Erro ao obter leaderboard de voice:', error);
      return [];
    }
  }

  async getLeaderboard(guildId, limit = 10) {
    try {
      const result = await this.pool.query(
        'SELECT user_id, chat_xp, voice_xp FROM users WHERE guild_id = $1 ORDER BY (chat_xp + voice_xp) DESC LIMIT $2',
        [guildId, limit]
      );

      return result.rows.map(row => ({
        userId: row.user_id,
        guildId,
        chatXP: row.chat_xp,
        voiceXP: row.voice_xp
      }));
    } catch (error) {
      console.error('Erro ao obter leaderboard:', error);
      return [];
    }
  }

  async getGuildConfig(guildId) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM guild_configs WHERE guild_id = $1',
        [guildId]
      );

      if (result.rows.length === 0) {
        await this.pool.query(
          'INSERT INTO guild_configs (guild_id) VALUES ($1)',
          [guildId]
        );

        return {
          guildId,
          welcomeChannelId: null,
          levelUpChannelId: null,
          chatRoleRewards: [],
          voiceRoleRewards: [],
          shopItems: [],
          roleButtons: [],
          selectMenus: {}
        };
      }

      const row = result.rows[0];
      return {
        guildId: row.guild_id,
        welcomeChannelId: row.welcome_channel_id,
        levelUpChannelId: row.level_up_channel_id,
        chatRoleRewards: row.chat_role_rewards,
        voiceRoleRewards: row.voice_role_rewards,
        shopItems: row.shop_items,
        roleButtons: row.role_buttons,
        selectMenus: row.select_menus
      };
    } catch (error) {
      console.error('Erro ao obter config do guild:', error);
      throw error;
    }
  }

  async updateGuildConfig(guildId, data) {
    try {
      const config = await this.getGuildConfig(guildId);
      const merged = { ...config, ...data };

      await this.pool.query(
        `UPDATE guild_configs SET
          welcome_channel_id = $1, level_up_channel_id = $2,
          chat_role_rewards = $3, voice_role_rewards = $4,
          shop_items = $5, role_buttons = $6, select_menus = $7,
          updated_at = CURRENT_TIMESTAMP
         WHERE guild_id = $8`,
        [
          merged.welcomeChannelId, merged.levelUpChannelId,
          JSON.stringify(merged.chatRoleRewards), JSON.stringify(merged.voiceRoleRewards),
          JSON.stringify(merged.shopItems), JSON.stringify(merged.roleButtons),
          JSON.stringify(merged.selectMenus), guildId
        ]
      );

      return merged;
    } catch (error) {
      console.error('Erro ao atualizar config do guild:', error);
      throw error;
    }
  }

  async addRoleReward(guildId, level, roleId, type = 'chat') {
    const config = await this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    
    const rewards = config[rewardKey].filter(r => r.level !== level);
    rewards.push({ level, roleId });
    rewards.sort((a, b) => a.level - b.level);

    const updateData = {};
    updateData[rewardKey] = rewards;
    
    return this.updateGuildConfig(guildId, updateData);
  }

  async removeRoleReward(guildId, level, type = 'chat') {
    const config = await this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    
    const rewards = config[rewardKey].filter(r => r.level !== level);

    const updateData = {};
    updateData[rewardKey] = rewards;
    
    return this.updateGuildConfig(guildId, updateData);
  }

  async getRoleRewardsForLevel(guildId, level, type = 'chat') {
    const config = await this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    return config[rewardKey].filter(r => r.level <= level);
  }

  async startVoiceTracking(guildId, userId) {
    try {
      await this.pool.query(
        'INSERT INTO voice_tracking (user_id, guild_id, start_time) VALUES ($1, $2, $3) ON CONFLICT (user_id, guild_id) DO UPDATE SET start_time = $3',
        [userId, guildId, Date.now()]
      );
    } catch (error) {
      console.error('Erro ao iniciar voice tracking:', error);
    }
  }

  async endVoiceTracking(guildId, userId) {
    try {
      const result = await this.pool.query(
        'SELECT start_time FROM voice_tracking WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );

      if (result.rows.length === 0) {
        return 0;
      }

      const startTime = result.rows[0].start_time;
      const duration = Date.now() - startTime;

      await this.pool.query(
        'DELETE FROM voice_tracking WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );

      return duration;
    } catch (error) {
      console.error('Erro ao finalizar voice tracking:', error);
      return 0;
    }
  }

  async isInVoice(guildId, userId) {
    try {
      const result = await this.pool.query(
        'SELECT EXISTS(SELECT 1 FROM voice_tracking WHERE user_id = $1 AND guild_id = $2)',
        [userId, guildId]
      );

      return result.rows[0].exists;
    } catch (error) {
      console.error('Erro ao verificar voice tracking:', error);
      return false;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Conexão com banco de dados fechada');
    }
  }
}

export const db = new Database();
