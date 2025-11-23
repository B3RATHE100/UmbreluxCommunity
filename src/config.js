
export const config = {
  colors: {
    primary: 0x8c13e0,
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
    veil: 0x9b59b6,
    fire: 0xff6b35
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
    multiplier: 1.2
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
  if (level <= 0) return 0;
  return Math.floor(config.levels.baseXP * Math.pow(level, config.levels.multiplier));
}

export function getTotalXPForLevel(level) {
  if (level <= 0) return 0;
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

export function getLevelFromXP(xp) {
  if (xp <= 0) return 0;
  
  let level = 0;
  let totalXPNeeded = 0;
  
  while (totalXPNeeded <= xp) {
    level++;
    totalXPNeeded += getXPForLevel(level);
  }
  
  return level - 1;
}

export function getProgressToNextLevel(xp) {
  const currentLevel = getLevelFromXP(xp);
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const currentLevelXP = xp - xpForCurrentLevel;
  
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    currentXP: Math.max(0, currentLevelXP),
    requiredXP: xpForNextLevel,
    percentage: Math.floor((currentLevelXP / xpForNextLevel) * 100)
  };
}
