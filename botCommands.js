function executeCommand(target, context, msg) {
    const isMod = context["mod"];
    const channel = dehash(target);
    const message = msg.trim().split(" ");
    const command = message[0];
    const argument = message[1];

    // If the command is known, let's execute it
    if (command && command === '!dictatorbot') {
        if (argument) {
            if (argument === "help") {
                // TODO write nice message
                client.say(target, "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.");
                console.log("Showing help message");
                return;
            } else if (argument.startsWith("@")) { // User
                const user = detag(argument);
                const num = getNumDeletedMessages(channel, user);
                client.say(target, `Messages deleted for ${user}: ${num}`);
                console.log(`Showing deleted for ${user} in ${channel}`);
                return;
            }
            else if (isMod) {
                if (argument === "reset") {
                    reset(channel);
                    console.log("Resetting the list");
                    return;
                } 
            }
        } else {
            var topList = getTopListString(channel);
            if (topList) {
                client.say(target, `List of naughty people:  ${topList}`);
            } else {
                client.say(target, `${channel} hasn't been a dictator yet`);
            }
            console.log(`${topList}`);
            return;
        }
    }
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

function dehash(hashedString) {
    return hashedString.replace('#', '');
}
function detag(taggedString) {
    return taggedString.replace('@', '');
}
