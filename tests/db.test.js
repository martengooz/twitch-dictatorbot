'use strict';

jest.mock('fs');

const dbHandler = require('../db');
const db = new dbHandler({
    "dbPath": "db",
    "defaultValues": {
        "channelName": "",
        "deletedMessages": {},
        "excludedUsers": [],
        "noTopList": 5,
        "messages": {
            "help": "I track deleted messages in this channel. Use !dictatorbot to see a high score. Add @<username> to see a specific user.",
            "topList": "List of naughty people: ${topList}",
            "topListEmpty": "${channel} hasn't been a dictator yet",
            "specificUser": "Messages deleted for ${user}: ${num}"
        }
    },
    "webUrls": {
        "68e2d5e3-d3af-4e99-b571-14f199b12206": "martengooz"
    }
})

const dbValidObj = {
    "channelName": "validchannel",
    "deletedMessages": {
        "user1": 5,
        "user2": 2,
        "user3": 4
    },
    "excludedUsers": [],
    "noTopList": 5,
    "messages": {
        "help": "help message",
        "topList": "${topList}",
        "topListEmpty": "no deleted messages",
        "specificUser": "${user}: ${num}"
    }
};

const dbMissingKeyObj = {
    "channelName": "missingkeychannel",
    "excludedUsers": [],
    "noTopList": 5,
    "messages": {
        "help": "help message",
        "topList": "${topList}",
        "topListEmpty": "no deleted messages",
        "specificUser": "${user}: ${num}"
    }
};

const MOCK_FILE_INFO = {
    'db/valid.json': JSON.stringify(dbValidObj),
    'db/missing.json': JSON.stringify(dbMissingKeyObj),
    'db/invalid.json': '{ invalid }',
    'db/emptyString.json': '',
    'db/emptyJson.json': '{}'

};

describe('getChannelDb', () => {
    beforeEach(() => {
        // Set up some mocked out file info before each test
        require('fs').__setMockFiles(MOCK_FILE_INFO);
    });

    test('reads from correct file.', () => {
        const dbValid = db.getChannelDb('valid');
        expect(dbValid).toStrictEqual(dbValidObj);
    });

    test('creates new db if file not exist.', () => {
        db.createDb = jest.fn(channel => dbValidObj);

        const newdb = db.getChannelDb('nonexistant');
        expect(db.createDb.mock.calls.length).toBe(1);
        expect(newdb).toStrictEqual(dbValidObj)
    });

    test('creates new db if file is empty.', () => {
        db.createDb = jest.fn(channel => dbValidObj);

        const emptyStringDb = db.getChannelDb('emptyString');
        expect(db.createDb.mock.calls.length).toBe(1);
        expect(emptyStringDb).toStrictEqual(dbValidObj)

        const emptyJsonDb = db.getChannelDb('emptyJson');
        expect(db.createDb.mock.calls.length).toBe(2);
        expect(emptyJsonDb).toStrictEqual(dbValidObj)
    });

    test('creates new db if file is invalid.', () => {
        db.createDb = jest.fn(channel => dbValidObj);

        const invalidDb = db.getChannelDb('invalid');
        expect(db.createDb.mock.calls.length).toBe(1);
        expect(invalidDb).toStrictEqual(dbValidObj)
    });

    test.skip('creates new key from default if key not exist.', () => {
        const expectedDb = dbMissingKeyObj; 
        expectedDb["deletedMessages"] = {};
        db.createDb = jest.fn(channel => expectedDb);

        const newdb = db.getChannelDb('missing');
        //expect(db.createDb.mock.calls.length).toBe(1);
        expect(newdb).toStrictEqual(expectedDb)
    });
});