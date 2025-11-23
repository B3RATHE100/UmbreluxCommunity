import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';
import { db } from '../database.js';
import { grantXP } from '../utils/levelSystem.js';
import { checkAndGrantRoleRewards } from '../utils/roleRewards.js';

export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    const userData = db.getUser(message.guild.id, message.author.id);
    const now = Date.now();
    
    if (now - userData.lastMessageTime < config.xp.messageCooldown) {
      return;
    }
    
    db.updateUser(message.guild.id, message.author.id, { 
      lastMessageTime: now,
      messages: userData.messages + 1
    });
    
    const xpAmount = Math.floor(
      Math.random() * (config.xp.messageMax - config.xp.messageMin + 1) + config.xp.messageMin
    );
    
    const result = await grantXP(message.guild, message.member, xpAmount, 'message');
    
    if (result.levelUp && result.levelUp.leveledUp) {
      const newLevel = result.levelUp.newLevel;
      
      const roleRewards = await checkAndGrantRoleRewards(
        message.guild, 
        message.member, 
        newLevel
      );
      
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`${config.emojis.levelUp} Level Up!`)
        .setDescription(
          `Parabéns ${message.author.toString()}!\n\n` +
          `Você alcançou o **Nível ${newLevel}**! ${config.emojis.trophy}\n` +
          `XP Total: **${result.totalXP}**`
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      
      if (roleRewards.length > 0) {
        const rolesText = roleRewards.map(r => r.role.toString()).join(', ');
        embed.addFields({
          name: `${config.emojis.crown} Novos Cargos Desbloqueados!`,
          value: rolesText
        });
      }
      
      const guildConfig = db.getGuildConfig(message.guild.id);
      let levelUpChannel = message.channel;
      
      if (guildConfig.levelUpChannelId) {
        const configuredChannel = message.guild.channels.cache.get(guildConfig.levelUpChannelId);
        if (configuredChannel) {
          levelUpChannel = configuredChannel;
        }
      }
      
      try {
        await levelUpChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Erro ao enviar mensagem de level up:', error);
      }
    }
  }
};
