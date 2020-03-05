"use strict";

const express = require("express");
const cfg = require("./cfg.json");
const DbHandler = require("./db.js");

const db = new DbHandler(cfg);

const app = express();
const port = cfg.webServerPort;

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.use(express.json());

function getDbNameFromSecret(secret) {
  secret = secret.replace("/", "");

  if (secret in cfg.webUrls) {
    return cfg.webUrls[secret];
  }
  return false;
}

app.get("/:secret", (req, res) => {
  const dbname = getDbNameFromSecret(req.params.secret);
  if (dbname) {

    var sampleDb = {
      channelName: req.params.secret,
      deletedMessages: {
        user1: 2,
        user2: 1,
        user3: 6
      }
    };
    sampleDb = Object.assign(sampleDb, cfg.defaultValues);
    sampleDb.excludedUsers = ["excludeduser1", "excludeduse2"];

    const dbSettings = db.getChannelDb(getDbNameFromSecret(req.params.secret));
    res.render("index", {
      db: JSON.stringify(dbSettings, null, 4),
      sampleDb: JSON.stringify(sampleDb, null, 4)
    });
  } else {
    console.error(
    );
    res.sendStatus(404);
  }
});

app.post("/:secret", (req, res) => {
  try {
    if (req.body) {
      var dbn = getDbNameFromSecret(req.params.secret);
      db.writeToDb(dbn, req.body);
      res.sendStatus(200);
    } else {
      console.error(
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(400);
  }
});

app.listen(port, err => {
  if (err) {
  }

});
