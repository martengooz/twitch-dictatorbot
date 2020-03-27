"use strict";

import * as helper from "./helpers";
import { Client, Userstate } from "tmi.js";

export default class BotCommands {
  botName: string;
  client: Client;
  db: any;
  constructor(botName, client, db) {
    this.botName = botName;
    this.client = client;
    this.db = db;
  }

  /**
   * Executes the appropiate command when the bot is called from chat.
   * @param {string} target Tmi target.
   * @param {Object} context Tmi context object.
   * @param {string} msg The complete message from Twitch chat.
   */
  public executeCommand(target: string, context: Userstate, msg: string): void {
    const isMod = context.mod;
    const channel = helper.dehash(target);
    const message = msg.trim().split(" ");
    const command = message[0].toLocaleLowerCase();
    const argument = message[1];

    // If the command is known, let's execute it
    if (command === `!${this.botName.toLocaleLowerCase()}`) {
      console.info(`Command recieved (${target}, "${msg}")`);
      if (argument) {
        if (argument === "help") {
          this.helpCommand(channel);
        } else if (argument.startsWith("@")) {
          // User
          const user = helper.detag(argument);
          this.getUserDeletionsCommand(channel, user);
        } else if (isMod) {
          if (argument === "reset") {
            this.resetCommand(channel);
          }
        }
      } else {
        this.getTopListCommand(channel);
      }
    }
  }

  /**
   * Sends the help message to chat.
   * @param {string} channel The Twitch channel to output message in.
   */
  helpCommand(channel: string): void {
    console.log(`Showing help message for #${channel}`);
    this.client.say(
      channel,
      this.db.getBotMessage(channel, "help", {
        channel: channel,
        botName: this.botName
      })
    );
  }

  /**
   * Resets all deleted messages for a channel.
   * @param {string} channel The Twitch channel reset.
   */
  resetCommand(channel: string): void {
    console.log(`Resetting the list for #${channel}`);
    this.db.reset(channel);
  }

  /**
   * Sends number of deleted messages for a specific user to chat.
   * @param {string} channel The Twitch channel to output message in.
   * @param {string} user A Twitch user.
   */
  getUserDeletionsCommand(channel: string, user: string): void {
    console.log(`Showing deleted for ${user} in #${channel}`);
    const num = this.db.getDeletedMessagesForUser(channel, user);
    this.client.say(
      channel,
      this.db.getBotMessage(channel, "specificUser", {
        channel: channel,
        user: user,
        num: num
      })
    );
  }

  /**
   * Sends a top list of users with the most deleted messages.
   * @param {string} channel The Twitch channel to output message in.
   */
  getTopListCommand(channel: string): void {
    console.log(`Showing toplist for #${channel}`);
    const topList = this.db.getTopListString(channel);
    if (topList) {
      this.client.say(
        channel,
        this.db.getBotMessage(channel, "topList", { topList: topList })
      );
    } else {
      this.client.say(
        channel,
        this.db.getBotMessage(channel, "topListEmpty", { channel: channel })
      );
    }
  }
}
