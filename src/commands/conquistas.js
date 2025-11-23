import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { getLevelFromXP } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('conquistas')
    .setDescription('Veja suas conquistas e progresso no servidor')
    .addUserOption(option =>
      option
        .setName('usuário')
        .setDescription('Ver conquistas de outro usuário')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuário') || interaction.user;
    const userData = db.getUser(interaction.guild.id, targetUser.id);
    
    const chatLevel = getLevelFromXP(userData.chatXP);
    const voiceLevel = getLevelFromXP(userData.voiceXP);
    
    const achievements = [];
    
    if (userData.messages >= 1) {
      achievements.push({ emoji: '💬', name: 'Primeira Mensagem', description: 'Enviou sua primeira mensagem' });
    }
    if (userData.messages >= 100) {
      achievements.push({ emoji: '📝', name: 'Conversador', description: 'Enviou 100 mensagens' });
    }
    if (userData.messages >= 500) {
      achievements.push({ emoji: '📚', name: 'Tagarela', description: 'Enviou 500 mensagens' });
    }
    if (userData.messages >= 1000) {
      achievements.push({ emoji: '📖', name: 'Escritor', description: 'Enviou 1000 mensagens' });
    }
    if (userData.messages >= 5000) {
      achievements.push({ emoji: '✍️', name: 'Autor', description: 'Enviou 5000 mensagens' });
    }
    
    if (voiceLevel >= 1) {
      achievements.push({ emoji: '🎤', name: 'Primeira Call', description: 'Participou de sua primeira call' });
    }
    if (voiceLevel >= 5) {
      achievements.push({ emoji: '🎧', name: 'Ouvinte', description: 'Alcançou nível 5 de voice' });
    }
    if (voiceLevel >= 10) {
      achievements.push({ emoji: '📻', name: 'Locutor', description: 'Alcançou nível 10 de voice' });
    }
    
    if (chatLevel >= 5) {
      achievements.push({ emoji: '🌟', name: 'Estrela Nascente', description: 'Alcançou nível 5 de chat' });
    }
    if (chatLevel >= 10) {
      achievements.push({ emoji: '💫', name: 'Estrela Brilhante', description: 'Alcançou nível 10 de chat' });
    }
    if (chatLevel >= 20) {
      achievements.push({ emoji: '⭐', name: 'Superestrela', description: 'Alcançou nível 20 de chat' });
    }
    if (chatLevel >= 30) {
      achievements.push({ emoji: '🌠', name: 'Lenda Viva', description: 'Alcançou nível 30 de chat' });
    }
    
    if (userData.dailyStreak >= 3) {
      achievements.push({ emoji: '🔥', name: 'Dedicado', description: '3 dias de sequência diária' });
    }
    if (userData.dailyStreak >= 7) {
      achievements.push({ emoji: '💪', name: 'Comprometido', description: '7 dias de sequência diária' });
    }
    if (userData.dailyStreak >= 30) {
      achievements.push({ emoji: '👑', name: 'Inabalável', description: '30 dias de sequência diária' });
    }
    
    if (chatLevel >= 10 && voiceLevel >= 10) {
      achievements.push({ emoji: '🎯', name: 'Equilibrado', description: 'Nível 10+ em chat e voice' });
    }
    
    if (chatLevel + voiceLevel >= 50) {
      achievements.push({ emoji: '💎', name: 'Mestre', description: 'Soma de níveis ≥ 50' });
    }
    
    const totalAchievements = 20;
    const unlockedCount = achievements.length;
    const progressPercent = Math.floor((unlockedCount / totalAchievements) * 100);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.trophy} Conquistas de ${targetUser.username}`)
      .setDescription(
        `**Progresso:** ${unlockedCount}/${totalAchievements} (${progressPercent}%)\n\n` +
        `${achievements.length > 0 ? '**Conquistas Desbloqueadas:**\n' : 'Nenhuma conquista desbloqueada ainda!'}`
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ 
        text: 'Continue ativo para desbloquear mais conquistas!',
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    if (achievements.length > 0) {
      const achievementText = achievements
        .map(a => `${a.emoji} **${a.name}**\n${a.description}`)
        .join('\n\n');
      
      if (achievementText.length > 1024) {
        const half = Math.ceil(achievements.length / 2);
        const firstHalf = achievements.slice(0, half)
          .map(a => `${a.emoji} **${a.name}**\n${a.description}`)
          .join('\n\n');
        const secondHalf = achievements.slice(half)
          .map(a => `${a.emoji} **${a.name}**\n${a.description}`)
          .join('\n\n');
        
        embed.addFields(
          { name: '\u200b', value: firstHalf },
          { name: '\u200b', value: secondHalf }
        );
      } else {
        embed.addFields({ name: '\u200b', value: achievementText });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
