//#region requires
const irc = require('irc');
const discordBot = require('./discordbot');
//#endregion


//#region vars

var botName = 'MANI';
var ircServer = 'irc.mafiareturns.com';
var channel = '#main';
var userToListenTo = 'MRBot';
var remainingRATS = 0;
var discordConnected = false;
var ratCancelled = false;
var rebuildModeOn = false;
//#endregion


var client = new irc.Client(ircServer, botName, {});

client.addListener('registered', function () {
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
        if (!rebuildModeOn && discordConnected) {
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
        if (discordConnected) {
            discordBot.EndRAT();
        }
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

            rebuildModeOn = false;
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

    if (message.includes("Possible rebuild mode pending.")) {
        if (discordConnected) {
            discordBot.PingRebuildRole('Possible rebuild mode pending.');   
        }
        return;
    }

    if (message.includes("Extending rebuild time.")) {
        rebuildModeOn = true;
        if (discordConnected) {
            discordBot.PingRebuildRole('Rebuild time extended');   
        }
        return;
    }
});
