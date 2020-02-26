"use strict";

const helper = require("./helpers.js");

module.exports = class BotCommands {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }

  /**
   * Executes the appropiate command when the bot is called from chat.
   * @param {string} target Tmi target.
   * @param {Object} context Tmi context object.
   * @param {string} msg The complete message from Twitch chat.
   */
  executeCommand(target, context, msg) {
    const isMod = context.mod;
    const channel = helper.dehash(target);
    const message = msg.trim().split(" ");
    const command = message[0];
    const argument = message[1];

    // If the command is known, let's execute it
    if (command === "!dictatorbot" || command === "!botutiemersma") {
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
  helpCommand(channel) {
    console.log(`Showing help message in ${channel}`);
    this.client.say(
      channel,
      this.db.getBotMessage(channel, "help", { channel: channel })
    );
  }

  /**
   * Resets all deleted messages for a channel.
   * @param {string} channel The Twitch channel reset.
   */
  resetCommand(channel) {
    console.log(`Resetting the list in ${channel}`);
    this.db.reset(channel);
  }

  /**
   * Sends number of deleted messages for a specific user to chat.
   * @param {string} channel The Twitch channel to output message in.
   * @param {string} user A Twitch user.
   */
  getUserDeletionsCommand(channel, user) {
    console.log(`Showing deleted for ${user} in ${channel}`);
    const num = this.db.getDeletedMessagesForUser(channel, user);
    this.client.say(
      channel,
      this.db.getBotMessage(channel, "specificUser", {
        channel: channel,
        user: user,
        num_deleted_messages: num
      })
    );
  }

  /**
   * Sends a top list of users with the most deleted messages.
   * @param {string} channel The Twitch channel to output message in.
   */
  getTopListCommand(channel) {
    console.log(`Showing toplist in ${channel}`);
    var topList = this.db.getTopListString(channel);
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
};
