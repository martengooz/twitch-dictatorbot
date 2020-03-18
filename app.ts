import "./src/server";
import Bot from "./src/bot";
import * as cfg from "./src/cfg.json";
import Console from "console-stamp";
import path from "path";
Console(console, "yyyy-mm-dd HH:MM:ss");

const cfgPath = path.resolve("./src/cfg.json");
const bot = new Bot(cfgPath, cfg);
bot.connect();
