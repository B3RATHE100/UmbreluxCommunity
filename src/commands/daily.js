import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { grantChatXP, grantVoiceXP } from '../utils/levelSystem.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclame sua recompensa diária de XP!'),
  
  async execute(interaction) {
    const userData = db.getUser(interaction.guild.id, interaction.user.id);
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    const timeSinceLastDaily = now - userData.lastDailyTime;
    
    if (timeSinceLastDaily < dayInMs) {
      const timeRemaining = dayInMs - timeSinceLastDaily;
      const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('⏰ Recompensa Diária Indisponível')
        .setDescription(
          `Você já coletou sua recompensa diária!\n\n` +
          `Volte em **${hoursRemaining}h ${minutesRemaining}min** para coletar novamente.`
        )
        .setFooter({ text: 'Retorne amanhã para manter sua sequência!' });
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    let streak = userData.dailyStreak || 0;
    const twoDaysInMs = 2 * dayInMs;
    
    if (timeSinceLastDaily > twoDaysInMs) {
      streak = 0;
    }
    
    streak += 1;
    
    const baseReward = 100;
    const streakBonus = Math.min(streak * 10, 200);
    const totalChatXP = baseReward + streakBonus;
    const totalVoiceXP = Math.floor((baseReward + streakBonus) * 0.75);
    
    await grantChatXP(interaction.guild, interaction.member, totalChatXP);
    await grantVoiceXP(interaction.guild, interaction.member, totalVoiceXP);
    
    db.updateUser(interaction.guild.id, interaction.user.id, {
      lastDailyTime: now,
      dailyStreak: streak
    });
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle(`${config.emojis.star} Recompensa Diária Coletada!`)
      .setDescription(
        `Parabéns ${interaction.user.toString()}!\n\n` +
        `**Recompensas Recebidas:**\n` +
        `${config.emojis.fire} **+${totalChatXP}** XP de Chat\n` +
        `🎙️ **+${totalVoiceXP}** XP de Voice\n\n` +
        `${config.emojis.trophy} **Sequência:** ${streak} dia(s)!\n` +
        `${streak > 1 ? `Bônus de sequência: **+${streakBonus}** XP!` : 'Continue coletando diariamente para ganhar bônus!'}`
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `Volte em 24h para manter sua sequência de ${streak} dia(s)!` 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
