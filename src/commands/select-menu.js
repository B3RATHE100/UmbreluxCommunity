import { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('select-menu')
    .setDescription('📋 Configure um selecionador personalizado em uma mensagem (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('id-menu')
        .setDescription('ID único do menu (ex: roles_select)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('Título do selecionador')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('opcoes')
        .setDescription('Opções separadas por | (ex: Opção1|Opção2|Opção3)')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal para enviar o selecionador')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('link-mensagem')
        .setDescription('Link da mensagem para adicionar selecionador')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        ephemeral: true
      });
    }

    const idMenu = interaction.options.getString('id-menu');
    const titulo = interaction.options.getString('titulo');
    const opcoesStr = interaction.options.getString('opcoes');
    const canal = interaction.options.getChannel('canal');
    const linkMensagem = interaction.options.getString('link-mensagem');

    const opcoes = opcoesStr.split('|').map((opt, idx) => ({
      label: opt.trim(),
      value: `${idMenu}_${idx}`
    }));

    if (opcoes.length < 1 || opcoes.length > 25) {
      return interaction.reply({
        content: '❌ Você precisa de 1 a 25 opções!',
        ephemeral: true
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(idMenu)
      .setPlaceholder(titulo)
      .addOptions(opcoes);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    try {
      let msg;

      if (linkMensagem) {
        const match = linkMensagem.match(/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/);
        
        if (!match) {
          return interaction.reply({
            content: '❌ Link de mensagem inválido! Use: https://discord.com/channels/guildId/channelId/messageId',
            ephemeral: true
          });
        }

        const channelId = match[1];
        const messageId = match[2];

        const targetChannel = interaction.guild.channels.cache.get(channelId);
        if (!targetChannel || !targetChannel.isTextBased()) {
          return interaction.reply({
            content: '❌ Canal não encontrado ou não é um canal de texto!',
            ephemeral: true
          });
        }

        try {
          msg = await targetChannel.messages.fetch(messageId);
          const existingComponents = msg.components || [];
          await msg.edit({ components: [...existingComponents, row] });
        } catch (error) {
          return interaction.reply({
            content: '❌ Não consegui encontrar a mensagem! Verifique o link.',
            ephemeral: true
          });
        }
      } else {
        const embed = new EmbedBuilder()
          .setColor(config.colors.veil)
          .setTitle(`📋 ${titulo}`)
          .setDescription('Selecione uma opção abaixo');

        msg = await canal.send({ embeds: [embed], components: [row] });
      }

      const confirmEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Menu Selecionador Criado!')
        .setDescription(`Menu **${titulo}** adicionado${linkMensagem ? ' à mensagem' : ' em ' + canal.toString()}\n\n**Opções:** ${opcoes.length}`)
        .addFields({
          name: 'Opções:',
          value: opcoes.map(o => `• ${o.label}`).join('\n')
        });
      
      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      console.error('Erro ao criar menu:', error);
      await interaction.reply({
        content: `❌ Erro ao criar menu: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
