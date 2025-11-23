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
    const progress = getProgressToNextLevel(userData.xp);
    const progressBar = createProgressBar(progress.currentXP, progress.requiredXP, 15);
    
    const nextReward = getNextRoleReward(interaction.guild.id, progress.currentLevel);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.shield} Perfil de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: `${config.emojis.trophy} Nível`,
          value: `**${progress.currentLevel}**`,
          inline: true
        },
        {
          name: `${config.emojis.star} XP Total`,
          value: `**${userData.xp}**`,
          inline: true
        },
        {
          name: `${config.emojis.fire} Mensagens`,
          value: `**${userData.messages}**`,
          inline: true
        },
        {
          name: `📊 Progresso para Nível ${progress.nextLevel}`,
          value: `${progressBar}\n${progress.currentXP}/${progress.requiredXP} XP`
        }
      )
      .setFooter({ 
        text: `Continue conversando e participando em calls para ganhar mais XP!`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    if (nextReward) {
      const role = interaction.guild.roles.cache.get(nextReward.roleId);
      if (role) {
        embed.addFields({
          name: `${config.emojis.crown} Próxima Recompensa`,
          value: `**Nível ${nextReward.level}**: ${role.toString()}`
        });
      }
    }
    
    const currentRoles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 10);
    
    if (currentRoles.length > 0) {
      embed.addFields({
        name: '🎭 Cargos Atuais',
        value: currentRoles.join(', ')
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
