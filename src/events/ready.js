export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`🌟 Pronto para servir ${client.guilds.cache.size} servidor(es)`);
    
    client.user.setActivity('Veil | /perfil', { type: 3 });
  }
};
