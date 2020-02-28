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
    console.log(
      new Date().toISOString() +
        `Editing config for #${cfg.webUrls[req.params.secret]}`
    );

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
      new Date().toISOString() +
        `Tried to access config with secret ${req.params.secret} from ${req.ip}`
    );
    res.sendStatus(404);
  }
});

app.post("/:secret", (req, res) => {
  try {
    if (req.body) {
      var dbn = getDbNameFromSecret(req.params.secret);
      console.log(new Date().toISOString() + `Saving config for #${dbn}`);
      db.writeToDb(dbn, req.body);
      res.sendStatus(200);
    } else {
      console.error(
        new Date().toISOString() +
          `Failed to save config with secret ${req.params.secret} from ${req.ip}`
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(400);
  }
});

app.listen(port, err => {
  if (err) {
    return console.error(
      new Date().toISOString() + "could not start server",
      err
    );
  }

  console.log(new Date().toISOString() + `Server is listening on ${port}`);
});
