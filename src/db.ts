"use strict";

import fs from "fs";
import { v4 } from "uuid";
import * as helper from "./helpers";

interface DbType {
  channelName: string;
  deletedMessages: {}[];
  excludedUsers: string[];
  noTopList: number;
  messages: {
    help: string;
    topList: string;
    topListEmpty: string;
    specificUser: string;
  };
}

export default class Db {
  cfgPath: string;
  cfg: any;
  db: string;
  constructor(cfgPath: string, config: any) {
    this.cfgPath = cfgPath;
    this.cfg = config;
    this.db = this.cfg.dbPath;
  }

  /**
   * Create a new random url entry for editing a channels config.
   * @param {string} channel The channel to create a new url for.
   */
  createWebSecret(channel: string): boolean {
    this.cfg.webUrls[v4()] = channel;
    try {
      fs.writeFileSync(this.cfgPath, JSON.stringify(this.cfg, null, 4));
    } catch (err) {
      console.error("Could not write new url to cfg.json");
      return false;
    }
    console.log(`Added url for #${channel}`);
    return true;
  }

  /**
   * Creates a new db json file with the same name as the channel.
   * @param {string} channel The Twitch channel to create a new db file for.
   * @returns {Object} The written db object.
   */
  createDb(channel: string): DbType {
    if (!fs.existsSync(this.db)) {
      try {
        fs.mkdirSync(this.db, { recursive: true });
      } catch (err) {
        console.error(`Could not create db for #${channel} - ${err}`);
        return;
      }
    }

    console.log(`Creating new db file for ${channel}`);
    const newdb = this.cfg.defaultValues;
    newdb.channelName = channel;
    this.createWebSecret(channel);
    return this.writeToDb(channel, newdb);
  }

  /**
   * Write to the channels db file.
   * @param {string} channel The channel which should have data written to.
   * @param {*} data The complete data to write.
   * @returns {Object} The data written.
   */
  writeToDb(channel: string, data: DbType): DbType {
    let dataString: string;

    try {
      dataString = JSON.stringify(data, null, 4);
    } catch (err) {
      console.error(`Failed to stringify ${data}`);
      return;
    }

    if (!fs.existsSync(this.db)) {
      console.error("DB not found, creating.");
      this.createDb(channel);
    }

    try {
      fs.writeFileSync(`${this.db}/${channel}.json`, dataString);
      console.log(`Written to ${this.db}/${channel}.json`);
      return data;
    } catch (err) {
      console.error(`Failed to write to ${this.db}/${channel}.json - ${err}`);
    }
  }

  /**
   * Update a single key in the db file.
   * @param {string} channel The channel which should have data written to.
   * @param {string} key The key to be updated.
   * @param {*} value The value to write.
   * @returns {Object} The complete written db file.
   */
  writeKeyToDb(
    channel: string,
    key: string,
    value:
      | DbType["channelName"]
      | DbType["deletedMessages"]
      | DbType["excludedUsers"]
      | DbType["messages"]
      | DbType["noTopList"]
  ): DbType {
    const db = this.getChannelDb(channel);
    if (db) {
      db[key] = value;
      return this.writeToDb(channel, db);
    }
  }

  /**
   * Get the complete parsed json db file. Creates a new db file if not existing.
   * @param {string} channel The channel which should read data from.
   * @returns {Object} The parsed json string.
   */
  getChannelDb(channel: string): DbType {
    const path = `${this.db}/${channel}.json`;
    if (fs.existsSync(path)) {
      try {
        const jsonString = fs.readFileSync(path, "utf8");
        const res = JSON.parse(jsonString);
        if (!this.isValidDb(res)) {
          return this.createDb(channel);
        }
        return res;
      } catch (err) {
        return this.createDb(channel);
      }
    } else {
      return this.createDb(channel);
    }
  }

  /**
   * Get all custom messages for a channel.
   * @param {string} channel The Twitch channel.
   * @returns {Object} A js object with all custom messages.
   */
  getBotMessages(channel: string): DbType["messages"] {
    const db = this.getChannelDb(channel);
    if (db && db.messages) {
      return db.messages;
    }
  }

