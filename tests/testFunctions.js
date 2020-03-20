import path from "path";
import * as cfg from "./cfg.json";
import fs from "fs";

const cfgPath = path.resolve("tests/cfg.json");
const dbPath = path.resolve(cfg.dbPath);
cfg.dbPath = dbPath;
const defaultCfg = `{
    "username": "BotuTiemersma",
    "password": "oauth:3cb8y7mkubfrd4bu7jinjj0jolowaq",
    "channels": [
        "martengooz"
    ],
    "dbPath": "db",
    "defaultValues": {
        "channelName": "",
        "deletedMessages": {},
        "excludedUsers": [],
        "noTopList": 5,
        "messages": {
            "help": "I track deleted messages in this channel. Use !\${botName} to see a high score. Add @<username> to see a specific user.",
            "topList": "List of naughty people: \${topList}",
            "topListEmpty": "\${channel} hasn't been a dictator yet",
            "specificUser": "Messages deleted for \${user}: \${num}"
        }
    },
    "webUrls": {},
    "webServerPort": 3000
}`;

function restoreCfg() {
  fs.writeFileSync(cfgPath, defaultCfg);
  console.log("resetting");
}

export { cfg, dbPath, cfgPath, defaultCfg, restoreCfg };
