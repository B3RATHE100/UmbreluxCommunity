# 🚀 Configuração do Bot Veil no Railway

## Problema Atual
O bot está crashando porque o banco de dados (PostgreSQL) não está configurado no Railway.

## Solução: 2 Passos Simples

### ✅ Passo 1: Criar o PostgreSQL no Railway

1. Acesse seu dashboard no **[Railway.app](https://railway.app)**
2. Clique em **"New Service"**
3. Selecione **"PostgreSQL"**
4. Railway criará automaticamente e adicionará a variável **`DATABASE_URL`**

### ✅ Passo 2: Garantir que DISCORD_BOT_TOKEN está setado

1. No dashboard do Railway, vá para **"Variables"**
2. Você verá `DATABASE_URL` criada automaticamente pelo PostgreSQL
3. Adicione **`DISCORD_BOT_TOKEN`** com seu token do Discord
   - Obtenha em: [Discord Developer Portal](https://discord.com/developers/applications)

## ✨ Novo Sistema Flexível

Nosso bot agora funciona de **2 formas**:

### 🟢 Com PostgreSQL (Recomendado para Railway)
- Se `DATABASE_URL` estiver configurada → usa PostgreSQL
- Dados são salvos no banco
- Ideal para produção

### 🟡 Sem PostgreSQL (Fallback automático)
- Se `DATABASE_URL` não existir → usa memória
- Bot ainda funciona, mas dados não persistem entre reiniciações
- Útil para testes

**O bot não vai mais crashar!** Ele se adapta automaticamente.

## Checklist Final

- [ ] PostgreSQL criado no Railway
- [ ] `DATABASE_URL` aparece nas variáveis (criado automaticamente)
- [ ] `DISCORD_BOT_TOKEN` adicionado nas variáveis
- [ ] Redeploy do projeto
- [ ] Bot está online ✅

## Exemplos de DATABASE_URL

```
postgresql://user:password@host:5432/database
postgresql://projeto_user:abc123@containers-us-west-000.railway.app:6500/railway
```

Railway cria automaticamente no formato correto!

## Comando de Deploy

Após configurar as variáveis, faça um novo deploy:
```bash
git push  # Se conectado ao GitHub
# OU manualmente redeploy no Railway
```

---

**Pronto! Seu bot deve estar online agora! 🎉**

Se ainda tiver problemas, verifique os logs no Railway para mais detalhes.
