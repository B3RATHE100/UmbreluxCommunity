import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config, getProgressToNextLevel } from '../config.js';
import { createProgressBar } from '../utils/levelSystem.js';
import { getNextRoleReward } from '../utils/roleRewards.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Veja seu perfil, nível e progresso')
    .addUserOption(option =>
      option
        .setName('usuário')
        .setDescription('Ver perfil de outro usuário')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuário') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id);
    
    const userData = db.getUser(interaction.guild.id, targetUser.id);
    const chatProgress = getProgressToNextLevel(userData.chatXP);
    const voiceProgress = getProgressToNextLevel(userData.voiceXP);
    
    const chatProgressBar = createProgressBar(chatProgress.currentXP, chatProgress.requiredXP, 12);
    const voiceProgressBar = createProgressBar(voiceProgress.currentXP, voiceProgress.requiredXP, 12);
    
    const nextChatReward = getNextRoleReward(interaction.guild.id, chatProgress.currentLevel, 'chat');
    const nextVoiceReward = getNextRoleReward(interaction.guild.id, voiceProgress.currentLevel, 'voice');
    
    const totalXP = userData.chatXP + userData.voiceXP;
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.shield} Perfil Completo - ${targetUser.username}`)
      .setDescription(`**XP Total Combinado:** ${totalXP}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: `${config.emojis.fire} Chat`,
          value: 
            `**Nível:** ${chatProgress.currentLevel}\n` +
            `**XP:** ${userData.chatXP}\n` +
            `**Mensagens:** ${userData.messages}`,
          inline: true
        },
        {
          name: '🎙️ Voice',
          value: 
            `**Nível:** ${voiceProgress.currentLevel}\n` +
            `**XP:** ${userData.voiceXP}\n` +
            `**Tempo:** ${Math.floor(userData.voiceTime / 60000)} min`,
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true
        },
        {
          name: `📊 Progresso de Chat (Nível ${chatProgress.nextLevel})`,
          value: `${chatProgressBar}\n${chatProgress.currentXP}/${chatProgress.requiredXP} XP`
        },
        {
          name: `📊 Progresso de Voice (Nível ${voiceProgress.nextLevel})`,
          value: `${voiceProgressBar}\n${voiceProgress.currentXP}/${voiceProgress.requiredXP} XP`
        }
      )
      .setFooter({ 
        text: `Use /perfil-chat ou /perfil-voice para mais detalhes`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    if (nextChatReward || nextVoiceReward) {
      let rewardsText = '';
      if (nextChatReward) {
        const role = interaction.guild.roles.cache.get(nextChatReward.roleId);
        if (role) {
          rewardsText += `💬 **Chat Nível ${nextChatReward.level}**: ${role.toString()}\n`;
        }
      }
      if (nextVoiceReward) {
        const role = interaction.guild.roles.cache.get(nextVoiceReward.roleId);
        if (role) {
          rewardsText += `🎙️ **Voice Nível ${nextVoiceReward.level}**: ${role.toString()}`;
        }
      }
      
      if (rewardsText) {
        embed.addFields({
          name: `${config.emojis.crown} Próximas Recompensas`,
          value: rewardsText
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
