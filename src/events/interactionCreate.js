import { 
  EmbedBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  ChannelType 
} from 'discord.js';
import { db } from '../database.js';
import { config, getProgressToNextLevel } from '../config.js';
import { formatRoleRewardsList } from '../utils/roleRewards.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      
      if (!command) {
        console.error(`Comando ${interaction.commandName} não encontrado`);
        return;
      }
      
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Erro ao executar ${interaction.commandName}:`, error);
        
        const errorMessage = { 
          content: '❌ Ocorreu um erro ao executar este comando!', 
          ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    }
    
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
    
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction);
    }
    
    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    }
  }
};

async function handleButtonInteraction(interaction) {
  const { customId } = interaction;
  
  if (customId.startsWith('role_toggle_')) {
    const roleId = customId.replace('role_toggle_', '');
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
      return await interaction.reply({
        content: '❌ Este cargo não existe mais!',
        ephemeral: true
      });
    }
    
    const hasRole = interaction.member.roles.cache.has(roleId);
    
    try {
      if (hasRole) {
        await interaction.member.roles.remove(roleId);
        const embed = new EmbedBuilder()
          .setColor(config.colors.warning)
          .setTitle('🔓 Cargo Removido')
          .setDescription(`Você perdeu o cargo ${role.toString()}`);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.member.roles.add(roleId);
        const embed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setTitle('🎯 Cargo Adicionado')
          .setDescription(`Você ganhou o cargo ${role.toString()}`);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Erro ao gerenciar cargo:', error);
      await interaction.reply({
        content: '❌ Erro ao adicionar/remover cargo!',
        ephemeral: true
      });
    }
    return;
  }
}

async function handleSelectMenuInteraction(interaction) {
  const { customId, values } = interaction;
  
  const guildConfig = db.getGuildConfig(interaction.guild.id);
  const menuConfig = guildConfig.selectMenus ? guildConfig.selectMenus[customId] : null;
  
  if (menuConfig && menuConfig.type === 'cargos') {
    const selectedValue = values[0];
    const selectedOption = menuConfig.opcoes.find(opt => opt.value === selectedValue);
    
    if (!selectedOption) {
      return await interaction.reply({
        content: '❌ Opção inválida!',
        ephemeral: true
      });
    }
    
    const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === selectedOption.label.toLowerCase());
    if (!role) {
      return await interaction.reply({
        content: '❌ Cargo não encontrado!',
        ephemeral: true
      });
    }
    
    const hasRole = interaction.member.roles.cache.has(role.id);
    try {
      if (hasRole) {
        await interaction.member.roles.remove(role.id);
        const embed = new EmbedBuilder()
          .setColor(config.colors.warning)
          .setTitle('🔓 Cargo Removido')
          .setDescription(`Você perdeu o cargo ${role.toString()}`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.member.roles.add(role.id);
        const embed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setTitle('🎯 Cargo Adicionado')
          .setDescription(`Você ganhou o cargo ${role.toString()}`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      await interaction.reply({
        content: '❌ Erro ao adicionar/remover cargo!',
        ephemeral: true
      });
    }
    return;
  }
  
  if (customId === 'shop_select') {
    const selected = values[0];
    const userData = await db.getUser(interaction.guild.id, interaction.user.id);
    const guildConfig = db.getGuildConfig(interaction.guild.id);
    
    if (!guildConfig.shopItems || !guildConfig.shopItems[parseInt(selected)]) {
      return await interaction.reply({
        content: '❌ Item não encontrado!',
        ephemeral: true
      });
    }
    
    const item = guildConfig.shopItems[parseInt(selected)];
    
    if (userData.coins < item.price) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('❌ Moedas Insuficientes')
        .setDescription(`Você precisa de **${item.price}** moedas, mas tem apenas **${userData.coins}**`);
      
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    userData.coins -= item.price;
    await db.updateUser(interaction.guild.id, interaction.user.id, userData);
    
    const confirmEmbed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('✅ Compra Realizada!')
      .setDescription(`Você comprou **${item.name}** por **${item.price}** moedas!\n\nSaldo atual: **${userData.coins}** moedas`);
    
    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    return;
  }
}

async function handleModalSubmit(interaction) {
  const { customId } = interaction;
  
  if (customId === 'modal_welcome_channel') {
    const channelId = interaction.fields.getTextInputValue('channel_id').trim();
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ 
        content: '❌ Canal inválido!', 
        ephemeral: true 
      });
    }
    
    await db.updateGuildConfig(interaction.guild.id, { welcomeChannelId: channelId });
    
    await interaction.reply({ 
      content: `✅ Canal de boas-vindas configurado para ${channel.toString()}!`, 
      ephemeral: true 
    });
  }
}
