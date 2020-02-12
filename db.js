require('./helpers.js');

module.exports = class Db {
    constructor(config) {
        this.deletedMessages = {};
        this.noTopList = 5;
    }
     dehash(hashedString) {
        return hashedString.replace('#', '');
    }
     detag(taggedString) {
        return taggedString.replace('@', '');
    }

    getTopList(channel) {
        var sortable = [];
        console.log("Getting top list for " + channel);
        for (var user in this.deletedMessages[channel]) {
            sortable.push({
                username: user,
                num: this.deletedMessages[channel][user]
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
        var num = 0;
        if (channel in this.deletedMessages) {
            if (user in this.deletedMessages[channel]) {
                num = this.deletedMessages[channel][user];
            }
        }
        return num;
    }

    add(channel, username) {
        channel = dehash(channel);
        if (channel in this.deletedMessages) {
            if (username in this.deletedMessages[channel]) {
                this.deletedMessages[channel][username]++;
            } else {
                this.deletedMessages[channel][username] = 1;
            }
        } else {
            console.log(`User ${username} not in ${channel} list, adding.`)
            this.deletedMessages[channel] = {};
            this.deletedMessages[channel][username] = 1;
        }
        console.log(`Deleted message for ${username} in ${channel}`);
    }

    remove(channel, user) {
        console.log("not implemented");
    }

};

