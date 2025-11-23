
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
      .setImage(interaction.guild.iconURL({ size: 512 }) || 'https://via.placeholder.com/512x256/8BB9FE/FFFFFF?text=Preview+Bem-vindo!')
      .setFooter({ 
        text: `Membro #${interaction.guild.memberCount}`,
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
      embeds: [infoEmbed, welcomeBannerEmbed, mainTextEmbed, separatorEmbed, instructionsEmbed, finalImageEmbed],
      components: [row],
      ephemeral: true 
    });
  }
};
