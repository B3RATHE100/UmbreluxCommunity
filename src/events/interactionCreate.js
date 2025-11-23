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
  
  if (customId === 'view_rules') {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📋 Regras do Servidor')
      .setDescription(
        'Bem-vindo! Aqui estão as regras básicas:\n\n' +
        '1️⃣ Respeite todos os membros\n' +
        '2️⃣ Sem spam ou flood\n' +
        '3️⃣ Mantenha os canais organizados\n' +
        '4️⃣ Divirta-se e seja ativo!\n\n' +
        'Use `/perfil` para ver seu progresso!'
      );
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  if (customId === 'get_started') {
    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🎮 Como Começar')
      .setDescription(
        `**Sistema de Níveis:**\n` +
        `${config.emojis.fire} Ganhe XP conversando nos chats\n` +
        `${config.emojis.star} Ganhe XP participando de calls de voz\n` +
        `${config.emojis.trophy} Suba de nível e ganhe cargos exclusivos!\n\n` +
        `**Comandos Úteis:**\n` +
        `\`/perfil\` - Veja seu nível e progresso\n` +
        `\`/rank\` - Veja o ranking do servidor\n\n` +
        `**Dicas:**\n` +
        `• Seja ativo para ganhar mais XP\n` +
        `• Participe das calls para XP bônus\n` +
        `• Interaja com a comunidade!`
      );
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  if (customId === 'view_profile') {
    const userData = db.getUser(interaction.guild.id, interaction.user.id);
    const chatProgress = getProgressToNextLevel(userData.chatXP);
    const voiceProgress = getProgressToNextLevel(userData.voiceXP);
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.veil)
      .setTitle(`${config.emojis.shield} Seu Perfil`)
      .setDescription(
        `**Chat:**\n` +
        `Nível ${chatProgress.currentLevel} • ${userData.chatXP} XP\n\n` +
        `**Voice:**\n` +
        `Nível ${voiceProgress.currentLevel} • ${userData.voiceXP} XP\n\n` +
        `Use \`/perfil\` para mais detalhes!`
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

async function handleSelectMenuInteraction(interaction) {
  const { customId, values } = interaction;
  
  if (customId === 'welcome_actions') {
    const selected = values[0];
    
    if (selected === 'view_rules') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('📋 Regras do Servidor')
        .setDescription(
          'Bem-vindo! Aqui estão as regras básicas:\n\n' +
          '1️⃣ Respeite todos os membros\n' +
          '2️⃣ Sem spam ou flood\n' +
          '3️⃣ Mantenha os canais organizados\n' +
          '4️⃣ Divirta-se e seja ativo!\n\n' +
          'Use `/perfil` para ver seu progresso!'
        );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (selected === 'get_started') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🎮 Como Começar')
        .setDescription(
          `**Sistema de Níveis:**\n` +
          `${config.emojis.fire} Ganhe XP conversando nos chats\n` +
          `${config.emojis.star} Ganhe XP participando de calls de voz\n` +
          `${config.emojis.trophy} Suba de nível e ganhe cargos exclusivos!\n\n` +
          `**Comandos Úteis:**\n` +
          `\`/perfil\` - Veja seu nível e progresso\n` +
          `\`/rank\` - Veja o ranking do servidor\n\n` +
          `**Dicas:**\n` +
          `• Seja ativo para ganhar mais XP\n` +
          `• Participe das calls para XP bônus\n` +
          `• Interaja com a comunidade!`
        );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (selected === 'view_profile') {
      const userData = db.getUser(interaction.user.id, interaction.guild.id);
      const progress = getProgressToNextLevel(userData.chatXP);
      
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('📊 Seu Perfil')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: `${config.emojis.fire} Nível de Chat`,
            value: `**${progress.currentLevel}** (${progress.currentXP}/${progress.requiredXP} XP)`,
            inline: true
          },
          {
            name: `${config.emojis.star} XP Total`,
            value: `**${userData.chatXP.toLocaleString()}**`,
            inline: true
          }
        )
        .setFooter({ text: `Use /perfil para ver mais detalhes!` });
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
  
  if (customId === 'config_select') {
    const selected = values[0];
    
    if (selected === 'set_welcome_channel') {
      const modal = new ModalBuilder()
        .setCustomId('modal_welcome_channel')
        .setTitle('Configurar Canal de Boas-vindas');
      
      const channelInput = new TextInputBuilder()
        .setCustomId('channel_id')
        .setLabel('ID do Canal')
        .setPlaceholder('Cole o ID do canal aqui')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      const row = new ActionRowBuilder().addComponents(channelInput);
      modal.addComponents(row);
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'set_levelup_channel') {
      const modal = new ModalBuilder()
        .setCustomId('modal_levelup_channel')
        .setTitle('Configurar Canal de Level Up');
      
      const channelInput = new TextInputBuilder()
        .setCustomId('channel_id')
        .setLabel('ID do Canal')
        .setPlaceholder('Cole o ID do canal aqui (vazio = canal atual)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      
      const row = new ActionRowBuilder().addComponents(channelInput);
      modal.addComponents(row);
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'add_chat_reward') {
      const modal = new ModalBuilder()
        .setCustomId('modal_add_chat_reward')
        .setTitle('Adicionar Recompensa de Chat');
      
      const levelInput = new TextInputBuilder()
        .setCustomId('level')
        .setLabel('Nível de Chat Necessário')
        .setPlaceholder('Ex: 5')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      const roleInput = new TextInputBuilder()
        .setCustomId('role_id')
        .setLabel('ID do Cargo')
        .setPlaceholder('Cole o ID do cargo aqui')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      modal.addComponents(
        new ActionRowBuilder().addComponents(levelInput),
        new ActionRowBuilder().addComponents(roleInput)
      );
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'add_voice_reward') {
      const modal = new ModalBuilder()
        .setCustomId('modal_add_voice_reward')
        .setTitle('Adicionar Recompensa de Voice');
      
      const levelInput = new TextInputBuilder()
        .setCustomId('level')
        .setLabel('Nível de Voice Necessário')
        .setPlaceholder('Ex: 5')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      const roleInput = new TextInputBuilder()
        .setCustomId('role_id')
        .setLabel('ID do Cargo')
        .setPlaceholder('Cole o ID do cargo aqui')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      modal.addComponents(
        new ActionRowBuilder().addComponents(levelInput),
        new ActionRowBuilder().addComponents(roleInput)
      );
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'remove_chat_reward') {
      const modal = new ModalBuilder()
        .setCustomId('modal_remove_chat_reward')
        .setTitle('Remover Recompensa de Chat');
      
      const levelInput = new TextInputBuilder()
        .setCustomId('level')
        .setLabel('Nível de Chat da Recompensa')
        .setPlaceholder('Ex: 5')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      const row = new ActionRowBuilder().addComponents(levelInput);
      modal.addComponents(row);
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'remove_voice_reward') {
      const modal = new ModalBuilder()
        .setCustomId('modal_remove_voice_reward')
        .setTitle('Remover Recompensa de Voice');
      
      const levelInput = new TextInputBuilder()
        .setCustomId('level')
        .setLabel('Nível de Voice da Recompensa')
        .setPlaceholder('Ex: 5')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      const row = new ActionRowBuilder().addComponents(levelInput);
      modal.addComponents(row);
      
      await interaction.showModal(modal);
    }
    
    if (selected === 'view_rewards') {
      const guildConfig = db.getGuildConfig(interaction.guild.id);
      
      const chatRewards = formatRoleRewardsList(interaction.guild, guildConfig.chatRoleRewards, 'chat');
      const voiceRewards = formatRoleRewardsList(interaction.guild, guildConfig.voiceRoleRewards, 'voice');
      
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${config.emojis.crown} Recompensas Configuradas`)
        .addFields(
          {
            name: `${config.emojis.fire} Recompensas de Chat`,
            value: chatRewards,
            inline: false
          },
          {
            name: '🎙️ Recompensas de Voice',
            value: voiceRewards,
            inline: false
          }
        )
        .setFooter({ 
          text: `Total: ${guildConfig.chatRoleRewards.length} chat, ${guildConfig.voiceRoleRewards.length} voice` 
        });
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

async function handleModalSubmit(interaction) {
  const { customId } = interaction;
  
  if (customId === 'modal_welcome_channel') {
    const channelId = interaction.fields.getTextInputValue('channel_id').trim();
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ 
        content: '❌ Canal inválido! Certifique-se de usar o ID de um canal de texto.', 
        ephemeral: true 
      });
    }
    
    db.updateGuildConfig(interaction.guild.id, { welcomeChannelId: channelId });
    
    await interaction.reply({ 
      content: `✅ Canal de boas-vindas configurado para ${channel.toString()}!`, 
      ephemeral: true 
    });
  }
  
  if (customId === 'modal_levelup_channel') {
    const channelId = interaction.fields.getTextInputValue('channel_id').trim();
    
    if (!channelId) {
      db.updateGuildConfig(interaction.guild.id, { levelUpChannelId: null });
      return interaction.reply({ 
        content: '✅ Notificações de level up serão enviadas no canal atual!', 
        ephemeral: true 
      });
    }
    
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ 
        content: '❌ Canal inválido! Certifique-se de usar o ID de um canal de texto.', 
        ephemeral: true 
      });
    }
    
    db.updateGuildConfig(interaction.guild.id, { levelUpChannelId: channelId });
    
    await interaction.reply({ 
      content: `✅ Canal de level up configurado para ${channel.toString()}!`, 
        ephemeral: true 
    });
  }
  
  if (customId === 'modal_add_chat_reward') {
    const level = parseInt(interaction.fields.getTextInputValue('level').trim());
    const roleId = interaction.fields.getTextInputValue('role_id').trim();
    
    if (isNaN(level) || level < 1) {
      return interaction.reply({ 
        content: '❌ Nível inválido! Use um número maior que 0.', 
        ephemeral: true 
      });
    }
    
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
      return interaction.reply({ 
        content: '❌ Cargo não encontrado! Verifique se o ID está correto.', 
        ephemeral: true 
      });
    }
    
    db.addRoleReward(interaction.guild.id, level, roleId, 'chat');
    
    await interaction.reply({ 
      content: `✅ Recompensa de Chat adicionada! Nível **${level}** → ${role.toString()}`, 
      ephemeral: true 
    });
  }
  
  if (customId === 'modal_add_voice_reward') {
    const level = parseInt(interaction.fields.getTextInputValue('level').trim());
    const roleId = interaction.fields.getTextInputValue('role_id').trim();
    
    if (isNaN(level) || level < 1) {
      return interaction.reply({ 
        content: '❌ Nível inválido! Use um número maior que 0.', 
        ephemeral: true 
      });
    }
    
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
      return interaction.reply({ 
        content: '❌ Cargo não encontrado! Verifique se o ID está correto.', 
        ephemeral: true 
      });
    }
    
    db.addRoleReward(interaction.guild.id, level, roleId, 'voice');
    
    await interaction.reply({ 
      content: `✅ Recompensa de Voice adicionada! Nível **${level}** → ${role.toString()}`, 
      ephemeral: true 
    });
  }
  
  if (customId === 'modal_remove_chat_reward') {
    const level = parseInt(interaction.fields.getTextInputValue('level').trim());
    
    if (isNaN(level) || level < 1) {
      return interaction.reply({ 
        content: '❌ Nível inválido! Use um número maior que 0.', 
        ephemeral: true 
      });
    }
    
    db.removeRoleReward(interaction.guild.id, level, 'chat');
    
    await interaction.reply({ 
      content: `✅ Recompensa de Chat do nível **${level}** removida!`, 
      ephemeral: true 
    });
  }
  
  if (customId === 'modal_remove_voice_reward') {
    const level = parseInt(interaction.fields.getTextInputValue('level').trim());
    
    if (isNaN(level) || level < 1) {
      return interaction.reply({ 
        content: '❌ Nível inválido! Use um número maior que 0.', 
        ephemeral: true 
      });
    }
    
    db.removeRoleReward(interaction.guild.id, level, 'voice');
    
    await interaction.reply({ 
      content: `✅ Recompensa de Voice do nível **${level}** removida!`, 
      ephemeral: true 
    });
  }
}
