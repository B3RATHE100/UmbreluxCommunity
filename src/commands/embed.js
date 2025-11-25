import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('🎨 Crie uma embed personalizada (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal para enviar a embed')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('Título da embed')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('descricao')
        .setDescription('Descrição da embed')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('imagem')
        .setDescription('URL da imagem da embed')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('thumbnail')
        .setDescription('URL do thumbnail (imagem pequena)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('autor')
        .setDescription('Nome do autor')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('rodape')
        .setDescription('Texto do rodapé')
        .setRequired(false)
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
    const imagemUrl = interaction.options.getString('imagem');
    const thumbnailUrl = interaction.options.getString('thumbnail');
    const autor = interaction.options.getString('autor');
    const rodape = interaction.options.getString('rodape');
    const corHex = interaction.options.getString('cor') || '#9b59b6';
    const canal = interaction.options.getChannel('canal');

    let cor = config.colors.veil;
    if (corHex && corHex.startsWith('#')) {
      try {
        cor = parseInt(corHex.substring(1), 16);
      } catch (e) {
        cor = config.colors.veil;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(cor);

    if (titulo) {
      embed.setTitle(titulo);
    }

    if (descricao) {
      embed.setDescription(descricao);
    }

    if (autor) {
      embed.setAuthor({ name: autor });
    }

    if (imagemUrl) {
      try {
        embed.setImage(imagemUrl);
      } catch (e) {
        // URL inválida, ignora
      }
    }

    if (thumbnailUrl) {
      try {
        embed.setThumbnail(thumbnailUrl);
      } catch (e) {
        // URL inválida, ignora
      }
    }

    if (rodape) {
      embed.setFooter({ text: rodape });
    }

    try {
      await canal.send({ embeds: [embed] });
      
      const confirmEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Embed Enviada!')
        .setDescription(`Embed enviada com sucesso em ${canal.toString()}`)
        .addFields({
          name: '📋 Detalhes',
          value: `**Título:** ${titulo}\n**Imagem:** ${imagemUrl ? '✅' : '❌'}\n**Thumbnail:** ${thumbnailUrl ? '✅' : '❌'}\n**Cor:** ${corHex}`
        });
      
      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      console.error('Erro ao enviar embed:', error);
      await interaction.reply({
        content: `❌ Erro ao enviar embed: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
