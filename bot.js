"use strict";

require("./helpers.js");
require("./server.js");
const cfg = require("./cfg.json");
const tmi = require("tmi.js");
const helper = require("./helpers.js");
const DbHandler = require("./db.js");
const BotCommands = require("./botCommands.js");

const db = new DbHandler(cfg);

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
const client = new tmi.Client(opts);
const bot = new BotCommands(client, db);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("messagedeleted", onMessageDeletedHandler);
client.on("ban", onBanHandler);

function connect(client) {
  client
    .connect()
    .then(data => {
      console.log("Connected on " + new Date().toISOString());
      console.log(`Connected channels: ${cfg.channels}`);
    })
    .catch(err => {
      console.log(err);
    });
}

function onBanHandler(channel, username, deletedMessage, userstate) {
  // Remove from high score
}

function onMessageDeletedHandler(channel, username, deletedMessage, userstate) {
  db.add(helper.dehash(channel), username);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  // Ignore messages from the bot
  if (self) {
    return;
  }
  bot.executeCommand(target, context, msg);
}

// Connect to Twitch:
connect(client);
