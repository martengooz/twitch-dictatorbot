/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-template-curly-in-string */
import fs from "fs";
import Bot from "../src/bot";
import * as cfg from "./cfg.json";

const command = {
  channel: "_testuser",
  context: {
    mod: false,
    turbo: false,
    username: "_testuser"
  },
  command: "!dic",
  self: false
};

const dbEmpty = {
  channelName: "_testuser",
  deletedMessages: {},
  excludedUsers: [],
  noTopList: 5,
  messages: {
    help:
      "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.",
    topList: "List of naughty people: ${topList}",
    topListEmpty: "${channel} hasn't been a dictator yet",
    specificUser: "Messages deleted for ${user}: ${num}"
  }
};

const dbTestuser = {
  channelName: "_testuser",
  deletedMessages: {
    _testuser: 1
  },
  excludedUsers: [],
  noTopList: 5,
  messages: {
    help:
      "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.",
    topList: "List of naughty people: ${topList}",
    topListEmpty: "${channel} hasn't been a dictator yet",
    specificUser: "Messages deleted for ${user}: ${num}"
  }
};

function reset() {
  fs.rmdirSync(cfg.dbPath, { recursive: true });
}

describe("Twitch command", () => {
  let bot = {};

  beforeEach(() => {
    bot = new Bot(cfg);
  });

  afterEach(async () => {
    await bot.disconnect();
    reset();
  });

  test("bot connects to Twitch", async () => {
    const connectFn = jest.spyOn(bot.TmiClient, "connect");

    const res = await bot.connect();

    expect(connectFn).toHaveBeenCalled();
    expect(res).toBe(true);
  });
  });
});
