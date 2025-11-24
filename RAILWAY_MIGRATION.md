# Migração do Bot Veil para Railway

## 📋 Resumo das Mudanças

Este documento detalha as alterações necessárias para migrar o bot Discord de Replit para Railway com suporte a banco de dados PostgreSQL persistente.

---

## 🔧 Alterações Implementadas

### 1. **Banco de Dados - Nova Implementação PostgreSQL**

#### Arquivo: `src/database.js`

**O que mudou:**
- ❌ **Removido:** Sistema de armazenamento em memória (Maps)
- ✅ **Adicionado:** Conexão com PostgreSQL via `pg` (client Node.js)

**Configuração de Conexão:**
```javascript
const databaseUrl = process.env.DATABASE_URL;

this.pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});
```

**Variáveis Requeridas:**
- `DATABASE_URL` - String de conexão PostgreSQL obrigatória

**Formato DATABASE_URL:**
```
postgresql://username:password@hostname:port/database_name
```

**Tabelas Criadas Automaticamente:**

```sql
users                  -- Dados de usuários (XP, níveis, moedas)
guild_configs          -- Configurações por servidor
voice_tracking         -- Rastreamento de voz ativo
```

---

### 2. **Bot Principal - Inicialização do Banco**

#### Arquivo: `src/index.js`

**Mudanças:**
```javascript
// ✅ NOVO: Importar módulo de banco de dados
import { db } from './database.js';

// ✅ NOVO: Inicializar banco antes de conectar ao Discord
async function main() {
  try {
    console.log('🗄️  Inicializando banco de dados...');
    await db.initialize();  // Conecta e cria tabelas
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
  
  // ... resto do código
}
```

---

### 3. **Variáveis de Ambiente**

#### Token do Discord
✅ Já estava correto:
```javascript
const token = process.env.DISCORD_BOT_TOKEN;
```

#### Banco de Dados (NOVO)
```javascript
const databaseUrl = process.env.DATABASE_URL;
```

**Arquivo de exemplo:** `.env.example`
```
DISCORD_BOT_TOKEN=seu_token_aqui
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## 🚀 Configuração no Railway

### Passo 1: Criar Projeto no Railway

1. Acesse [Railway.app](https://railway.app)
2. Clique em "New Project" → "Deploy from GitHub"
3. Conecte seu repositório

### Passo 2: Adicionar Banco de Dados PostgreSQL

1. No dashboard do Railway, clique em "Add Service"
2. Selecione "PostgreSQL"
3. Railway criará automaticamente `DATABASE_URL`

### Passo 3: Configurar Variáveis de Ambiente

1. Vá para "Variables" no Railway
2. Adicione `DISCORD_BOT_TOKEN` com o token do seu bot
3. `DATABASE_URL` será adicionada automaticamente pelo PostgreSQL

### Passo 4: Comando de Inicialização

✅ Já está configurado em `package.json`:
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

Railway usará este comando automaticamente.

---

## 📊 Schema do Banco de Dados

### Tabela: `users`
```sql
user_id              VARCHAR(20)  -- ID do Discord
guild_id             VARCHAR(20)  -- ID do Servidor
chat_xp              INTEGER      -- XP de Chat
chat_level           INTEGER      -- Nível de Chat
voice_xp             INTEGER      -- XP de Voz
voice_level          INTEGER      -- Nível de Voz
messages             INTEGER      -- Total de mensagens
voice_time           INTEGER      -- Tempo em voz (ms)
last_message_time    BIGINT       -- Timestamp última mensagem
last_daily_time      BIGINT       -- Timestamp último daily
daily_streak         INTEGER      -- Sequência de dailys
coins                INTEGER      -- Moedas
pets                 JSONB        -- Array de pets
```

### Tabela: `guild_configs`
```sql
guild_id             VARCHAR(20)  -- ID do Servidor
welcome_channel_id   VARCHAR(20)  -- Canal de boas-vindas
level_up_channel_id  VARCHAR(20)  -- Canal de level up
chat_role_rewards    JSONB        -- Recompensas de chat
voice_role_rewards   JSONB        -- Recompensas de voz
shop_items           JSONB        -- Itens da loja
role_buttons         JSONB        -- Botões de cargo
select_menus         JSONB        -- Menus selecionadores
```

### Tabela: `voice_tracking`
```sql
user_id              VARCHAR(20)  -- ID do usuário
guild_id             VARCHAR(20)  -- ID do servidor
start_time           BIGINT       -- Timestamp início
```

---

## ✅ Checklist de Migração

- [x] Implementar conexão PostgreSQL com DATABASE_URL
- [x] Criar schema de tabelas automaticamente
- [x] Migrar lógica de usuários para banco
- [x] Migrar lógica de configurações de servidor
- [x] Adicionar suporte a variáveis de ambiente
- [x] Manter compatibilidade com API existente (métodos não mudaram)
- [ ] Você: Deploy no Railway
- [ ] Você: Testar conexão e funcionalidades

---

## 🔄 Métodos Mantidos (Compatíveis)

Todos os métodos da classe Database mantêm a mesma assinatura:

```javascript
// Usuários
await db.getUser(guildId, userId)
await db.updateUser(guildId, userId, data)
await db.addChatXP(guildId, userId, amount)
await db.addVoiceXP(guildId, userId, amount)

// Leaderboards
await db.getLeaderboard(guildId, limit)
await db.getChatLeaderboard(guildId, limit)
await db.getVoiceLeaderboard(guildId, limit)

// Configurações
await db.getGuildConfig(guildId)
await db.updateGuildConfig(guildId, data)

// Recompensas
await db.addRoleReward(guildId, level, roleId, type)
await db.removeRoleReward(guildId, level, type)
await db.getRoleRewardsForLevel(guildId, level, type)

// Voz
await db.startVoiceTracking(guildId, userId)
await db.endVoiceTracking(guildId, userId)
await db.isInVoice(guildId, userId)
```

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL not found"
**Solução:** Configure a variável de ambiente `DATABASE_URL` no Railway

### Erro: "ECONNREFUSED"
**Solução:** Verifique se o banco PostgreSQL está criado no Railway

### Erro: "relation does not exist"
**Solução:** O bot criará as tabelas automaticamente na primeira inicialização

---

## 📝 Próximos Passos

1. **Deploy no Railway:**
   - Push do código para GitHub
   - Railway fará deploy automaticamente

2. **Monitorar logs:**
   - Verifique os logs no dashboard do Railway
   - Procure por "✅ Conectado ao banco de dados"

3. **Teste de funcionalidade:**
   - Use `/perfil` para verificar se dados estão sendo salvos
   - Use `/config` para verificar persistência de configurações

4. **Backup de dados:**
   - Railway oferece backups automáticos
   - Configure retenção de backups conforme necessário

---

## 📚 Recursos Úteis

- [Railway Documentation](https://docs.railway.app/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg Package (Node.js)](https://node-postgres.com/)
- [Discord.js Guide](https://discordjs.guide/)

---

**Data de Atualização:** 24 de Novembro de 2025
