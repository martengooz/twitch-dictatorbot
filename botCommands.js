const helper = require('./helpers.js');

module.exports = class BotCommands {
    constructor(client, db) {
        this.client = client;
        this.db = db;
    }
    
    executeCommand(target, context, msg) {
        const isMod = context["mod"];
        const channel = helper.dehash(target);
        const message = msg.trim().split(" ");
        const command = message[0];
        const argument = message[1];
    
        // If the command is known, let's execute it
        if (command && command === '!dictatorbot') {
            if (argument) {
                if (argument === "help") {
                    this.helpCommand(channel);
                    return;
                } else if (argument.startsWith("@")) { // User
                    const user = helper.detag(argument);
                    this.getUserDeletionsCommand(channel, user);
                    return;
                }
                else if (isMod) {
                    if (argument === "reset") {
                        this.resetCommand(channel);
                        return;
                    } 
                }
            } else {
                this.getTopListCommand(channel);
                return;
            }
        }
    }

    helpCommand(channel) {
        console.log(`Showing help message in ${channel}`);
        this.client.say(channel, "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.");
    }

    resetCommand(channel) {
        console.log(`Resetting the list in ${channel}`);
        this.db.reset(channel);
    }

    getUserDeletionsCommand(channel, user) {
        console.log(`Showing deleted for ${user} in ${channel}`);
        const num = this.db.getNumDeletedMessages(channel, user);
        this.client.say(channel, `Messages deleted for ${user}: ${num}`);
    }

    getTopListCommand(channel) {
        console.log(`Showing toplist in ${channel}`);
        var topList = this.db.getTopListString(channel);
        if (topList) {
            this.client.say(channel, `List of naughty people:  ${topList}`);
        } else {
            this.client.say(channel, `${channel} hasn't been a dictator yet`);
        }
    }
};