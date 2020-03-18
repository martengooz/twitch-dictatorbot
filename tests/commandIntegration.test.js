/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-template-curly-in-string */
import fs from "fs";
import path from "path";
import Bot from "../src/bot";
import { cfg, cfgPath, dbPath } from "./testFunctions";

const testChannel = "_testchannel";
const testUser = "_testuser";
const topListCommand = {
  channel: testChannel,
  context: {
    mod: false,
    turbo: false,
    username: testUser
  },
  command: `!${cfg.username}`,
  self: false
};
const specificUserCommand = {
  channel: testChannel,
  context: {
    mod: false,
    turbo: false,
    username: testUser
  },
  self: false
};

const dbEmpty = {
  channelName: testChannel,
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

function reset() {
  // Remove test db files
  fs.readdirSync(dbPath).forEach(file => {
    fs.unlinkSync(path.join(dbPath, file));
  });
}

function createDb(user, data) {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
  fs.writeFileSync(`${dbPath}/${user}.json`, JSON.stringify(data, null, 4));
}

async function sendToplistMessage(bot) {
  await bot.TmiClient.emit(
    "message",
    topListCommand.channel,
    topListCommand.context,
    topListCommand.command,
    topListCommand.self
  );
}

async function sendDeletedMessage(bot, user) {
  await bot.TmiClient.emit(
    "message",
    topListCommand.channel,
    topListCommand.context,
    `!${cfg.username} @${user}`,
    topListCommand.self
  );
}

describe("Twitch command", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    reset();
  });

  let bot = {};

  test("bot connects to Twitch", async () => {
    bot = new Bot(cfgPath, cfg);
    const connectFn = jest.spyOn(bot.TmiClient, "connect");

    const res = await bot.connect();

    expect(connectFn).toHaveBeenCalled();
    expect(res).toBe(true);
    await bot.disconnect();
  });

  describe("get toplist command", () => {
    beforeAll(async () => {
      bot = new Bot(cfgPath, cfg);
      await bot.connect();
    });

    afterAll(async () => {
      await bot.disconnect();
    });

    test("create new db", async () => {
      await sendToplistMessage(bot);

      const dbExists = fs.existsSync(
        `${dbPath}/${topListCommand.channel}.json`
      );
      expect(dbExists).toBe(true);
      const db = JSON.parse(
        fs.readFileSync(`${dbPath}/${topListCommand.channel}.json`)
      );
      expect(db).toEqual(dbEmpty);
    });

    test("say empty toplist string", async () => {
      const sayFn = jest.spyOn(bot.TmiClient, "say");
      await sendToplistMessage(bot);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        ["_testchannel", "_testchannel hasn't been a dictator yet"]
      ]);
    });

    test("say toplist string with one user", async () => {
      const dbOneUser = Object.assign({}, dbEmpty, {
        deletedMessages: { _testuser: 1 }
      });
      createDb(topListCommand.channel, dbOneUser);
      const sayFn = jest.spyOn(bot.TmiClient, "say");

      await sendToplistMessage(bot);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        ["_testchannel", "List of naughty people: _testuser: 1"]
      ]);
    });

    test("say toplist string with three users", async () => {
      const dbThreeUsers = Object.assign({}, dbEmpty, {
        deletedMessages: { _testuser1: 1, _testuser2: 4, _testuser3: 2 }
      });
      createDb(topListCommand.channel, dbThreeUsers);
      const sayFn = jest.spyOn(bot.TmiClient, "say");

      await sendToplistMessage(bot);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        [
          "_testchannel",
          "List of naughty people: _testuser2: 4, _testuser3: 2, _testuser1: 1"
        ]
      ]);
    });

    test("say toplist string with more than max limit users", async () => {
      const dbMaxUsers = Object.assign({}, dbEmpty, {
        deletedMessages: {
          _testuser1: 1,
          _testuser2: 4,
          _testuser3: 2,
          _testuser4: 5,
          _testuser5: 2,
          _testuser6: 4
        }
      });
      createDb(topListCommand.channel, dbMaxUsers);
      const sayFn = jest.spyOn(bot.TmiClient, "say");

      await sendToplistMessage(bot);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls[0][1]).toMatch(
        /List of naughty people: _testuser4: 5, _testuser(2|6): 4, _testuser(2|6): 4, _testuser(3|5): 2, _testuser(3|5): 2/
      );
    });
  });
  describe("get specific user command", () => {
    beforeAll(async () => {
      bot = new Bot(cfgPath, cfg);
      await bot.connect();
    });

    afterAll(async () => {
      await bot.disconnect();
    });

    test("say 0 when no db", async () => {
      const sayFn = jest.spyOn(bot.TmiClient, "say");
      await sendDeletedMessage(bot, testUser);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        ["_testchannel", `Messages deleted for ${testUser}: 0`]
      ]);
    });

    test("say 0 if user not in db", async () => {
      const dbOneUser = Object.assign({}, dbEmpty, {
        deletedMessages: { _testuser: 1 }
      });
      createDb(topListCommand.channel, dbOneUser);
      const sayFn = jest.spyOn(bot.TmiClient, "say");
      await sendDeletedMessage(bot, "_not_in_db");

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        ["_testchannel", "Messages deleted for _not_in_db: 0"]
      ]);
    });

    test("say num of deleted messages if in db", async () => {
      const dbOneUser = Object.assign({}, dbEmpty, {
        deletedMessages: { _testuser: 1 }
      });
      createDb(topListCommand.channel, dbOneUser);
      const sayFn = jest.spyOn(bot.TmiClient, "say");
      await sendDeletedMessage(bot, testUser);

      expect(sayFn).toHaveBeenCalled();
      expect(sayFn.mock.calls).toEqual([
        ["_testchannel", `Messages deleted for ${testUser}: 1`]
      ]);
    });
  });
});
