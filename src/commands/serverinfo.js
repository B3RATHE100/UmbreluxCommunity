import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Veja informações detalhadas sobre o servidor'),
  
  async execute(interaction) {
    const { guild } = interaction;
    
    const owner = await guild.fetchOwner();
    
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostTier = guild.premiumTier;
    
    const createdDate = Math.floor(guild.createdTimestamp / 1000);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.shield} Informações do Servidor`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '📋 Nome',
          value: `**${guild.name}**`,
          inline: true
        },
        {
          name: '🆔 ID',
          value: `\`${guild.id}\``,
          inline: true
        },
        {
          name: `${config.emojis.crown} Dono`,
          value: `${owner.toString()}`,
          inline: true
        },
        {
          name: '👥 Membros',
          value: `**${guild.memberCount}** membros`,
          inline: true
        },
        {
          name: '📅 Criado em',
          value: `<t:${createdDate}:D>\n(<t:${createdDate}:R>)`,
          inline: true
        },
        {
          name: '💎 Nível de Boost',
          value: `Tier **${boostTier}** (${boosts} boosts)`,
          inline: true
        },
        {
          name: '📁 Canais',
          value: `💬 ${textChannels} Texto\n🔊 ${voiceChannels} Voz\n📂 ${categories} Categorias`,
          inline: true
        },
        {
          name: '🎭 Cargos',
          value: `**${roles}** cargos`,
          inline: true
        },
        {
          name: '😄 Emojis',
          value: `**${emojis}** emojis`,
          inline: true
        }
      )
      .setFooter({ 
        text: `Servidor criado`,
        iconURL: guild.iconURL()
      })
      .setTimestamp(guild.createdTimestamp);
    
    if (guild.banner) {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
