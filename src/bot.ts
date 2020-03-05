"use strict";
import * as Console from "console-stamp";
import { dehash } from "./helpers";
import "./server";
import * as cfg from "./cfg.json";
import { Client } from "tmi.js";

import Db from "./db";
import BotCommands from "./botCommands";

(window as any).console = new Console(console, "yyyy-mm-dd HH:MM:ss");

const db = new Db(cfg);

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
const client = Client(opts);
const bot = new BotCommands(client, db);

function connect(client: Client): void {
  client
    .connect()
    .then(() => {
      console.log("Connected to Twitch");
      console.info(`Connected channels: ${cfg.channels}`);
    })
    .catch(err => {
      console.error(`Could not connect to Twitch - ${err}`);
    });
}

function onMessageDeletedHandler(channel: string, username: string): void {
  db.add(dehash(channel), username);
}

// Called every time a message comes in
function onMessageHandler(
  target: string,
  context: object,
  msg: string,
  self: boolean
): void {
  // Ignore messages from the bot
  if (self) {
    return;
  }
  bot.executeCommand(target, context, msg);
}

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("messagedeleted", onMessageDeletedHandler);

// Connect to Twitch:
connect(client);
