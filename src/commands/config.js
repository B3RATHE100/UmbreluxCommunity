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
    try {
      await interaction.deferReply({ ephemeral: true });

      const guildConfig = db.getGuildConfig(interaction.guild.id);
      
      let chatRewardsText = 'Nenhuma recompensa de chat configurada';
      let voiceRewardsText = 'Nenhuma recompensa de voice configurada';

      if (guildConfig.chatRoleRewards && guildConfig.chatRoleRewards.length > 0) {
        try {
          chatRewardsText = formatRoleRewardsList(interaction.guild, guildConfig.chatRoleRewards, 'chat');
        } catch (e) {
          chatRewardsText = `${guildConfig.chatRoleRewards.length} recompensa(s) de chat configurada(s)`;
        }
      }

      if (guildConfig.voiceRoleRewards && guildConfig.voiceRoleRewards.length > 0) {
        try {
          voiceRewardsText = formatRoleRewardsList(interaction.guild, guildConfig.voiceRoleRewards, 'voice');
        } catch (e) {
          voiceRewardsText = `${guildConfig.voiceRoleRewards.length} recompensa(s) de voice configurada(s)`;
        }
      }
      
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
            name: `${config.emojis.fire} Recompensas de Chat`,
            value: chatRewardsText,
            inline: false
          },
          {
            name: '🎙️ Recompensas de Voice',
            value: voiceRewardsText,
            inline: false
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
            label: 'Adicionar Recompensa de Chat',
            description: 'Adicione um cargo para nível de chat',
            value: 'add_chat_reward',
            emoji: '💬'
          },
          {
            label: 'Adicionar Recompensa de Voice',
            description: 'Adicione um cargo para nível de voice',
            value: 'add_voice_reward',
            emoji: '🎙️'
          },
          {
            label: 'Remover Recompensa de Chat',
            description: 'Remova uma recompensa de chat',
            value: 'remove_chat_reward',
            emoji: '❌'
          },
          {
            label: 'Remover Recompensa de Voice',
            description: 'Remova uma recompensa de voice',
            value: 'remove_voice_reward',
            emoji: '🚫'
          },
          {
            label: 'Ver Todas as Recompensas',
            description: 'Veja lista completa de recompensas configuradas',
            value: 'view_rewards',
            emoji: '📋'
          }
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({ 
        embeds: [embed], 
        components: [row]
      });
    } catch (error) {
      console.error('Erro ao executar config:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Erro ao abrir o painel de configuração!',
          ephemeral: true
        });
      }
    }
  }
};
