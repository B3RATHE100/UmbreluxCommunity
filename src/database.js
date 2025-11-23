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
        chatXP: 0,
        chatLevel: 0,
        voiceXP: 0,
        voiceLevel: 0,
        messages: 0,
        voiceTime: 0,
        lastMessageTime: 0,
        lastDailyTime: 0,
        dailyStreak: 0
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

  addChatXP(guildId, userId, amount) {
    const user = this.getUser(guildId, userId);
    user.chatXP += amount;
    this.users.set(`${guildId}-${userId}`, user);
    return user;
  }

  addVoiceXP(guildId, userId, amount) {
    const user = this.getUser(guildId, userId);
    user.voiceXP += amount;
    this.users.set(`${guildId}-${userId}`, user);
    return user;
  }

  getChatLeaderboard(guildId, limit = 10) {
    const guildUsers = Array.from(this.users.values())
      .filter(user => user.guildId === guildId)
      .sort((a, b) => b.chatXP - a.chatXP)
      .slice(0, limit);
    
    return guildUsers;
  }

  getVoiceLeaderboard(guildId, limit = 10) {
    const guildUsers = Array.from(this.users.values())
      .filter(user => user.guildId === guildId)
      .sort((a, b) => b.voiceXP - a.voiceXP)
      .slice(0, limit);
    
    return guildUsers;
  }

  getLeaderboard(guildId, limit = 10) {
    const guildUsers = Array.from(this.users.values())
      .filter(user => user.guildId === guildId)
      .sort((a, b) => (b.chatXP + b.voiceXP) - (a.chatXP + a.voiceXP))
      .slice(0, limit);
    
    return guildUsers;
  }

  getGuildConfig(guildId) {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        chatRoleRewards: [],
        voiceRoleRewards: [],
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
