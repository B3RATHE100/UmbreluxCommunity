import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
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

    const buttonId = `role_toggle_${cargo.id}`;
    
    const button = new ButtonBuilder()
      .setCustomId(buttonId)
      .setLabel(etiqueta)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(emoji);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`🎯 ${etiqueta}`)
      .setDescription(`Clique no botão para ganhar/perder o cargo ${cargo.toString()}`);

    try {
      const msg = await canal.send({ embeds: [embed], components: [row] });
      
      const guildConfig = db.getGuildConfig(interaction.guild.id);
      if (!guildConfig.roleButtons) {
        guildConfig.roleButtons = [];
      }
      
      guildConfig.roleButtons.push({
        messageId: msg.id,
        channelId: canal.id,
        roleId: cargo.id,
        buttonId: buttonId
      });
      
      db.updateGuildConfig(interaction.guild.id, guildConfig);
      
      const confirmEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Botão de Cargo Criado!')
        .setDescription(`Botão **${etiqueta}** criado em ${canal.toString()}\nCargo: ${cargo.toString()}`);
      
      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      await interaction.reply({
        content: `❌ Erro ao criar botão: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
