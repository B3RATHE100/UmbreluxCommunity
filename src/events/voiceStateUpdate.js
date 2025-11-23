import { db } from '../database.js';
import { config } from '../config.js';
import { grantXP } from '../utils/levelSystem.js';
import { checkAndGrantRoleRewards } from '../utils/roleRewards.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member;
    if (!member || member.user.bot) return;
    
    const joinedChannel = newState.channel;
    const leftChannel = oldState.channel;
    
    if (!leftChannel && joinedChannel) {
      db.startVoiceTracking(newState.guild.id, member.id);
      console.log(`${member.user.tag} entrou no canal de voz ${joinedChannel.name}`);
    }
    
    if (leftChannel && !joinedChannel) {
      const duration = db.endVoiceTracking(oldState.guild.id, member.id);
      
      if (duration > 0) {
        const minutes = Math.floor(duration / 60000);
        if (minutes > 0) {
          const xpAmount = minutes * config.xp.voicePerMinute;
          const result = await grantXP(oldState.guild, member, xpAmount, 'voice');
          
          if (result.levelUp && result.levelUp.leveledUp) {
            await checkAndGrantRoleRewards(
              oldState.guild,
              member,
              result.levelUp.newLevel
            );
          }
          
          console.log(`${member.user.tag} ganhou ${xpAmount} XP por ${minutes} minutos em call`);
        }
      }
    }
    
    if (leftChannel && joinedChannel && leftChannel.id !== joinedChannel.id) {
      const duration = db.endVoiceTracking(oldState.guild.id, member.id);
      
      if (duration > 0) {
        const minutes = Math.floor(duration / 60000);
        if (minutes > 0) {
          const xpAmount = minutes * config.xp.voicePerMinute;
          await grantXP(oldState.guild, member, xpAmount, 'voice');
        }
      }
      
      db.startVoiceTracking(newState.guild.id, member.id);
    }
  }
};
