# Veil Discord Bot

## Visão Geral
Bot de Discord com tema do mangá Veil que gerencia um sistema completo de níveis, XP e cargos de recompensa para o servidor Umbrelux.

## Funcionalidades Principais
- **Mensagem de Boas-vindas**: Mensagens automáticas em embed estilizado quando novos membros entram
- **Sistema de Níveis**: Ganhe XP por mensagens em chat e tempo em voice calls
- **Cargos de Recompensa**: Ganhe cargos automaticamente ao alcançar certos níveis
- **Comandos**: `/perfil`, `/rank`, `/config` (admin)
- **Painel Admin**: Interface com botões e menus para configurar recompensas

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
  │   └── voiceStateUpdate.js # XP por voice
  ├── commands/          # Comandos slash
  │   ├── perfil.js      # Ver perfil e XP
  │   ├── rank.js        # Leaderboard
  │   └── config.js      # Painel admin
  └── utils/             # Funções auxiliares
      ├── levelSystem.js # Lógica de níveis
      └── roleRewards.js # Lógica de cargos
```

## Configuração
1. Token do bot é gerenciado pela integração Discord do Replit
2. Configure os cargos de recompensa usando o comando `/config`

## Tecnologias
- Node.js 20
- Discord.js v14
- In-memory database (javascript_mem_db integration)

## Última Atualização
23 de novembro de 2025 - Criação inicial do projeto
