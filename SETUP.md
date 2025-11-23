# 🤖 Configuração do Bot Veil

## Passo 1: Criar o Bot no Discord Developer Portal

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em **"New Application"**
3. Dê um nome ao seu bot (exemplo: "Veil Bot")
4. Clique em **"Create"**

## Passo 2: Configurar o Bot

1. No menu lateral, clique em **"Bot"**
2. Clique em **"Reset Token"** e copie o token gerado
3. **GUARDE ESSE TOKEN COM SEGURANÇA!** Você vai precisar dele no próximo passo

### Configurações Importantes do Bot:

Ative as seguintes opções em **"Privileged Gateway Intents"**:
- ✅ **SERVER MEMBERS INTENT** (Obrigatório para detectar entrada de membros)
- ✅ **MESSAGE CONTENT INTENT** (Obrigatório para ler mensagens)
- ✅ **PRESENCE INTENT** (Opcional, mas recomendado)

Clique em **"Save Changes"**

## Passo 3: Configurar o Token no Replit

1. No Replit, vá para a aba **"Secrets"** (ícone de cadeado 🔒 na barra lateral)
2. Adicione um novo secret:
   - **Key**: `DISCORD_BOT_TOKEN`
   - **Value**: Cole o token que você copiou no passo 2
3. Clique em **"Add new secret"**

## Passo 4: Convidar o Bot para Seu Servidor

1. No Discord Developer Portal, vá para **"OAuth2"** > **"URL Generator"**
2. Em **"Scopes"**, selecione:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Em **"Bot Permissions"**, selecione:
   - ✅ **Manage Roles** (Gerenciar Cargos)
   - ✅ **Send Messages** (Enviar Mensagens)
   - ✅ **Embed Links** (Incorporar Links)
   - ✅ **Read Message History** (Ler Histórico de Mensagens)
   - ✅ **Use Slash Commands** (Usar Comandos de Barra)
   - ✅ **View Channels** (Ver Canais)
   - ✅ **Add Reactions** (Adicionar Reações)
4. Copie a URL gerada no final da página
5. Cole a URL no seu navegador e selecione o servidor onde deseja adicionar o bot
6. Clique em **"Authorize"** (Autorizar)

## Passo 5: Iniciar o Bot

1. No Replit, clique no botão **"Run"** ▶️
2. Se tudo estiver configurado corretamente, você verá a mensagem:
   ```
   ✅ Bot conectado como NomeDoBot#1234
   🌟 Pronto para servir 1 servidor(es)
   ```

## Comandos Disponíveis

- `/perfil` - Ver seu perfil, nível e progresso
- `/rank` - Ver o ranking de níveis do servidor
- `/config` - Painel de configuração (apenas administradores)

## Configuração Inicial do Sistema

Após adicionar o bot ao servidor, use o comando `/config` para:

1. **Definir Canal de Boas-vindas**: Escolha onde as mensagens de boas-vindas serão enviadas
2. **Definir Canal de Level Up**: Escolha onde as notificações de nível serão enviadas
3. **Adicionar Recompensas de Cargo**: Configure quais cargos serão concedidos em cada nível

### Exemplo de Recompensas:
- Nível 5 → Cargo "Membro Ativo"
- Nível 10 → Cargo "Veterano"
- Nível 20 → Cargo "Lenda"

## Como Funciona o Sistema de XP

### Ganhar XP por Mensagens:
- Envie mensagens nos canais de texto
- Ganhe entre **15-25 XP** por mensagem
- Cooldown de **60 segundos** entre mensagens

### Ganhar XP por Voice:
- Entre em canais de voz
- Ganhe **10 XP por minuto** em call
- XP é concedido automaticamente ao sair da call

## Troubleshooting

### Bot não responde:
- Verifique se o token está configurado corretamente nos Secrets
- Confirme que as intents estão ativadas no Developer Portal
- Verifique os logs do bot no console do Replit

### Bot não envia mensagens de boas-vindas:
- Configure o canal de boas-vindas com `/config`
- Verifique se o bot tem permissão para enviar mensagens no canal

### Cargos não são concedidos automaticamente:
- Verifique se o cargo do bot está **acima** dos cargos que ele vai conceder
- No servidor Discord, vá em "Configurações do Servidor" > "Cargos"
- Arraste o cargo do bot para uma posição superior

## Suporte

Se tiver problemas, verifique:
1. Os logs do bot no console
2. As permissões do bot no servidor
3. Se todos os intents estão ativados

Divirta-se com seu bot Veil! 🎉
