class Database {
  constructor() {
    this.users = new Map();
    this.guilds = new Map();
    this.voiceTracking = new Map();
  }

  getUser(guildId, userId) {
    const key = `${guildId}-${userId}`;
    if (!this.users.has(key)) {
      this.users.set(key, {
        userId,
        guildId,
        xp: 0,
        level: 0,
        messages: 0,
        voiceTime: 0,
        lastMessageTime: 0
      });
    }
    return this.users.get(key);
  }

  updateUser(guildId, userId, data) {
    const key = `${guildId}-${userId}`;
    const user = this.getUser(guildId, userId);
    this.users.set(key, { ...user, ...data });
    return this.users.get(key);
  }

  addXP(guildId, userId, amount) {
    const user = this.getUser(guildId, userId);
    user.xp += amount;
    this.users.set(`${guildId}-${userId}`, user);
    return user;
  }

  getLeaderboard(guildId, limit = 10) {
    const guildUsers = Array.from(this.users.values())
      .filter(user => user.guildId === guildId)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);
    
    return guildUsers;
  }

  getGuildConfig(guildId) {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        roleRewards: [],
        welcomeChannelId: null,
        levelUpChannelId: null
      });
    }
    return this.guilds.get(guildId);
  }

  updateGuildConfig(guildId, data) {
    const config = this.getGuildConfig(guildId);
    this.guilds.set(guildId, { ...config, ...data });
    return this.guilds.get(guildId);
  }

  addRoleReward(guildId, level, roleId) {
    const config = this.getGuildConfig(guildId);
    config.roleRewards = config.roleRewards.filter(r => r.level !== level);
    config.roleRewards.push({ level, roleId });
    config.roleRewards.sort((a, b) => a.level - b.level);
    this.guilds.set(guildId, config);
    return config;
  }

  removeRoleReward(guildId, level) {
    const config = this.getGuildConfig(guildId);
    config.roleRewards = config.roleRewards.filter(r => r.level !== level);
    this.guilds.set(guildId, config);
    return config;
  }

  getRoleRewardsForLevel(guildId, level) {
    const config = this.getGuildConfig(guildId);
    return config.roleRewards.filter(r => r.level <= level);
  }

  startVoiceTracking(guildId, userId) {
    const key = `${guildId}-${userId}`;
    this.voiceTracking.set(key, Date.now());
  }

  endVoiceTracking(guildId, userId) {
    const key = `${guildId}-${userId}`;
    if (this.voiceTracking.has(key)) {
      const startTime = this.voiceTracking.get(key);
      const duration = Date.now() - startTime;
      this.voiceTracking.delete(key);
      return duration;
    }
    return 0;
  }

  isInVoice(guildId, userId) {
    return this.voiceTracking.has(`${guildId}-${userId}`);
  }
}

export const db = new Database();
