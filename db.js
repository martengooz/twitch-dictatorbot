const helper = require('./helpers.js');
const fs = require('fs')

module.exports = class Db {
    constructor(config) {
        this.deletedMessages = {};
        this.noTopList = 5;
        this.db = config.dbPath;
    }

    writeToDb(channel, key, value) {
        var db = this.getChannelDb(channel);
        db[key] = value;
        fs.writeFile(`${this.db}/${channel}.json`, JSON.stringify(db, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log(`Written to ${this.db}/${channel}.json`);
        });
    }

    getChannelDb(channel) {
        const jsonString = fs.readFileSync(`${this.db}/${channel}.json`, 'utf8');
        const res = JSON.parse(jsonString);
        return res;
    }

    getDeletedMessages(channel) {
        return this.getChannelDb(channel)["deletedMessages"];
    }

    getTopList(channel) {
        let deletedMessages = this.getDeletedMessages(channel);
        var sortable = [];
        console.log("Getting top list for " + channel);
        for (var user in deletedMessages) {
            sortable.push({
                username: user,
                num: deletedMessages[user]
            });
        }

        sortable.sort(function (a, b) {
            return b["num"] - a["num"];
        });

        var topList = sortable.slice(0, this.noTopList);
        return topList;
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
        if (user in deletedMessages) {
            num = deletedMessages[user];
        }
        return num;
    }

    add(channel, username) {
        let deletedMessages = this.getDeletedMessages(channel);
        if (username in deletedMessages) {
            deletedMessages[username]++;
        } else {
            console.log(`User ${username} not in ${channel} list, adding.`)
            deletedMessages[username] = 1;
        }
        this.writeToDb(channel, "deletedMessages", deletedMessages);
        console.log(`Deleted message for ${username} in ${channel}`);
    }

    remove(channel, user) {
        console.log("not implemented");
    }

};

