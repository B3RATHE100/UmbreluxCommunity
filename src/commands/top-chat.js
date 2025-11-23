import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { getLevelFromXP } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('top-chat')
    .setDescription('Veja o ranking de chat do servidor')
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
    
    const leaderboard = db.getChatLeaderboard(interaction.guild.id, 100);
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
        content: '❌ Nenhum dado de ranking de chat disponível ainda!',
        ephemeral: true
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.fire)
      .setTitle(`${config.emojis.fire} Top Chat - ${interaction.guild.name}`)
      .setDescription(`Membros mais ativos em conversas\n\u200b`)
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
      const level = getLevelFromXP(userData.chatXP);
      
      let user;
      try {
        user = await interaction.client.users.fetch(userData.userId);
      } catch {
        user = { tag: 'Usuário Desconhecido' };
      }
      
      const medal = position <= 3 ? medals[position - 1] : `**#${position}**`;
      
      embed.addFields({
        name: `${medal} ${user.tag}`,
        value: `${config.emojis.trophy} Nível **${level}** • ${config.emojis.star} **${userData.chatXP}** XP • ${config.emojis.fire} **${userData.messages}** mensagens`,
        inline: false
      });
    }
    
    const userPosition = leaderboard.findIndex(u => u.userId === interaction.user.id) + 1;
    if (userPosition > 0 && (userPosition < startIndex + 1 || userPosition > startIndex + pageSize)) {
      const userData = db.getUser(interaction.guild.id, interaction.user.id);
      const level = getLevelFromXP(userData.chatXP);
      embed.addFields({
        name: '\u200b',
        value: `**Sua Posição no Chat:** #${userPosition} • Nível ${level} • ${userData.chatXP} XP`
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
