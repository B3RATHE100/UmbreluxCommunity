import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits
} from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { formatRoleRewardsList } from '../utils/roleRewards.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Painel de configuração do sistema de níveis (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const guildConfig = db.getGuildConfig(interaction.guild.id);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.shield} Painel de Configuração - Veil`)
      .setDescription(
        'Configure o sistema de níveis e recompensas do servidor.\n\n' +
        '**Configurações Atuais:**'
      )
      .addFields(
        {
          name: '📢 Canal de Boas-vindas',
          value: guildConfig.welcomeChannelId 
            ? `<#${guildConfig.welcomeChannelId}>`
            : '❌ Não configurado',
          inline: true
        },
        {
          name: '🎉 Canal de Level Up',
          value: guildConfig.levelUpChannelId
            ? `<#${guildConfig.levelUpChannelId}>`
            : '❌ Não configurado (usa canal atual)',
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true
        },
        {
          name: `${config.emojis.crown} Recompensas de Cargo`,
          value: formatRoleRewardsList(interaction.guild, guildConfig.roleRewards)
        },
        {
          name: '📊 Sistema de XP',
          value: 
            `**Mensagens:** ${config.xp.messageMin}-${config.xp.messageMax} XP (cooldown: ${config.xp.messageCooldown / 1000}s)\n` +
            `**Voice:** ${config.xp.voicePerMinute} XP por minuto`
        }
      )
      .setFooter({ 
        text: 'Use os menus abaixo para configurar',
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('config_select')
      .setPlaceholder('Selecione uma opção de configuração')
      .addOptions(
        {
          label: 'Definir Canal de Boas-vindas',
          description: 'Configure onde as mensagens de boas-vindas serão enviadas',
          value: 'set_welcome_channel',
          emoji: '📢'
        },
        {
          label: 'Definir Canal de Level Up',
          description: 'Configure onde as notificações de level up serão enviadas',
          value: 'set_levelup_channel',
          emoji: '🎉'
        },
        {
          label: 'Adicionar Recompensa de Cargo',
          description: 'Adicione um cargo como recompensa para um nível',
          value: 'add_role_reward',
          emoji: '➕'
        },
        {
          label: 'Remover Recompensa de Cargo',
          description: 'Remova uma recompensa de cargo existente',
          value: 'remove_role_reward',
          emoji: '➖'
        },
        {
          label: 'Ver Todas as Recompensas',
          description: 'Veja lista completa de recompensas configuradas',
          value: 'view_rewards',
          emoji: '📋'
        }
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      ephemeral: true 
    });
  }
};
