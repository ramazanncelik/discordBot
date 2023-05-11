const dotenv = require('dotenv');
dotenv.config();
// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
	]
});

client.on('ready', () => {
	console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	if (message.content.startsWith('!play')) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.channel.send('Bir ses kanalına katılmanız gerekiyor.');

		const songName = message.content.replace('!play', '').trim();
		console.log(songName)

	} else if (message.content.includes("selamün aleyküm") || message.content == "sa") {
		return message.channel.send('Aleyküm Selam');
	} else if (message.content.startsWith('!ping')) {
		return message.channel.send(`Ping: ${client.ws.ping}`);
	} else if (message.content.startsWith('!clear')) {
		// Check if the user has the "MANAGE_MESSAGES" permission
		if (!message.member.permissions.has('MANAGE_MESSAGES')) {
			return message.reply('Bu komutu kullanmak için "MESAJLARI YÖNET" iznine sahip olmalısınız.');
		}

		// Parse the number of messages to delete from the command
		const numToDelete = parseInt(message.content.slice(6));

		// Check if the provided argument is a valid number
		if (isNaN(numToDelete)) {
			return message.reply('Lütfen silinecek mesaj sayısını belirtin.');
		}

		// Delete the specified number of messages, up to a maximum of 100
		const messages = await message.channel.messages.fetch({ limit: Math.min(numToDelete, 100) });
		message.channel.bulkDelete(messages);
	} else if (message.content.startsWith('!roles')) {
		const member = message.member;
		const roles = member.roles.cache.map(role => role.name !== '@everyone' ? role : '').filter(role => role !== '').join(', ');
		//message.channel.send(`<@!${member.id}> -- Sahip olduğunuz roller: ${roles} `);
		const embed = new EmbedBuilder()
			.setTitle(`Sahip Olduğunuz Roller`)
			.setColor('#f97316')
			.setDescription(roles);
		return message.channel.send({ content:`<@!${member.id}>`,embeds: [embed] });
	}


});

client.login(process.env.BOT_TOKEN);