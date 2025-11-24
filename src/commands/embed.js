import { SlashCommandBuilder, EmbedBuilder, ChannelSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('🎨 Crie uma embed personalizada (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('Título da embed')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('descricao')
        .setDescription('Descrição da embed')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal para enviar a embed')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('cor')
        .setDescription('Cor em hex (ex: #9b59b6)')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        ephemeral: true
      });
    }

    const titulo = interaction.options.getString('titulo');
    const descricao = interaction.options.getString('descricao');
    const corHex = interaction.options.getString('cor') || '#9b59b6';
    const canal = interaction.options.getChannel('canal');

    let cor = config.colors.veil;
    if (corHex.startsWith('#')) {
      cor = parseInt(corHex.substring(1), 16);
    }

    const embed = new EmbedBuilder()
      .setColor(cor)
      .setTitle(titulo)
      .setDescription(descricao)
      .setFooter({ text: `Enviado por ${interaction.user.username}` })
      .setTimestamp();

    try {
      await canal.send({ embeds: [embed] });
      
      const confirmEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Embed Enviada!')
        .setDescription(`Embed enviada com sucesso em ${canal.toString()}`);
      
      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      await interaction.reply({
        content: `❌ Erro ao enviar embed: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
