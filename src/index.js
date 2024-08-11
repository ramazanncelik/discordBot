const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');
const ffmpegPath = require('ffmpeg-static');

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

        let songName = message.content.replace('!play', '').trim();
        if (!songName) return message.channel.send('Lütfen bir şarkı adı veya YouTube linki girin.');

        let stream;
        try {
            const video = await play.search(songName, { limit: 1 });
			console.log(video)
            if (video.length === 0) {
                return message.channel.send('Video bulunamadı.');
            }
            const videoUrl = video[0].url;
            stream = await play.stream(videoUrl);
        } catch (error) {
            console.error('Şarkı çalma hatası:', error);
            return message.channel.send('Şarkı çalma sırasında bir hata oluştu.');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            message.channel.send(`Şarkı "${video[0].title}" çalınıyor!`);
        });

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', error => {
            console.error('Hata:', error);
            message.channel.send('Şarkı çalma sırasında bir hata oluştu.');
        });
    } else if (message.content.startsWith('!exit')) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send('Bir ses kanalında bulunmanız gerekiyor.');

        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.channel.send('Ses kanalından ayrıldım.');
        } else {
            message.channel.send('Bot şu anda bir ses kanalında bulunmuyor.');
        }
    } else if (message.content.includes("selamün aleyküm") || message.content == "sa") {
        return message.channel.send('Aleyküm Selam');
    } else if (message.content.startsWith('!ping')) {
        return message.channel.send(`Ping: ${client.ws.ping}`);
    } else if (message.content.startsWith('!clear')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Bu komutu kullanmak için "MESAJLARI YÖNET" iznine sahip olmalısınız.');
        }
        const numToDelete = parseInt(message.content.slice(6));
        if (isNaN(numToDelete)) {
            return message.reply('Lütfen silinecek mesaj sayısını belirtin.');
        }
        const messages = await message.channel.messages.fetch({ limit: Math.min(numToDelete, 100) });
        message.channel.bulkDelete(messages);
    } else if (message.content.startsWith('!roles')) {
        const member = message.member;
        const roles = member.roles.cache.map(role => role.name !== '@everyone' ? role : '').filter(role => role !== '').join(', ');

        if (!roles) {
            return message.channel.send(`<@!${member.id}> -- Sahip olduğunuz roller bulunmamaktadır.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Sahip Olduğunuz Roller`)
            .setColor('#f97316')
            .setDescription(roles);
        return message.channel.send({ content: `<@!${member.id}>`, embeds: [embed] });
    }
});

client.login(process.env.BOT_TOKEN);
