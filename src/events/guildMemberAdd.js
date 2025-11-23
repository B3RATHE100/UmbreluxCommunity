import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config.js';
import { db } from '../database.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildConfig = db.getGuildConfig(member.guild.id);
    
    let welcomeChannel = null;
    if (guildConfig.welcomeChannelId) {
      welcomeChannel = member.guild.channels.cache.get(guildConfig.welcomeChannelId);
    }
    
    if (!welcomeChannel) {
      welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name.includes('bem-vindo') || 
                   channel.name.includes('welcome') ||
                   channel.name.includes('entrada')
      );
    }
    
    if (!welcomeChannel) {
      console.log('Canal de boas-vindas não encontrado');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.star} Bem-vindo ao Mundo de Veil!`)
      .setDescription(
        `**${member.toString()}** acabou de entrar no **${member.guild.name}**!\n\n` +
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
        text: `Membro #${member.guild.memberCount} • Participe, divirta-se e faça sua presença brilhar!`,
        iconURL: member.guild.iconURL() 
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('📋 Ver Regras')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('view_rules'),
        new ButtonBuilder()
          .setLabel('🎮 Começar')
          .setStyle(ButtonStyle.Success)
          .setCustomId('get_started'),
        new ButtonBuilder()
          .setLabel('📊 Meu Perfil')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('view_profile')
      );

    try {
      await welcomeChannel.send({ 
        content: `${member.toString()} 🎉`,
        embeds: [embed],
        components: [row]
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
    }
  }
};