  /**
   *
   * @param {string} channel The Twitch channel to get custom messages for.
   * @param {string} messageKey The custom message key.
   * @param {{key: string, value: string|number}} replacements  Replace every occurance of ${<key>} with <value> in <message>.
   * @returns {string} The interpolated string.
   */
  getBotMessage(
    channel: string,
    messageKey: string,
    replacements: { key: string; value: string | number }
  ): string {
    const msgs = this.getBotMessages(channel);
    if (msgs && messageKey in msgs) {
      const interpolatedString = helper.replaceInMessage(
        msgs[messageKey],
        replacements
      );
      return interpolatedString;
    }
    return "";
  }

  /**
   * Get all the deleted messages in a channel.
   * @param {string} channel The Twitch channel.
   * @returns {[{user: string, num: number}]} An object with users as keys and number of deleted messages as their value.
   */
  getDeletedMessages(channel: string): DbType["deletedMessages"] {
    const db = this.getChannelDb(channel);
    return db.deletedMessages || [{}];
  }

  /**
   * Gets the users with most deleted messages for a channel.
   * @param {string} channel The Twitch channel.
   * @returns {Array.<{user: string, num: number}>} The users with most deleted messages.
   */
  getTopList(channel: string): Array<{ user: string; num: number }> {
    console.log(`Getting top list for ${channel}`);
    const db = this.getChannelDb(channel);
    if (db.deletedMessages) {
      const sortable = [];
      for (const user in db.deletedMessages) {
        sortable.push({
          user: user,
          num: db.deletedMessages[user]
        });
      }

      sortable.sort(function(a, b) {
        return b.num - a.num;
      });

      const topList = sortable.slice(0, db.noTopList);
      return topList;
    }
    return [];
  }

  /**
   * Get the top list as a comma separated list.
   * @param {string} channel The Twitch channel.
   * @returns {string} The stringified top list.
   */
  getTopListString(channel: string): string {
    const toplist = this.getTopList(channel);
    let str = "";
    for (const user in toplist) {
      str = str + `${toplist[user].user}: ${toplist[user].num}, `;
    }

    // Remove last comma
    str = str.substring(0, str.length - 2);
    return str;
  }

  /**
   * Get the number of deleted messages for a specific user.
   * @param {string} channel The Twitch channel.
   * @param {string} user The Twitch user.
   */
  getDeletedMessagesForUser(channel: string, user: string): number {
    const deletedMessages = this.getDeletedMessages(channel);
    let num = 0;
    if (deletedMessages && user in deletedMessages) {
      num = deletedMessages[user];
    }
    return num;
  }

  /**
   * Check if a user is excluded from a channel.
   * @param {Object} db The channel db object.
   * @param {string} user The user to check.
   * @returns {boolean} True if excluded. False otherwise.
   */
  isExcluded(db: DbType, user: string): boolean {
    return db.excludedUsers.includes(user);
  }

  // TODO: Check for required keys
  /**
   * Check if the db object contains all required keys.
   * @param {Object} dbObject The channel db object.
   */
  isValidDb(dbObject: DbType): boolean {
    if (Object.keys(dbObject).length === 0 && dbObject.constructor === Object) {
      return false;
    }
    return true;
  }

  /**
   * Add or update a users deleted messages in a channel.
   * @param {string} channel The Twitch channel.
   * @param {string} user The Twitch user.
   */
  add(channel: string, user: string): void {
    const db = this.getChannelDb(channel);
    if (db.deletedMessages && !this.isExcluded(db, user)) {
      if (user in db.deletedMessages) {
        db.deletedMessages[user]++;
      } else {
        console.log(`User ${user} not in ${channel} list, adding.`);
        db.deletedMessages[user] = 1;
      }
      this.writeKeyToDb(channel, "deletedMessages", db.deletedMessages);
      console.log(`Deleted message for ${user} in ${channel}`);
    }
  }

  remove(channel: string, user: string): void {
    console.log("not implemented");
  }
}
