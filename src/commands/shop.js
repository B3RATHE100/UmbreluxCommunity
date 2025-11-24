import { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛍️ Visite a loja Veil e compre itens com moedas!'),
  
  async execute(interaction) {
    const guildConfig = db.getGuildConfig(interaction.guild.id);
    const userData = db.getUser(interaction.guild.id, interaction.user.id);
    
    if (!guildConfig.shopItems || guildConfig.shopItems.length === 0) {
      return interaction.reply({
        content: '❌ A loja ainda não possui itens! Um administrador precisa adicionar itens primeiro.',
        ephemeral: true
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle('🛍️ Loja Veil')
      .setDescription(`Seu saldo: **${userData.coins}** 💰`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }));
    
    guildConfig.shopItems.forEach((item, idx) => {
      embed.addFields({
        name: `${idx + 1}. ${item.name} (${item.price} 💰)`,
        value: item.description || 'Item especial da loja'
      });
    });
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('shop_select')
      .setPlaceholder('Escolha um item para comprar')
      .addOptions(
        guildConfig.shopItems.map((item, idx) => ({
          label: item.name,
          value: idx.toString(),
          description: `${item.price} moedas`
        }))
      );
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
