import "./src/server";
import Bot from "./src/bot";
import * as cfg from "./src/cfg.json";
import Console from "console-stamp";
Console(console, "yyyy-mm-dd HH:MM:ss");

const bot = new Bot(cfg);
bot.connect();
