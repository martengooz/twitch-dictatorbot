require('./helpers.js');
const cfg = require('./cfg.json');
const tmi = require('tmi.js');
const dbHandler = require('./db.js')


let db = new dbHandler(cfg);

// Define configuration options
const opts = {
    identity: {
        username: cfg.username,
        password: cfg.password
    },
    connection: {
        secure: true,
        reconnect: true
    },
    channels: cfg.channels
};
// Create a client with our options
const client = new tmi.client(opts);

let deletedMessages = {};
const noTopList = 5;

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('messagedeleted', onMessageDeletedHandler);
client.on("ban", onBanHandler);

function dehash(hashedString) {
    return hashedString.replace('#', '');
}
function detag(taggedString) {
    return taggedString.replace('@', '');
}

function connect(client) {
    client.connect()
        .then((data) => {
            console.log("Connected on " + new Date().toISOString());
            console.log(`Connected channels: ${cfg.channels}`);
        }).catch((err) => {
            console.log(err)
        });
}

function onBanHandler(channel, username, deletedMessage, userstate) {
    // Remove from high score
}


function onMessageDeletedHandler(channel, username, deletedMessage, userstate) {
    db.add(channel, username)
}


// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    // Ignore messages from the bot
    if (self) {
        return;
    }

    const channel = dehash(target);
    const message = msg.trim().split(" ");
    const command = message[0];
    const argument = message[1];

    // If the command is known, let's execute it
    if (command && command === '!dictatorbot') {
        if (argument) {
            if (argument === "help") {
                // TODO write nice message
                client.say(target, "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.");
                console.log("Showing help message");
                return;
            } else if (argument === "reset") {
                reset(channel);
                console.log("Resetting the list");
                return;
            } else if (argument.startsWith("@")) { // User
                const user = detag(argument);
                const num = db.getNumDeletedMessages(channel, user);
                client.say(target, `Messages deleted for ${user}: ${num}`);
                console.log(`Showing deleted for ${user} in ${channel}`);
                return;
            }
        } else {
            var topList = db.getTopListString(channel);
            if (topList) {
                client.say(target, `List of naughty people:  ${topList}`);
            } else {
                client.say(target, `${channel} hasn't been a dictator yet`);
            }
            console.log(`${topList}`);
            return;
        }
    }
}

// Connect to Twitch:
connect(client);