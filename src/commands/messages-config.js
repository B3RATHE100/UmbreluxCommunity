import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('messages-config')
    .setDescription('📝 Configure mensagens personalizadas do servidor (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('tipo')
        .setDescription('Tipo de mensagem')
        .setRequired(true)
        .addChoices(
          { name: 'Boas-vindas', value: 'welcome' },
          { name: 'Level Up', value: 'levelup' }
        )
    )
    .addStringOption(option =>
      option
        .setName('conteúdo')
        .setDescription('Conteúdo da mensagem')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const tipoMsg = interaction.options.getString('tipo');
    const conteudo = interaction.options.getString('conteúdo');
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        ephemeral: true
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle('📝 Configurar Mensagens Personalizadas')
      .setDescription(
        tipoMsg === 'welcome' 
          ? 'Configure a mensagem de boas-vindas do servidor'
          : 'Configure a mensagem de level up'
      );
    
    if (conteudo) {
      const guildConfig = db.getGuildConfig(interaction.guild.id);
      const msgKey = tipoMsg === 'welcome' ? 'welcomeMessage' : 'levelupMessage';
      
      db.updateGuildConfig(interaction.guild.id, {
        ...guildConfig,
        [msgKey]: conteudo
      });
      
      embed.setColor(config.colors.success)
        .setTitle('✅ Mensagem Atualizada!')
        .setDescription(`A mensagem de **${tipoMsg}** foi atualizada com sucesso!\n\n**Preview:**\n${conteudo}`);
    } else {
      embed.addFields({
        name: 'Como usar?',
        value: 'Use `/messages-config tipo:tipo conteúdo:sua-mensagem` para atualizar mensagens personalizadas.'
      });
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
