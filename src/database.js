import pkg from 'pg';
const { Pool } = pkg;

class Database {
  constructor() {
    this.pool = null;
    this.initialized = false;
    this.useMemory = false;
    // Fallback para memória
    this.users = new Map();
    this.guilds = new Map();
    this.voiceTracking = new Map();
  }

  async initialize() {
    if (this.initialized) return;
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('⚠️  DATABASE_URL não configurada. Usando armazenamento em memória (dados não serão persistidos)');
      this.useMemory = true;
      this.initialized = true;
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });

      await this.pool.query('SELECT NOW()');
      console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!');
      this.useMemory = false;
      this.initialized = true;
      await this.createTables();
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
      console.log('⚠️  Revertendo para armazenamento em memória...');
      this.useMemory = true;
      this.initialized = true;
    }
  }

  async createTables() {
    if (this.useMemory) return;
    
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
    }
  }

  async getUser(guildId, userId) {
    if (this.useMemory) {
      const key = `${guildId}-${userId}`;
      if (!this.users.has(key)) {
        this.users.set(key, {
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
        });
      }
      return this.users.get(key);
    }

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
    if (this.useMemory) {
      const key = `${guildId}-${userId}`;
      const user = this.getUser(guildId, userId);
      const merged = { ...user, ...data };
      this.users.set(key, merged);
      return merged;
    }

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
    if (this.useMemory) {
      return Array.from(this.users.values())
        .filter(user => user.guildId === guildId)
        .sort((a, b) => b.chatXP - a.chatXP)
        .slice(0, limit);
    }

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
    if (this.useMemory) {
      return Array.from(this.users.values())
        .filter(user => user.guildId === guildId)
        .sort((a, b) => b.voiceXP - a.voiceXP)
        .slice(0, limit);
    }

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
    if (this.useMemory) {
      return Array.from(this.users.values())
        .filter(user => user.guildId === guildId)
        .sort((a, b) => (b.chatXP + b.voiceXP) - (a.chatXP + a.voiceXP))
        .slice(0, limit);
    }

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

  getGuildConfig(guildId) {
    if (this.useMemory) {
      if (!this.guilds.has(guildId)) {
        this.guilds.set(guildId, {
          chatRoleRewards: [],
          voiceRoleRewards: [],
          welcomeChannelId: '1400592838323998860',
          levelUpChannelId: null,
          shopItems: [],
          roleButtons: [],
          selectMenus: {}
        });
      }
      return this.guilds.get(guildId);
    }

    // Para PostgreSQL, retorna valor síncrono do cache (deve ser chamado após initialize)
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        guildId,
        welcomeChannelId: '1400592838323998860',
        levelUpChannelId: null,
        chatRoleRewards: [],
        voiceRoleRewards: [],
        shopItems: [],
        roleButtons: [],
        selectMenus: {}
      });
    }
    return this.guilds.get(guildId);
  }

  updateGuildConfig(guildId, data) {
    const config = this.getGuildConfig(guildId);
    const merged = { ...config, ...data };
    this.guilds.set(guildId, merged);
    return merged;
  }

  addRoleReward(guildId, level, roleId, type = 'chat') {
    const config = this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    config[rewardKey] = config[rewardKey].filter(r => r.level !== level);
    config[rewardKey].push({ level, roleId });
    config[rewardKey].sort((a, b) => a.level - b.level);
    this.guilds.set(guildId, config);
    return config;
  }

  removeRoleReward(guildId, level, type = 'chat') {
    const config = this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    config[rewardKey] = config[rewardKey].filter(r => r.level !== level);
    this.guilds.set(guildId, config);
    return config;
  }

  getRoleRewardsForLevel(guildId, level, type = 'chat') {
    const config = this.getGuildConfig(guildId);
    const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
    return config[rewardKey].filter(r => r.level <= level);
  }

  startVoiceTracking(guildId, userId) {
    if (this.useMemory) {
      const key = `${guildId}-${userId}`;
      this.voiceTracking.set(key, Date.now());
      return;
    }
    // Para PostgreSQL, seria assíncrono
  }

  endVoiceTracking(guildId, userId) {
    if (this.useMemory) {
      const key = `${guildId}-${userId}`;
      if (this.voiceTracking.has(key)) {
        const startTime = this.voiceTracking.get(key);
        const duration = Date.now() - startTime;
        this.voiceTracking.delete(key);
        return duration;
      }
      return 0;
    }
    // Para PostgreSQL, seria assíncrono
    return 0;
  }

  isInVoice(guildId, userId) {
    if (this.useMemory) {
      return this.voiceTracking.has(`${guildId}-${userId}`);
    }
    return false;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Conexão com banco de dados fechada');
    }
  }
}

export const db = new Database();
