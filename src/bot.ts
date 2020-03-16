import { dehash } from "./helpers";
import { Client, Userstate } from "tmi.js";
import Db from "./db";
import BotCommands from "./botCommands";
import Console from "console-stamp";
Console(console, "yyyy-mm-dd HH:MM:ss");

export default class Bot {
  // Define configuration options
  opts: object;
  db: any;
  TmiClient: Client;
  botCommands: BotCommands;

  constructor(private cfg: any) {
    this.db = new Db(cfg);
    this.opts = {
      identity: {
        username: this.cfg.username,
        password: this.cfg.password
      },
      connection: {
        secure: true,
        reconnect: true
      },
      channels: this.cfg.channels
    };

    this.TmiClient = Client(this.opts);

    this.botCommands = new BotCommands(this.TmiClient, this.db);

    this.TmiClient.on("message", (t, c, m, s) => {
      this.onMessageHandler(t, c, m, s, this);
    });
    this.TmiClient.on("messagedeleted", (t, u) => {
      this.onMessageDeletedHandler(t, u, this);
    });
  }

  async connect() {
    // Connect to twitch
    try {
      await this.TmiClient.connect();
    } catch (err) {
      console.error(`Could not connect to Twitch - ${err}`);
      return false;
    }
    console.log("Connected to Twitch");
    console.info(`Connected channels: ${this.cfg.channels}`);
    return true;
  }

  async disconnect() {
    // Connect to twitch
    try {
      await this.TmiClient.disconnect();
    } catch (err) {
      console.error(`Could not disconnect to Twitch - ${err}`);
      return false;
    }
    console.log("Disconnected from Twitch");
    return true;
  }

  public onMessageDeletedHandler(
    channel: string,
    username: string,
    bot: Bot
  ): void {
    bot.db.add(dehash(channel), username);
  }

  public onMessageHandler(
    target: string,
    context: Userstate,
    msg: string,
    self: boolean,
    bot: Bot
  ): void {
    // Ignore messages from the bot
    if (self) {
      return;
    }
    bot.botCommands.executeCommand(target, context, msg);
  }
}
