# Veil Discord Bot

## Visão Geral
Bot de Discord com tema do mangá Veil que gerencia um sistema completo de níveis separados (chat e voice), XP, cargos de recompensa, loja, embeds personalizadas e botões de cargo para o servidor Umbrelux.

## Funcionalidades Principais
- **Mensagem de Boas-vindas**: Mensagens automáticas em embed estilizado quando novos membros entram
- **Sistema de Níveis Dual**:
  - **Chat**: Ganhe XP conversando nos canais de texto
  - **Voice**: Ganhe XP participando de calls de voz
- **Cargos de Recompensa Separados**: Configure cargos diferentes para níveis de chat e voice
- **Sistema de Recompensa Diária**: Colete XP diário com bônus de sequência
- **Sistema de Conquistas**: Desbloqueie conquistas especiais por atividades
- **Botões Interativos de Cargo**: Crie botões que dão/removem cargos ao clicar (toggle)
- **Sistema de Loja**: Venda itens por moedas
- **Embeds Personalizadas**: Crie embeds customizadas facilmente
- **16 Comandos Únicos**: Sistema completo de comandos para perfil, ranking, conquistas, loja, embeds e mais

## Estrutura do Projeto
```
src/
  ├── index.js           # Arquivo principal do bot
  ├── config.js          # Configurações e constantes
  ├── database.js        # Sistema de armazenamento em memória
  ├── events/            # Eventos do Discord
  │   ├── ready.js       # Evento quando bot inicia
  │   ├── guildMemberAdd.js  # Boas-vindas
  │   ├── messageCreate.js   # XP por mensagens
  │   ├── interactionCreate.js # Comandos e botões
  │   └── voiceStateUpdate.js # XP por voice
  ├── commands/          # Comandos slash
  │   ├── perfil.js      # Ver perfil e XP
  │   ├── rank.js        # Leaderboard
  │   ├── config.js      # Painel admin
  │   ├── embed.js       # Criar embeds personalizadas
  │   ├── role-button.js # Criar botões de cargo toggle
  │   ├── shop.js        # Loja de itens
  │   └── mais...
  └── utils/             # Funções auxiliares
      ├── levelSystem.js # Lógica de níveis
      └── roleRewards.js # Lógica de cargos
```

## Configuração
1. Token do bot é gerenciado pela integração Discord do Replit
2. Configure os cargos de recompensa usando o comando `/config`
3. Crie embeds personalizadas com `/embed`
4. Configure botões de cargo com `/role-button`

## Tecnologias
- Node.js 20
- Discord.js v14
- In-memory database (javascript_mem_db integration)

## Comandos Disponíveis (16 Total)

### Comandos de Perfil e Progresso
- `/perfil` - Veja seu perfil completo (chat + voice)
- `/perfil-chat` - Veja apenas seu progresso de chat
- `/perfil-voice` - Veja apenas seu progresso de voice

### Comandos de Ranking
- `/rank` - Ranking geral combinado do servidor
- `/top-chat` - Ranking de membros mais ativos em chat
- `/top-voice` - Ranking de membros mais ativos em voice

### Comandos de Recompensas e Conquistas
- `/daily` - Colete sua recompensa diária de XP
- `/conquistas` - Veja suas conquistas desbloqueadas

### Comandos de Loja
- `/shop` - Visite a loja Veil e compre itens com moedas

### Comandos de Embeds e Cargos (Admin)
- `/embed` - Crie uma embed personalizada em qualquer canal
- `/role-button` - Configure um botão para dar/remover cargos automaticamente
- `/messages-config` - Configure mensagens personalizadas (boas-vindas, level up)

### Comandos Utilitários
- `/avatar` - Veja o avatar de qualquer usuário em HD
- `/serverinfo` - Informações detalhadas sobre o servidor

### Comandos de Administração
- `/config` - Painel completo de configuração (apenas admins)

## Sistema de Botões de Cargo
Quando um administrador usa `/role-button`:
- Cria um botão interativo em um canal
- Ao clicar, o membro ganha o cargo
- Clicando novamente, perde o cargo (toggle automático)
- Resposta privada ao usuário confirmando ação

## Sistema de Loja
- `/shop` exibe todos os itens disponíveis
- Selecionador para escolher items
- Cada usuário tem seu saldo de moedas

## Dados Armazenados por Usuário
- chatXP, chatLevel, voiceXP, voiceLevel
- dailyStreak, lastDailyTime
- coins, pets

## Última Atualização
24 de novembro de 2025 - Adicionados: `/embed`, `/role-button`, `/shop`, `/messages-config`; Sistema de botões de toggle de cargo; Removidos: `/pet`, `/registro`
