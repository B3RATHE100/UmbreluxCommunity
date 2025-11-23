export const config = {
  colors: {
    primary: 0x8c13e0,
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
    veil: 0x9b59b6
  },
  
  xp: {
    messageMin: 15,
    messageMax: 25,
    messageCooldown: 60000,
    voicePerMinute: 10,
    voiceCheckInterval: 60000
  },
  
  levels: {
    baseXP: 100,
    multiplier: 1.5
  },
  
  emojis: {
    levelUp: '⭐',
    star: '✨',
    trophy: '🏆',
    shield: '🛡️',
    crown: '👑',
    fire: '🔥'
  },
  
  welcomeChannel: null,
  levelUpChannel: null
};

export function getXPForLevel(level) {
  return Math.floor(config.levels.baseXP * Math.pow(level, config.levels.multiplier));
}

export function getLevelFromXP(xp) {
  let level = 0;
  let totalXP = 0;
  
  while (totalXP <= xp) {
    level++;
    totalXP += getXPForLevel(level);
  }
  
  return level - 1;
}

export function getProgressToNextLevel(xp) {
  const currentLevel = getLevelFromXP(xp);
  const xpForCurrentLevel = Array.from({ length: currentLevel }, (_, i) => getXPForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const currentLevelXP = xp - xpForCurrentLevel;
  
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    currentXP: currentLevelXP,
    requiredXP: xpForNextLevel,
    percentage: Math.floor((currentLevelXP / xpForNextLevel) * 100)
  };
}
