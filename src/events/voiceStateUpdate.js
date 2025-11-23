import { EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config, getLevelFromXP } from '../config.js';
import { grantVoiceXP } from '../utils/levelSystem.js';
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
          const result = await grantVoiceXP(oldState.guild, member, xpAmount);
          
          // Atualizar nível em tempo real
          const updatedUserData = db.getUser(oldState.guild.id, member.id);
          const currentVoiceLevel = getLevelFromXP(updatedUserData.voiceXP);
          if (updatedUserData.voiceLevel !== currentVoiceLevel) {
            db.updateUser(oldState.guild.id, member.id, { voiceLevel: currentVoiceLevel });
          }
          
          if (result.levelUp && result.levelUp.leveledUp) {
            const newLevel = result.levelUp.newLevel;
            
            const roleRewards = await checkAndGrantRoleRewards(
              oldState.guild,
              member,
              newLevel,
              'voice'
            );
            
            const embed = new EmbedBuilder()
              .setColor(config.colors.veil)
              .setTitle(`${config.emojis.star} Level Up de Voice!`)
              .setDescription(
                `Parabéns ${member.toString()}!\n\n` +
                `Você alcançou o **Nível ${newLevel} de Voice**! 🎙️\n` +
                `XP de Voice Total: **${result.totalXP}**`
              )
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp();
            
            if (roleRewards.length > 0) {
              const rolesText = roleRewards.map(r => r.role.toString()).join(', ');
              embed.addFields({
                name: `${config.emojis.crown} Novos Cargos Desbloqueados!`,
                value: rolesText
              });
            }
            
            const guildConfig = db.getGuildConfig(oldState.guild.id);
            let levelUpChannel = null;
            
            if (guildConfig.levelUpChannelId) {
              levelUpChannel = oldState.guild.channels.cache.get(guildConfig.levelUpChannelId);
            }
            
            if (levelUpChannel) {
              try {
                await levelUpChannel.send({ embeds: [embed] });
              } catch (error) {
                console.error('Erro ao enviar mensagem de level up:', error);
              }
            }
          }
          
          console.log(`${member.user.tag} ganhou ${xpAmount} XP de voice por ${minutes} minutos em call`);
        }
      }
    }
    
    if (leftChannel && joinedChannel && leftChannel.id !== joinedChannel.id) {
      const duration = db.endVoiceTracking(oldState.guild.id, member.id);
      
      if (duration > 0) {
        const minutes = Math.floor(duration / 60000);
        if (minutes > 0) {
          const xpAmount = minutes * config.xp.voicePerMinute;
          await grantVoiceXP(oldState.guild, member, xpAmount);
          
          // Atualizar nível em tempo real
          const updatedUserData = db.getUser(oldState.guild.id, member.id);
          const currentVoiceLevel = getLevelFromXP(updatedUserData.voiceXP);
          if (updatedUserData.voiceLevel !== currentVoiceLevel) {
            db.updateUser(oldState.guild.id, member.id, { voiceLevel: currentVoiceLevel });
          }
        }
      }
      
      db.startVoiceTracking(newState.guild.id, member.id);
    }
  }
};
