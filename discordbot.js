const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

var currentRAT;
var ratRoleTag = "<@&" + process.env.DISCORD_ROLE_ID + ">";
var durdenRoleTag = "<@&" + process.env.DISCORD_DURDEN_ROLE_ID + ">";
var rebuildRoleTag = "<@&" + process.env.DISCORD_REBUILD_ROLE_ID + ">";

module.exports = {

    DiscordLogin: function (callback) {
        client.login(process.env.DISCORD_BOT_TOKEN);


        client.on("ready", () => {
            console.log("Bot is ready");


            return callback(true);
        });
    },

    StartRAT: function () {
        var ratChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

        ratChannel.send("A RAT event has started. " + ratRoleTag).then(ratMessage => {
            currentRAT = ratMessage;
        })
    },

    EndRAT: function () {
        if(!currentRAT) {
            return;
        }
        currentRAT.edit('This RAT event has ended.');
        currentRAT = null;
    },


    EditMessage: function (message) {
        if (!currentRAT) {
            var ratChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
            ratChannel.send(message + ratRoleTag).then(ratMessage => {
                currentRAT = ratMessage;
            })
        } else {
            currentRAT.edit(message + ratRoleTag);
        }
    },

    PingDurdenRole: function () {
        var notificationChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

        notificationChannel.send("Durdens have spawned. " + durdenRoleTag);
    },

    PingRebuildRole: function (message) {
        var notificationChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

        notificationChannel.send(message + rebuildRoleTag);
    }

}
