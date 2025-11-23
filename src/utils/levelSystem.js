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
  
  return { 
    leveledUp: false,
    oldLevel,
    newLevel: oldLevel
  };
}

export async function grantChatXP(guild, member, amount) {
  const userData = db.getUser(guild.id, member.id);
  const oldXP = userData.chatXP;
  
  db.addChatXP(guild.id, member.id, amount);
  const newUserData = db.getUser(guild.id, member.id);
  const levelCheck = checkLevelUp(oldXP, newUserData.chatXP);
  
  // Sempre atualizar o nível atual
  const currentLevel = getLevelFromXP(newUserData.chatXP);
  db.updateUser(guild.id, member.id, { chatLevel: currentLevel });
  
  return {
    xpGained: amount,
    totalXP: newUserData.chatXP,
    levelUp: levelCheck.leveledUp ? levelCheck : null,
    type: 'chat'
  };
}

export async function grantVoiceXP(guild, member, amount) {
  const userData = db.getUser(guild.id, member.id);
  const oldXP = userData.voiceXP;
  
  db.addVoiceXP(guild.id, member.id, amount);
  const newUserData = db.getUser(guild.id, member.id);
  const levelCheck = checkLevelUp(oldXP, newUserData.voiceXP);
  
  // Sempre atualizar o nível atual
  const currentLevel = getLevelFromXP(newUserData.voiceXP);
  db.updateUser(guild.id, member.id, { voiceLevel: currentLevel });
  
  return {
    xpGained: amount,
    totalXP: newUserData.voiceXP,
    levelUp: levelCheck.leveledUp ? levelCheck : null,
    type: 'voice'
  };
}

export function createProgressBar(current, max, length = 10) {
  const percentage = Math.min(current / max, 1);
  const filled = Math.floor(percentage * length);
  const empty = length - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${Math.floor(percentage * 100)}%`;
}
