import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { db } from '../database.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pet')
    .setDescription('🐾 Crie e gerencie seus pets!'),
  
  async execute(interaction) {
    const userData = db.getUser(interaction.guild.id, interaction.user.id);
    
    const createBtn = new ButtonBuilder()
      .setCustomId('pet_create')
      .setLabel('Criar Pet')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🐾');
    
    const listBtn = new ButtonBuilder()
      .setCustomId('pet_list')
      .setLabel('Meus Pets')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📋');
    
    const row = new ActionRowBuilder().addComponents(createBtn, listBtn);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle('🐾 Sistema de Pets Veil')
      .setDescription(`Você tem **${userData.pets?.length || 0}** pet(s)`)
      .addFields({
        name: 'O que você pode fazer?',
        value: '• **Criar Pet** - Crie um novo pet para você\n• **Meus Pets** - Veja seus pets e cargos'
      });
    
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
