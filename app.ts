import "./src/server";
import Bot from "./src/bot";
import * as cfg from "./src/cfg.json";

const bot = new Bot(cfg);
bot.connect();
