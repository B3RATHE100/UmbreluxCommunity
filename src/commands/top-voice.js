import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { getLevelFromXP } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('top-voice')
    .setDescription('Veja o ranking de voice do servidor')
    .addIntegerOption(option =>
      option
        .setName('página')
        .setDescription('Número da página (padrão: 1)')
        .setRequired(false)
        .setMinValue(1)
    ),
  
  async execute(interaction) {
    const page = interaction.options.getInteger('página') || 1;
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    
    const leaderboard = db.getVoiceLeaderboard(interaction.guild.id, 100);
    const totalPages = Math.ceil(leaderboard.length / pageSize);
    
    if (page > totalPages && totalPages > 0) {
      return interaction.reply({ 
        content: `❌ Página inválida! Existem apenas ${totalPages} página(s).`,
        ephemeral: true 
      });
    }
    
    const pageData = leaderboard.slice(startIndex, startIndex + pageSize);
    
    if (pageData.length === 0) {
      return interaction.reply({
        content: '❌ Nenhum dado de ranking de voice disponível ainda!',
        ephemeral: true
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`🎙️ Top Voice - ${interaction.guild.name}`)
      .setDescription(`Membros mais ativos em calls de voz\n\u200b`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
      .setFooter({ 
        text: `Página ${page}/${totalPages} • Total de ${leaderboard.length} membros`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    const medals = ['🥇', '🥈', '🥉'];
    
    for (let i = 0; i < pageData.length; i++) {
      const userData = pageData[i];
      const position = startIndex + i + 1;
      const level = getLevelFromXP(userData.voiceXP);
      const hours = Math.floor(userData.voiceTime / 3600000);
      const minutes = Math.floor((userData.voiceTime % 3600000) / 60000);
      
      let user;
      try {
        user = await interaction.client.users.fetch(userData.userId);
      } catch {
        user = { tag: 'Usuário Desconhecido' };
      }
      
      const medal = position <= 3 ? medals[position - 1] : `**#${position}**`;
      
      embed.addFields({
        name: `${medal} ${user.tag}`,
        value: `${config.emojis.trophy} Nível **${level}** • ${config.emojis.star} **${userData.voiceXP}** XP • ⏱️ **${hours}h ${minutes}min** em calls`,
        inline: false
      });
    }
    
    const userPosition = leaderboard.findIndex(u => u.userId === interaction.user.id) + 1;
    if (userPosition > 0 && (userPosition < startIndex + 1 || userPosition > startIndex + pageSize)) {
      const userData = db.getUser(interaction.guild.id, interaction.user.id);
      const level = getLevelFromXP(userData.voiceXP);
      embed.addFields({
        name: '\u200b',
        value: `**Sua Posição no Voice:** #${userPosition} • Nível ${level} • ${userData.voiceXP} XP`
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
