
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';
import { db } from '../database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('preview-welcome')
    .setDescription('Visualize a mensagem de boas-vindas configurada (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const guildConfig = db.getGuildConfig(interaction.guild.id);
    
    // Verificar se há canal de boas-vindas configurado
    let welcomeChannel = null;
    if (guildConfig.welcomeChannelId) {
      welcomeChannel = interaction.guild.channels.cache.get(guildConfig.welcomeChannelId);
    }
    
    if (!welcomeChannel) {
      welcomeChannel = interaction.guild.channels.cache.find(
        channel => channel.name.includes('bem-vindo') || 
                   channel.name.includes('welcome') ||
                   channel.name.includes('entrada')
      );
    }
    
    if (!welcomeChannel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor(config.colors.error || '#ff0000')
        .setTitle('❌ Canal de Boas-vindas Não Configurado')
        .setDescription(
          'Nenhum canal de boas-vindas foi encontrado!\n\n' +
          '**Como configurar:**\n' +
          `${config.emojis.shield} Use \`/config\` para definir o canal\n` +
          '📢 Ou crie um canal com "bem-vindo", "welcome" ou "entrada" no nome'
        );
      
      return await interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
    }

    // Criar preview da mensagem de boas-vindas usando o usuário que executou o comando
    const member = interaction.member;
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.star} Bem-vindo ao Mundo de Veil!`)
      .setDescription(
        `**${member.toString()}** acabou de entrar no **${interaction.guild.name}**!\n\n` +
        `${config.emojis.shield} É maravilhoso ver você aqui! Este é um espaço para fazer amizades, ` +
        `se divertir e mergulhar na energia do nosso mundo inspirado em Veil.\n\n` +
        `**Primeiros Passos:**\n` +
        `${config.emojis.fire} Registre-se no canal de registro\n` +
        `${config.emojis.star} Escolha sua cor favorita\n` +
        `${config.emojis.trophy} Apresente-se para a comunidade\n` +
        `${config.emojis.crown} Configure suas notificações\n\n` +
        `**Sistema de Níveis:**\n` +
        `Ganhe XP conversando e participando em calls de voz! ` +
        `Use \`/perfil\` para ver seu progresso e cargos disponíveis.`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage('https://www.imagensanimadas.com/data/media/1081/linha-de-natal-imagem-animada-0045.gif')
      .setFooter({ 
        text: `Membro #${interaction.guild.memberCount} • Participe, divirta-se e faça sua presença brilhar!`,
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('📋 Ver Regras')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('view_rules')
          .setDisabled(true), // Desabilitado no preview
        new ButtonBuilder()
          .setLabel('🎮 Começar')
          .setStyle(ButtonStyle.Success)
          .setCustomId('get_started')
          .setDisabled(true), // Desabilitado no preview
        new ButtonBuilder()
          .setLabel('📊 Meu Perfil')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('view_profile')
          .setDisabled(true) // Desabilitado no preview
      );

    const infoEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📋 Preview da Mensagem de Boas-vindas')
      .setDescription(
        `**Canal configurado:** ${welcomeChannel.toString()}\n\n` +
        '⬇️ **Assim é como a mensagem aparecerá para novos membros:**'
      );

    await interaction.reply({ 
      embeds: [infoEmbed, embed],
      components: [row],
      ephemeral: true 
    });
  }
};
