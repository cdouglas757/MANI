//#region requires
const irc = require('irc');
const discordBot = require('./discordBot');
//#endregion


//#region vars

var botName = 'MANI';
var password = process.env.IRC_BOT_PASSWORD;
var ircServer = 'irc.mafiareturns.com';
var channel = '#main';
var userToListenTo = 'MRBot';
var remainingRATS = 0;
var discordConnected = false;
var ratCancelled = false;
//#endregion


var client = new irc.Client(ircServer, botName, {});

client.addListener('registered', function () {
    client.say('nickserv', 'identify ' + password);
    client.join(channel);

    discordBot.DiscordLogin(function (success) {
        if (success) {
            console.log("Discord connected");
            discordConnected = true;
        }
    })
});

client.addListener('message', function (from, to, message) {

    if (from !== userToListenTo) {
        return;
    }

    console.log(message);

    if (message.includes("A RAT event has been spawned")) {
        console.log('RAT has started');
        if (discordConnected) {
            discordBot.StartRAT();
        }
        return;
    }

    if (message.includes("Failed to die previous minute.")) {
        console.log('RAT has been cancelled.  Did not get shot.');
        if (discordConnected) {
            discordBot.EndRAT();
        }
        return;
    }

    if (message.includes(" remaining RATs have been cancelled")) {
        console.log('RAT has been cancelled');
        ratCancelled = true;
        remainingRATS = 0;
        return;
    }

    if (message.includes("Users are able to string together up to")) {
        var matches = message.match(/\d+/g);
        console.log('RAT is active.');
        if (matches) {
            if (ratCancelled == true && matches[1] == 0) {
                console.log('Ending cancelled RAT');
                if (discordConnected) {
                    discordBot.EndRAT();
                }
                return;
            }

            remainingRATS = parseInt(matches[0]);
            console.log(remainingRATS + ' remaining');
            if (discordConnected) {
                discordBot.EditMessage('RAT is active. ' + remainingRATS + ' remaining.');
            }
        }

        return;
    }

    if (message.includes("pitiful attempt has been thwarted")) {
        if (remainingRATS == 1) {
            remainingRATS = 0;
            console.log("RAT completed");
            if (discordConnected) {
                discordBot.EndRAT();
            }
        }
        return;
    }

    if (message.includes("First blood has been drawn in the war against the TylerDurden crew")) {
        if (discordConnected) {
            discordBot.PingDurdenRole();   
        }
        return;
    }
});
