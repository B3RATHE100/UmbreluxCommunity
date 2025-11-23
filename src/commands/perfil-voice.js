import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config, getProgressToNextLevel } from '../config.js';
import { createProgressBar } from '../utils/levelSystem.js';
import { getNextRoleReward } from '../utils/roleRewards.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perfil-voice')
    .setDescription('Veja seu perfil e progresso de voice')
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
    const progress = getProgressToNextLevel(userData.voiceXP);
    const progressBar = createProgressBar(progress.currentXP, progress.requiredXP, 15);
    
    const nextReward = getNextRoleReward(interaction.guild.id, progress.currentLevel, 'voice');
    
    const hoursInVoice = Math.floor(userData.voiceTime / 3600000);
    const minutesInVoice = Math.floor((userData.voiceTime % 3600000) / 60000);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`🎙️ Perfil de Voice - ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: `${config.emojis.trophy} Nível de Voice`,
          value: `**${progress.currentLevel}**`,
          inline: true
        },
        {
          name: `${config.emojis.star} XP de Voice`,
          value: `**${userData.voiceXP}**`,
          inline: true
        },
        {
          name: `⏱️ Tempo em Calls`,
          value: `**${hoursInVoice}h ${minutesInVoice}min**`,
          inline: true
        },
        {
          name: `📊 Progresso para Nível ${progress.nextLevel}`,
          value: `${progressBar}\n${progress.currentXP}/${progress.requiredXP} XP`
        }
      )
      .setFooter({ 
        text: `Continue em calls de voz para ganhar mais XP!`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    if (nextReward) {
      const role = interaction.guild.roles.cache.get(nextReward.roleId);
      if (role) {
        embed.addFields({
          name: `${config.emojis.crown} Próxima Recompensa de Voice`,
          value: `**Nível ${nextReward.level}**: ${role.toString()}`
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
