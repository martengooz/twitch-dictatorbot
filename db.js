'use strict';

const helper = require('./helpers.js');
const fs = require('fs')

module.exports = class Db {
    constructor(config) {
        this.deletedMessages = {};
        this.noTopList = 5;
        this.cfg = config;
        this.db = this.cfg.dbPath;
    }

    createDb(channel) {
        try {
            if (!fs.existsSync(this.db)) {
                fs.mkdirSync(this.db);
            }
        } catch (err) {
            console.error(err);
            return;
        }

        console.log(`Creating new db file for ${channel}`);
        var newdb = {
            "channelName": channel,
            "deletedMessages": {}
        };

        newdb = Object.assign(newdb, this.cfg.defaultValues)
        newdb["channelName"] = channel;
        newdb["deletedMessages"] = {};
        return this.writeToDb(channel, newdb);
    }

    writeToDb(channel, data) {
        try {
            if (!fs.existsSync(this.db)) {
                this.createDb(channel);
            }
            fs.writeFileSync(`${this.db}/${channel}.json`, JSON.stringify(data, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    return;
                };
                console.log(`Written to ${this.db}/${channel}.json`);
            });
            return data;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    writeKeyToDb(channel, key, value) {
        var db = this.getChannelDb(channel);
        if (db) {
            db[key] = value;
            return this.writeToDb(channel, db);
        }
        return;
    }

    getChannelDb(channel) {
        const path = `${this.db}/${channel}.json`;
        try {
            if (fs.existsSync(path)) {
                try {
                    const jsonString = fs.readFileSync(path, 'utf8');
                    const res = JSON.parse(jsonString);
                    return res;
                }
                catch (err) {
                    console.error(err)
                    return
                }
            }
            else {
                return this.createDb(channel);
            }
        } catch (err) {
            console.error(err)
            return
        }
    }

    getBotMessages(channel){
        const db = this.getChannelDb(channel);
        if (db && db["messages"]) {
            return db["messages"];
        }
        return;
    }

    getBotMessage(channel, message, args) {
        const msgs = this.getBotMessages(channel);
        if (msgs && msgs[message]) {
            const interpolatedString = helper.replaceInMessage(msgs[message], args);
            return interpolatedString;
        }
        return "";
    }

    getDeletedMessages(channel) {
        var db = this.getChannelDb(channel);
        if (db) {
            return db["deletedMessages"];
        }
        return;
    }

    getTopList(channel) {
        console.log("Getting top list for " + channel);
        let db = this.getChannelDb(channel);
        if (db["deletedMessages"]) {
            var sortable = [];
            for (var user in db["deletedMessages"]) {
                sortable.push({
                    username: user,
                    num: db["deletedMessages"][user]
                });
            }

            sortable.sort(function (a, b) {
                return b["num"] - a["num"];
            });

            var topList = sortable.slice(0, db["noTopList"]);
            return topList;
        }
        return;
    }

    getTopListString(channel) {
        var toplist = this.getTopList(channel);
        var str = "";
        for (let user in toplist) {
            str = str + `${toplist[user]["username"]}: ${toplist[user]["num"]}, `;
        }

        // Remove last comma
        str = str.substring(0, str.length - 2);
        return str;
    }

    getNumDeletedMessages(channel, user) {
        let deletedMessages = this.getDeletedMessages(channel);
        var num = 0;
        if (deletedMessages && user in deletedMessages) {
            num = deletedMessages[user];
        }
        return num;
    }

    add(channel, username) {
        let deletedMessages = this.getDeletedMessages(channel);
        if (deletedMessages) {
            if (username in deletedMessages) {
                deletedMessages[username]++;
            } else {
                console.log(`User ${username} not in ${channel} list, adding.`)
                deletedMessages[username] = 1;
            }
            this.writeKeyToDb(channel, "deletedMessages", deletedMessages);
            console.log(`Deleted message for ${username} in ${channel}`);
        }
        return
    }

    remove(channel, user) {
        console.log("not implemented");
    }

};

