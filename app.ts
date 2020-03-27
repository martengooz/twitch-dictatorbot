import "./src/server";
import Bot from "./src/bot";
import Console from "console-stamp";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cfg = require("./src/cfg.json");
Console(console, "yyyy-mm-dd HH:MM:ss");

const cfgPath = path.resolve("./src/cfg.json");
const bot = new Bot(cfgPath, cfg);
bot.connect();
