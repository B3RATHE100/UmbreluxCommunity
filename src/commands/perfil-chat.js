import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config, getProgressToNextLevel } from '../config.js';
import { createProgressBar } from '../utils/levelSystem.js';
import { getNextRoleReward } from '../utils/roleRewards.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perfil-chat')
    .setDescription('Veja seu perfil e progresso de chat')
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
    const progress = getProgressToNextLevel(userData.chatXP);
    const progressBar = createProgressBar(progress.currentXP, progress.requiredXP, 15);
    
    const nextReward = getNextRoleReward(interaction.guild.id, progress.currentLevel, 'chat');
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.fire)
      .setTitle(`${config.emojis.fire} Perfil de Chat - ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: `${config.emojis.trophy} Nível de Chat`,
          value: `**${progress.currentLevel}**`,
          inline: true
        },
        {
          name: `${config.emojis.star} XP de Chat`,
          value: `**${userData.chatXP}**`,
          inline: true
        },
        {
          name: `${config.emojis.fire} Mensagens Enviadas`,
          value: `**${userData.messages}**`,
          inline: true
        },
        {
          name: `📊 Progresso para Nível ${progress.nextLevel}`,
          value: `${progressBar}\n${progress.currentXP}/${progress.requiredXP} XP`
        }
      )
      .setFooter({ 
        text: `Continue conversando para ganhar mais XP!`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    if (nextReward) {
      const role = interaction.guild.roles.cache.get(nextReward.roleId);
      if (role) {
        embed.addFields({
          name: `${config.emojis.crown} Próxima Recompensa de Chat`,
          value: `**Nível ${nextReward.level}**: ${role.toString()}`
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
