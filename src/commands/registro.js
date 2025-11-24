import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('registro')
    .setDescription('📝 Crie seu registro no sistema Veil'),
  
  async execute(interaction) {
    const userData = db.getUser(interaction.guild.id, interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle('📝 Seu Registro Veil')
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '👤 Nome',
          value: interaction.user.username,
          inline: true
        },
        {
          name: '🎭 Status',
          value: 'Ativo no Servidor',
          inline: true
        },
        {
          name: '💰 Moedas',
          value: userData.coins.toString(),
          inline: true
        },
        {
          name: '⭐ Chat XP',
          value: userData.chatXP.toString(),
          inline: true
        },
        {
          name: '🎙️ Voice XP',
          value: userData.voiceXP.toString(),
          inline: true
        },
        {
          name: '🐾 Pets',
          value: (userData.pets?.length || 0).toString(),
          inline: true
        }
      )
      .setFooter({ text: `Registrado em ${interaction.guild.name}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
