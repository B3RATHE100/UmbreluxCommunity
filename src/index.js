import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=discord',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Discord not connected');
  }
  return accessToken;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = (await readdir(commandsPath)).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = (await import(filePath)).default;
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Comando carregado: ${command.data.name}`);
    } else {
      console.log(`⚠️ Comando em ${file} está faltando "data" ou "execute"`);
    }
  }
}

async function loadEvents() {
  const eventsPath = join(__dirname, 'events');
  const eventFiles = (await readdir(eventsPath)).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = (await import(filePath)).default;
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    console.log(`✅ Evento carregado: ${event.name}`);
  }
}

async function registerCommands(token, clientId) {
  const commands = [];
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = (await readdir(commandsPath)).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = (await import(filePath)).default;
    
    if ('data' in command) {
      commands.push(command.data.toJSON());
    }
  }
  
  const rest = new REST().setToken(token);
  
  try {
    console.log(`🔄 Registrando ${commands.length} comandos slash...`);
    
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    
    console.log(`✅ ${data.length} comandos slash registrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando bot Veil...');
  
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ Token do bot não encontrado!');
    console.error('Por favor, configure a variável de ambiente DISCORD_BOT_TOKEN com o token do seu bot.');
    console.error('Você pode obter o token em: https://discord.com/developers/applications');
    process.exit(1);
  }
  
  await loadCommands();
  await loadEvents();
  
  client.once('ready', async () => {
    await registerCommands(token, client.user.id);
  });
  
  try {
    await client.login(token);
  } catch (error) {
    console.error('❌ Erro ao fazer login no Discord:', error.message);
    console.error('Verifique se o token está correto e se o bot tem as permissões necessárias.');
    process.exit(1);
  }
}

main().catch(console.error);
