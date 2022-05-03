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


function getNumDeletedMessages(channel, user) {
    var num = 0;
    if (channel in deletedMessages) {
        if (user in deletedMessages[channel]) {
            num = deletedMessages[channel][user];
        }
    }
    return num;
}

function getTopList(channel) {
    var sortable = [];
    console.log("Getting top list for " + channel);
    for (var user in deletedMessages[channel]) {
        sortable.push({
            username: user, 
            num: deletedMessages[channel][user]
        });
    }

    sortable.sort(function (a, b) {
        return  b["num"] - a["num"];
    });

    var topList = sortable.slice(0, noTopList);
    return topList;
}

function getTopListString(channel) {
    var toplist = getTopList(channel);
    var str = "";
    for (let user in toplist){
        str = str + `${toplist[user]["username"]}: ${toplist[user]["num"]}, `;
    }

    // Remove last comma
    str = str.substring(0, str.length - 2);
    return str;
}

function reset(channel) {
    deletedMessages[channel] = [];
}

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("messagedeleted", onMessageDeletedHandler);

// Connect to Twitch:
connect(client);
