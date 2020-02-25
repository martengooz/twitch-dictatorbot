/* eslint-disable no-template-curly-in-string */
"use strict";

jest.mock("fs");

const DbHandler = require("../db");
const db = new DbHandler({
  dbPath: "db",
  defaultValues: {
    channelName: "",
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
  },
  webUrls: {
    "68e2d5e3-d3af-4e99-b571-14f199b12206": "martengooz"
  }
});

const dbValidObj = {
  channelName: "validchannel",
  deletedMessages: {
    user1: 5,
    user2: 2,
    user3: 4
  },
  excludedUsers: [],
  noTopList: 5,
  messages: {
    help: "help message",
    topList: "${topList}",
    topListEmpty: "no deleted messages",
    specificUser: "${user}: ${num}"
  }
};

const dbNoUsers = Object.assign({}, dbValidObj, {
  deletedMessages: {}
});

const dbFewUsers = Object.assign({}, dbValidObj, {
  deletedMessages: { user1: 2, user2: 4 }
});

const dbManyUsers = Object.assign({}, dbValidObj, {
  deletedMessages: {
    user1: 8,
    user2: 2,
    user3: 4,
    user4: 4,
    user5: 7,
    user6: 2
  }
});

const dbMissingKeyObj = Object.assign({}, dbValidObj);
delete dbMissingKeyObj.deletedMessages;

const MOCK_FILE_INFO = {
  "db/valid.json": JSON.stringify(dbValidObj),
  "db/noUsers.json": JSON.stringify(dbNoUsers),
  "db/fewUsers.json": JSON.stringify(dbFewUsers),
  "db/manyUsers.json": JSON.stringify(dbManyUsers),
  "db/missing.json": JSON.stringify(dbMissingKeyObj),
  "db/invalid.json": "{ invalid }",
  "db/emptyString.json": "",
  "db/emptyJson.json": "{}"
};
describe("db", () => {
  beforeEach(() => {
    // Set up some mocked out file info before each test
    require("fs").__setMockFiles(MOCK_FILE_INFO);
  });
  describe("getChannelDb", () => {
    test("reads from correct file.", () => {
      const dbValid = db.getChannelDb("valid");
      expect(dbValid).toStrictEqual(dbValidObj);
    });

    test("creates new db if file not exist.", () => {
      db.createDb = jest.fn(channel => dbValidObj);

      const newdb = db.getChannelDb("nonexistant");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(newdb).toStrictEqual(dbValidObj);
    });

    test("creates new db if file is empty.", () => {
      db.createDb = jest.fn(channel => dbValidObj);

      const emptyStringDb = db.getChannelDb("emptyString");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(emptyStringDb).toStrictEqual(dbValidObj);

      const emptyJsonDb = db.getChannelDb("emptyJson");
      expect(db.createDb.mock.calls.length).toBe(2);
      expect(emptyJsonDb).toStrictEqual(dbValidObj);
    });

    test("creates new db if file is invalid.", () => {
      db.createDb = jest.fn(channel => dbValidObj);

      const invalidDb = db.getChannelDb("invalid");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(invalidDb).toStrictEqual(dbValidObj);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip("creates new key from default if key not exist.", () => {
      const expectedDb = dbMissingKeyObj;
      expectedDb.deletedMessages = {};
      db.createDb = jest.fn(channel => expectedDb);

      const newdb = db.getChannelDb("missing");
      // expect(db.createDb.mock.calls.length).toBe(1);
      expect(newdb).toStrictEqual(expectedDb);
    });
  });

  describe("Bot messages", () => {
    test("getBotMessages gets all custom messages", () => {
      db.getChannelDb = jest.fn(channel => dbValidObj);

      const messages = db.getBotMessages("valid");
      expect(messages).toStrictEqual(dbValidObj.messages);
    });

    test("getBotMessage gets a valid custom message with no replacement", () => {
      db.getBotMessages = jest.fn(channel => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "help", {});
      expect(messages).toStrictEqual(dbValidObj.messages.help);
    });

    test("getBotMessage return empty string on npn valid custom message", () => {
      db.getBotMessages = jest.fn(channel => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "non-valid", {});
      expect(messages).toEqual("");
    });

    test("getBotMessage gets a valid custom message with replacement", () => {
      db.getBotMessages = jest.fn(channel => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "topList", {
        topList: "toplist"
      });
      expect(messages).toEqual("toplist");
    });
  });

  describe("Top list", () => {
    test("getTopList returns empty array list when there is no deleted messages", () => {
      db.getChannelDb = jest.fn(channel => dbNoUsers);

      const messages = db.getTopList("noUsers");
      expect(messages).toStrictEqual([]);
    });

    test("getTopList returns correct correct top list when few users", () => {
      db.getChannelDb = jest.fn(channel => dbFewUsers);

      const messages = db.getTopList("fewUsers");
      expect(messages).toStrictEqual([
        { user: "user2", num: 4 },
        { user: "user1", num: 2 }
      ]);
    });

    test("getTopList returns correct number of users when many users", () => {
      db.getChannelDb = jest.fn(channel => dbManyUsers);

      const messages = db.getTopList("manyUsers");
      expect(messages).toStrictEqual([
        { user: "user1", num: 8 },
        { user: "user5", num: 7 },
        { user: "user3", num: 4 },
        { user: "user4", num: 4 },
        { user: "user2", num: 2 }
      ]);
    });

    test("getTopListString returns empty message when is no deleted messages", () => {
      db.getChannelDb = jest.fn(channel => dbNoUsers);

      const messages = db.getTopListString("noUsers");
      expect(messages).toStrictEqual("");
    });

    test("getTopListString returns comma separated string without last comma", () => {
      db.getChannelDb = jest.fn(channel => dbFewUsers);

      const messages = db.getTopListString("fewUsers");
      expect(messages).toStrictEqual("user2: 4, user1: 2");
    });
  });
});
