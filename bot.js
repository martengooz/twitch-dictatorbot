require('./helpers.js');
const cfg = require('./cfg.json');
const tmi = require('tmi.js');
const dbHandler = require('./db.js')
let db = new dbHandler(cfg);
const botCommands = require('./botCommands.js')

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

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('messagedeleted', onMessageDeletedHandler);
client.on("ban", onBanHandler);

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
    botCommands.executeCommand(target, context, msg)
}

// Connect to Twitch:
connect(client);