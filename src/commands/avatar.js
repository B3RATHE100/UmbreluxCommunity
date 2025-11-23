import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Veja o avatar de um usuário em alta resolução')
    .addUserOption(option =>
      option
        .setName('usuário')
        .setDescription('Usuário para ver o avatar')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuário') || interaction.user;
    
    const avatarURL = targetUser.displayAvatarURL({ 
      dynamic: true, 
      size: 4096 
    });
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.star} Avatar de ${targetUser.username}`)
      .setDescription(`[Clique aqui para baixar](${avatarURL})`)
      .setImage(avatarURL)
      .setFooter({ 
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
