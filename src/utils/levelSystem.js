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

export async function grantChatXP(guild, member, amount) {
  const userData = db.getUser(guild.id, member.id);
  const oldXP = userData.chatXP;
  
  db.addChatXP(guild.id, member.id, amount);
  const newUserData = db.getUser(guild.id, member.id);
  const levelCheck = checkLevelUp(oldXP, newUserData.chatXP);
  
  if (levelCheck.leveledUp) {
    db.updateUser(guild.id, member.id, { chatLevel: levelCheck.newLevel });
    return {
      xpGained: amount,
      totalXP: newUserData.chatXP,
      levelUp: levelCheck,
      type: 'chat'
    };
  }
  
  return {
    xpGained: amount,
    totalXP: newUserData.chatXP,
    levelUp: null,
    type: 'chat'
  };
}

export async function grantVoiceXP(guild, member, amount) {
  const userData = db.getUser(guild.id, member.id);
  const oldXP = userData.voiceXP;
  
  db.addVoiceXP(guild.id, member.id, amount);
  const newUserData = db.getUser(guild.id, member.id);
  const levelCheck = checkLevelUp(oldXP, newUserData.voiceXP);
  
  if (levelCheck.leveledUp) {
    db.updateUser(guild.id, member.id, { voiceLevel: levelCheck.newLevel });
    return {
      xpGained: amount,
      totalXP: newUserData.voiceXP,
      levelUp: levelCheck,
      type: 'voice'
    };
  }
  
  return {
    xpGained: amount,
    totalXP: newUserData.voiceXP,
    levelUp: null,
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
