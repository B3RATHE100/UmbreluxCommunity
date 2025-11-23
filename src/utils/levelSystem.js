import { getLevelFromXP, getXPForLevel } from '../config.js';
import { db } from '../database.js';

export function calculateLevel(xp) {
  return getLevelFromXP(xp);
}

export function checkLevelUp(oldXP, newXP) {
  const oldLevel = getLevelFromXP(oldXP);
  const newLevel = getLevelFromXP(newXP);
  
  if (newLevel > oldLevel) {
    return {
      leveledUp: true,
      oldLevel,
      newLevel,
      levelsGained: newLevel - oldLevel
    };
  }
  
  return { leveledUp: false };
}

export async function grantXP(guild, member, amount, reason = 'message') {
  const userData = db.getUser(guild.id, member.id);
  const oldXP = userData.xp;
  
  db.addXP(guild.id, member.id, amount);
  const newUserData = db.getUser(guild.id, member.id);
  const levelCheck = checkLevelUp(oldXP, newUserData.xp);
  
  if (levelCheck.leveledUp) {
    db.updateUser(guild.id, member.id, { level: levelCheck.newLevel });
    return {
      xpGained: amount,
      totalXP: newUserData.xp,
      levelUp: levelCheck,
      reason
    };
  }
  
  return {
    xpGained: amount,
    totalXP: newUserData.xp,
    levelUp: null,
    reason
  };
}

export function createProgressBar(current, max, length = 10) {
  const percentage = Math.min(current / max, 1);
  const filled = Math.floor(percentage * length);
  const empty = length - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${Math.floor(percentage * 100)}%`;
}
