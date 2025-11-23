# Veil Discord Bot

## Visão Geral
Bot de Discord com tema do mangá Veil que gerencia um sistema completo de níveis separados (chat e voice), XP e cargos de recompensa para o servidor Umbrelux.

## Funcionalidades Principais
- **Mensagem de Boas-vindas**: Mensagens automáticas em embed estilizado quando novos membros entram
- **Sistema de Níveis Dual**:
  - **Chat**: Ganhe XP conversando nos canais de texto
  - **Voice**: Ganhe XP participando de calls de voz
- **Cargos de Recompensa Separados**: Configure cargos diferentes para níveis de chat e voice
- **Sistema de Recompensa Diária**: Colete XP diário com bônus de sequência
- **Sistema de Conquistas**: Desbloqueie conquistas especiais por atividades
- **11 Comandos Únicos**: Sistema completo de comandos para perfil, ranking, conquistas e mais

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

## Comandos Disponíveis

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

### Comandos Utilitários
- `/avatar` - Veja o avatar de qualquer usuário em HD
- `/serverinfo` - Informações detalhadas sobre o servidor

### Comandos de Administração
- `/config` - Painel completo de configuração (apenas admins)

## Última Atualização
23 de novembro de 2025 - Sistema de níveis separados (chat/voice) implementado com 11 comandos
