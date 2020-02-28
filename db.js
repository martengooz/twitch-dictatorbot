"use strict";

const helper = require("./helpers.js");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

module.exports = class Db {
  constructor(config) {
    this.cfg = config;
    this.db = this.cfg.dbPath;
  }

  /**
   * Create a new random url entry for editing a channels config.
   * @param {string} channel The channel to create a new url for.
   */
  createWebSecret(channel) {
    this.cfg.webUrls[uuidv4()] = channel;
    try {
      fs.writeFileSync("cfg.json", JSON.stringify(this.cfg, null, 4));
    } catch (err) {
      console.log(
        new Date().toISOString() + "Could not write new url to cfg.json"
      );
      return;
    }
    console.log(new Date().toISOString() + `Written to cfg.json`);
  }

  /**
   * Creates a new db json file with the same name as the channel.
   * @param {string} channel The Twitch channel to create a new db file for.
   * @returns {Object} The written db object.
   */
  createDb(channel) {
    if (!fs.existsSync(this.db)) {
      try {
        fs.mkdirSync(this.db, { recursive: true });
      } catch (err) {
        console.error(new Date().toISOString() + err);
        return;
      }
    }

    console.log(
      new Date().toISOString() + `Creating new db file for ${channel}`
    );
    var newdb = this.cfg.defaultValues;
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
  writeToDb(channel, data) {
    let dataString = "";

    try {
      dataString = JSON.stringify(data, null, 4);
    } catch (err) {
      console.error(new Date().toISOString() + `Failed to stringify ${data}`);
      return;
    }

    if (!fs.existsSync(this.db)) {
      console.error(new Date().toISOString() + "should not be here");
      this.createDb(channel);
    }

    try {
      fs.writeFileSync(`${this.db}/${channel}.json`, dataString);
      console.log(
        new Date().toISOString() + `Written to ${this.db}/${channel}.json`
      );
      return data;
    } catch (err) {
      console.error(
        new Date().toISOString() +
          `Failed to write to ${this.db}/${channel}.json`
      );
    }
  }

  /**
   * Update a single key in the db file.
   * @param {string} channel The channel which should have data written to.
   * @param {string} key The key to be updated.
   * @param {*} value The value to write.
   * @returns {Object} The complete written db file.
   */
  writeKeyToDb(channel, key, value) {
    var db = this.getChannelDb(channel);
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
  getChannelDb(channel) {
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
  getBotMessages(channel) {
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
  getBotMessage(channel, messageKey, replacements) {
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
   * @returns {{user: string, num: number}} An object with users as keys and number of deleted messages as their value.
   */
  getDeletedMessages(channel) {
    var db = this.getChannelDb(channel);
    return db.deletedMessages || {};
  }

  /**
   * Gets the users with most deleted messages for a channel.
   * @param {string} channel The Twitch channel.
   * @returns {Array.<{user: string, num: number}>} The users with most deleted messages.
   */
  getTopList(channel) {
    console.log(new Date().toISOString() + "Getting top list for " + channel);
    const db = this.getChannelDb(channel);
    if (db.deletedMessages) {
      var sortable = [];
      for (var user in db.deletedMessages) {
        sortable.push({
          user: user,
          num: db.deletedMessages[user]
        });
      }

      sortable.sort(function(a, b) {
        return b.num - a.num;
      });

      var topList = sortable.slice(0, db.noTopList);
      return topList;
    }
    return [];
  }

  /**
   * Get the top list as a comma separated list.
   * @param {string} channel The Twitch channel.
   * @returns {string} The stringified top list.
   */
  getTopListString(channel) {
    var toplist = this.getTopList(channel);
    var str = "";
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
  getDeletedMessagesForUser(channel, user) {
    const deletedMessages = this.getDeletedMessages(channel);
    var num = 0;
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
  isExcluded(db, user) {
    return db.excludedUsers.includes(user);
  }

  // TODO: Check for required keys
  /**
   * Check if the db object contains all required keys.
   * @param {Object} dbObject The channel db object.
   */
  isValidDb(dbObject) {
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
  add(channel, user) {
    const db = this.getChannelDb(channel);
    if (db.deletedMessages && !this.isExcluded(db, user)) {
      if (user in db.deletedMessages) {
        db.deletedMessages[user]++;
      } else {
        console.log(
          new Date().toISOString() +
            `User ${user} not in ${channel} list, adding.`
        );
        db.deletedMessages[user] = 1;
      }
      this.writeKeyToDb(channel, "deletedMessages", db.deletedMessages);
      console.log(
        new Date().toISOString() + `Deleted message for ${user} in ${channel}`
      );
    }
  }

  remove(channel, user) {
    console.log(new Date().toISOString() + "not implemented");
  }
};
