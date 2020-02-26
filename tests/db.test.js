/* eslint-disable no-template-curly-in-string */
"use strict";

jest.mock("fs");

const DbHandler = require("../db");
let db = {};
let dbValidObj = {};
let dbNoUsersObj = {};
let dbFewUsersObj = {};
let dbManyUsersObj = {};
let dbMissingKeyObj = {};
let MOCK_FILE_INFO = {};

function resetDb() {
  db = new DbHandler({
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

  dbValidObj = {
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

  dbNoUsersObj = Object.assign({}, dbValidObj, {
    deletedMessages: {}
  });

  dbFewUsersObj = Object.assign({}, dbValidObj, {
    deletedMessages: { user1: 2, user2: 4 }
  });

  dbManyUsersObj = Object.assign({}, dbValidObj, {
    deletedMessages: {
      user1: 8,
      user2: 2,
      user3: 4,
      user4: 4,
      user5: 7,
      user6: 2
    }
  });

  dbMissingKeyObj = Object.assign({}, dbValidObj);
  delete dbMissingKeyObj.deletedMessages;

  MOCK_FILE_INFO = {
    "db/valid.json": JSON.stringify(dbValidObj),
    "db/noUsers.json": JSON.stringify(dbNoUsersObj),
    "db/fewUsers.json": JSON.stringify(dbFewUsersObj),
    "db/manyUsers.json": JSON.stringify(dbManyUsersObj),
    "db/missing.json": JSON.stringify(dbMissingKeyObj),
    "db/invalid.json": "{ invalid }",
    "db/emptyString.json": "",
    "db/emptyJson.json": "{}"
  };
}

describe("db", () => {
  beforeEach(() => {
    // Set up some mocked out file info before each test
    require("fs").__setMockFiles(MOCK_FILE_INFO);

    resetDb();
  });
  describe("add", () => {
    test("adds new user when not existing.", () => {
      db.getChannelDb = jest.fn(() => dbNoUsersObj);
      db.writeKeyToDb = jest.fn(() => dbNoUsersObj);

      db.add("noUsers", "user");
      expect(db.writeKeyToDb.mock.calls).toEqual([
        ["noUsers", "deletedMessages", { user: 1 }]
      ]);
    });

    test("increments users deleted messages when existing.", () => {
      db.getChannelDb = jest.fn(() => dbFewUsersObj);
      db.writeKeyToDb = jest.fn(() => dbFewUsersObj);

      db.add("fewUsers", "user1");
      expect(db.writeKeyToDb.mock.calls).toEqual([
        ["fewUsers", "deletedMessages", { user1: 3, user2: 4 }]
      ]);
    });

    test("don't add when user is excluded.", () => {
      db.getChannelDb = jest.fn(() => dbFewUsersObj);
      db.writeKeyToDb = jest.fn(() => dbFewUsersObj);
      db.isExcluded = jest.fn(() => true);

      db.add("fewUsers", "user1");
      expect(db.writeKeyToDb.mock.calls.length).toEqual(0);
    });
  });

  describe("read", () => {
    test("reads from correct file.", () => {
      const dbValid = db.getChannelDb("valid");
      expect(dbValid).toStrictEqual(dbValidObj);
    });

    test("creates new db if file not exist.", () => {
      db.createDb = jest.fn(() => dbValidObj);

      const newdb = db.getChannelDb("nonexistant");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(newdb).toStrictEqual(dbValidObj);
    });

    test("creates new db if file is empty.", () => {
      db.createDb = jest.fn(() => dbValidObj);

      const emptyStringDb = db.getChannelDb("emptyString");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(emptyStringDb).toStrictEqual(dbValidObj);

      const emptyJsonDb = db.getChannelDb("emptyJson");
      expect(db.createDb.mock.calls.length).toBe(2);
      expect(emptyJsonDb).toStrictEqual(dbValidObj);
    });

    test("creates new db if file is invalid.", () => {
      db.createDb = jest.fn(() => dbValidObj);

      const invalidDb = db.getChannelDb("invalid");
      expect(db.createDb.mock.calls.length).toBe(1);
      expect(invalidDb).toStrictEqual(dbValidObj);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip("creates new key from default if key not exist.", () => {
      const expectedDb = dbMissingKeyObj;
      expectedDb.deletedMessages = {};
      db.createDb = jest.fn(() => expectedDb);

      const newdb = db.getChannelDb("missing");
      // expect(db.createDb.mock.calls.length).toBe(1);
      expect(newdb).toStrictEqual(expectedDb);
    });
  });

  describe("write", () => {
    test("writeKeyToDb writes to correct key if exist in db", () => {
      db.getChannelDb = jest.fn(() => dbValidObj);
      db.writeToDb = jest.fn(() => dbValidObj);
      db.createDb = jest.fn();

      db.writeKeyToDb("valid", "channelName", "stillValid");
      expect(db.writeToDb.mock.calls).toEqual([
        ["valid", Object.assign({}, dbValidObj, { channelName: "stillValid" })]
      ]);
      expect(db.createDb.mock.calls.length).toBe(0);
    });

    test("writeKeyToDb writes to correct key if not exist in db", () => {
      db.getChannelDb = jest.fn(() => dbValidObj);
      db.writeToDb = jest.fn(() => dbMissingKeyObj);

      db.writeKeyToDb("valid", "deletedMessages", {});
      expect(db.writeToDb.mock.calls).toEqual([
        ["valid", Object.assign({}, dbValidObj, { deletedMessages: {} })]
      ]);
    });

    test("creates new db if file not exist.", () => {
      db.createDb = jest.fn(() => dbValidObj);

      db.writeToDb("nonexistant", {});
      expect(db.createDb.mock.calls.length).toBe(1);
    });

    test("returns even if fs write throws error.", () => {
      const fs = require("fs");
      jest.mock("fs");
      fs.writeFileSync = jest.fn(() => {
        throw new Error();
      });
      const writeToDb = jest.spyOn(db, "writeToDb");

      db.writeToDb("valid", {});
      expect(writeToDb.mock.results).toEqual([
        { type: "return", value: undefined }
      ]);
    });

    test("returns even if JSON.stringify throws error.", () => {
      JSON.stringify = jest.fn(() => {
        throw new Error();
      });
      const writeToDb = jest.spyOn(db, "writeToDb");

      db.writeToDb("valid", "invalid input;");
      expect(writeToDb.mock.results).toEqual([
        { type: "return", value: undefined }
      ]);
      JSON.stringify.mockRestore();
    });
  });

  describe("Bot messages", () => {
    test("getBotMessages gets all custom messages", () => {
      db.getChannelDb = jest.fn(() => dbValidObj);

      const messages = db.getBotMessages("valid");
      expect(messages).toStrictEqual(dbValidObj.messages);
    });

    test("getBotMessage gets a valid custom message with no replacement", () => {
      db.getBotMessages = jest.fn(() => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "help", {});
      expect(messages).toStrictEqual(dbValidObj.messages.help);
    });

    test("getBotMessage return empty string on npn valid custom message", () => {
      db.getBotMessages = jest.fn(() => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "non-valid", {});
      expect(messages).toEqual("");
    });

    test("getBotMessage gets a valid custom message with replacement", () => {
      db.getBotMessages = jest.fn(() => dbValidObj.messages);

      const messages = db.getBotMessage("valid", "topList", {
        topList: "toplist"
      });
      expect(messages).toEqual("toplist");
    });
  });

  describe("Top list", () => {
    test("getTopList returns empty array list when there is no deleted messages", () => {
      db.getChannelDb = jest.fn(() => dbNoUsersObj);

      const messages = db.getTopList("noUsers");
      expect(messages).toStrictEqual([]);
    });

    test("getTopList returns correct correct top list when few users", () => {
      db.getChannelDb = jest.fn(() => dbFewUsersObj);

      const messages = db.getTopList("fewUsers");
      expect(messages).toStrictEqual([
        { user: "user2", num: 4 },
        { user: "user1", num: 2 }
      ]);
    });

    test("getTopList returns correct number of users when many users", () => {
      db.getChannelDb = jest.fn(() => dbManyUsersObj);

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
      db.getChannelDb = jest.fn(() => dbNoUsersObj);

      const messages = db.getTopListString("noUsers");
      expect(messages).toStrictEqual("");
    });

    test("getTopListString returns comma separated string without last comma", () => {
      db.getChannelDb = jest.fn(() => dbFewUsersObj);

      const messages = db.getTopListString("fewUsers");
      expect(messages).toStrictEqual("user2: 4, user1: 2");
    });
  });

  describe("Deleted Messages", () => {
    test("returns all deleted messages", () => {
      db.getChannelDb = jest.fn(() => dbValidObj);

      const deletedMessages = db.getDeletedMessages("valid");
      expect(deletedMessages).toStrictEqual(dbValidObj.deletedMessages);
    });

    test("returns empty object when db does not exist", () => {
      db.getChannelDb = jest.fn(() => dbMissingKeyObj);

      const deletedMessages = db.getDeletedMessages("missing");
      expect(deletedMessages).toStrictEqual({});
    });

    test("for user returns 0 when user not exist", () => {
      db.getDeletedMessages = jest.fn(() => dbValidObj.deletedMessages);

      const deletedMessages2 = db.getDeletedMessagesForUser("valid", "nonUser");
      expect(deletedMessages2).toEqual(0);

      db.getDeletedMessages = jest.fn(() => dbNoUsersObj.deletedMessages);

      const deletedMessages1 = db.getDeletedMessagesForUser("noUsers", "user1");
      expect(deletedMessages1).toEqual(0);
    });

    test("for user returns currect num when user exist", () => {
      db.getDeletedMessages = jest.fn(() => dbValidObj.deletedMessages);

      const deletedMessages1 = db.getDeletedMessagesForUser("valid", "user1");
      expect(deletedMessages1).toEqual(5);

      const deletedMessages2 = db.getDeletedMessagesForUser("valid", "user2");
      expect(deletedMessages2).toEqual(2);
    });
  });
});
