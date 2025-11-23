import { db } from '../database.js';

export async function checkAndGrantRoleRewards(guild, member, newLevel, type = 'chat') {
  const guildConfig = db.getGuildConfig(guild.id);
  const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
  const roleRewards = guildConfig[rewardKey].filter(r => r.level <= newLevel);
  
  const granted = [];
  
  for (const reward of roleRewards) {
    try {
      const role = await guild.roles.fetch(reward.roleId);
      if (role && !member.roles.cache.has(reward.roleId)) {
        await member.roles.add(role);
        granted.push({ level: reward.level, role });
      }
    } catch (error) {
      console.error(`Erro ao conceder cargo ${reward.roleId}:`, error);
    }
  }
  
  return granted;
}

export function getNextRoleReward(guildId, currentLevel, type = 'chat') {
  const guildConfig = db.getGuildConfig(guildId);
  const rewardKey = type === 'chat' ? 'chatRoleRewards' : 'voiceRoleRewards';
  const nextReward = guildConfig[rewardKey]
    .filter(r => r.level > currentLevel)
    .sort((a, b) => a.level - b.level)[0];
  
  return nextReward || null;
}

export function formatRoleRewardsList(guild, roleRewards, type = 'chat') {
  if (!roleRewards || roleRewards.length === 0) {
    return 'Nenhuma recompensa configurada';
  }
  
  return roleRewards.map(r => {
    const role = guild.roles.cache.get(r.roleId);
    return `**Nível ${r.level}** → ${role ? role.toString() : 'Cargo Removido'}`;
  }).join('\n');
}
