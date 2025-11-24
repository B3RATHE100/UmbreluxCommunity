import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-button')
    .setDescription('🎯 Configure um botão para dar/remover cargo (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('etiqueta')
        .setDescription('Texto do botão')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('cargo')
        .setDescription('Cargo a dar/remover')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal para enviar o botão')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('emoji')
        .setDescription('Emoji do botão')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('link-mensagem')
        .setDescription('Link da mensagem para adicionar botão')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('estilo')
        .setDescription('Estilo do botão')
        .setRequired(false)
        .addChoices(
          { name: 'Azul (Primário)', value: 'Primary' },
          { name: 'Cinza (Secundário)', value: 'Secondary' },
          { name: 'Verde (Sucesso)', value: 'Success' },
          { name: 'Vermelho (Perigo)', value: 'Danger' }
        )
    )
    .addStringOption(option =>
      option
        .setName('descricao')
        .setDescription('Descrição personalizada do botão')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        ephemeral: true
      });
    }

    const etiqueta = interaction.options.getString('etiqueta');
    const cargo = interaction.options.getRole('cargo');
    const emoji = interaction.options.getString('emoji') || '✨';
    const canal = interaction.options.getChannel('canal');
    const linkMensagem = interaction.options.getString('link-mensagem');
    const estilo = interaction.options.getString('estilo') || 'Primary';
    const descricaoCustom = interaction.options.getString('descricao');

    const buttonId = `role_toggle_${cargo.id}`;
    
    const buttonStyle = ButtonStyle[estilo] || ButtonStyle.Primary;
    const button = new ButtonBuilder()
      .setCustomId(buttonId)
      .setLabel(etiqueta)
      .setStyle(buttonStyle)
      .setEmoji(emoji);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`🎯 ${etiqueta}`)
      .setDescription(descricaoCustom || `Clique no botão para ganhar/perder o cargo ${cargo.toString()}`);

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
        msg = await canal.send({ embeds: [embed], components: [row] });
      }
      
      const guildConfig = db.getGuildConfig(interaction.guild.id);
      if (!guildConfig.roleButtons) {
        guildConfig.roleButtons = [];
      }
      
      guildConfig.roleButtons.push({
        messageId: msg.id,
        channelId: msg.channelId,
        roleId: cargo.id,
        buttonId: buttonId
      });
      
      db.updateGuildConfig(interaction.guild.id, guildConfig);
      
      const confirmEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Botão de Cargo Criado!')
        .setDescription(`Botão **${etiqueta}** ${linkMensagem ? 'adicionado à mensagem' : 'criado em ' + canal.toString()}\nCargo: ${cargo.toString()}\nEstilo: ${estilo}`);
      
      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      await interaction.reply({
        content: `❌ Erro ao criar botão: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
