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

    // Primeira imagem - banner de boas-vindas
    const welcomeBannerEmbed = new EmbedBuilder()
      .setColor(0x8BB9FE)
      .setImage('https://cdn.discordapp.com/attachments/1426648046074335295/1441821961474019388/1763788081783.jpg');

    // Texto principal estilizado
    const mainTextEmbed = new EmbedBuilder()
      .setColor(0x8BB9FE)
      .setDescription(
        `（ᴖ͈𐎟ᴖ͈）𝅙﹒<a:emoji_58:1441724281200578681>𝅙✣𝅙﹒É maravilhoso ver você aqui! Este é um espaço para fazer amizades, se divertir e mergulhar na energia do nosso mundo.﹒𝅙𖹭𝅙𝅙┈𝅙𝅙﹒୨`
      );

    // Imagem do separador
    const separatorEmbed = new EmbedBuilder()
      .setColor(0x8BB9FE)
      .setImage('https://www.imagensanimadas.com/data/media/1081/linha-de-natal-imagem-animada-0045.gif');

    // Instruções detalhadas
    const instructionsEmbed = new EmbedBuilder()
      .setColor(0x8BB9FE)
      .setDescription(
        `バ𝅙﹒𝅙๑<a:emoji_59:1441724362729328691>﹒𝅙**[Registre-se](https://discord.com/channels/1321841848670490674/1438400416781041778)** no canal de registro para que possamos te conhecer melhor. ﹒𝅙海𝅙◞𝅙𝅙空 \n` +
        `バ𝅙﹒𝅙๑<a:emoji_60:1441724423005798430>﹒𝅙**[Escolha sua cor](https://discord.com/channels/1321841848670490674/1438400543398821938)** visitando o canal de cores.﹒𝅙海𝅙◞𝅙𝅙空  \n` +
        `バ𝅙﹒𝅙๑<a:emoji_61:1441725286851940462>﹒𝅙**Apresente-se** no canal de se apresentar e conte um pouco sobre você.﹒𝅙海𝅙◞𝅙𝅙空 \n` +
        `バ𝅙﹒𝅙๑<a:emoji_62:1441725351855128678>﹒𝅙**[Configure suas notificações](https://discord.com/channels/1321841848670490674/1438401064817918104)** no canal Pings para não perder nada.﹒𝅙海𝅙◞𝅙𝅙空 \n` +
        `バ𝅙﹒𝅙๑<a:emoji_63:1441725414400856098>﹒𝅙Depois disso, **explore os demais canais** e mergulhe na energia do Umbrelux.﹒𝅙海𝅙◞𝅙𝅙空   \n\n` +
        `-# ➻﹒𝅙១<a:emoji_64:1441726976674103407>﹒合𝅙𝅙𝅙⸻  **Participe, divirta-se e faça sua presença brilhar.**﹒バ﹒✦`
      );

    // Imagem final (será substituída por uma imagem do servidor se disponível)
    const finalImageEmbed = new EmbedBuilder()
      .setColor(0x8BB9FE)
      .setImage(member.guild.iconURL({ size: 512 }) || 'https://via.placeholder.com/512x256/8BB9FE/FFFFFF?text=Bem-vindo!')
      .setFooter({ 
        text: `Membro #${member.guild.memberCount}`,
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
        embeds: [welcomeBannerEmbed, mainTextEmbed, separatorEmbed, instructionsEmbed, finalImageEmbed],
        components: [row]
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
    }
  }
};
