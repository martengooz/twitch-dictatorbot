import Db from "./db";
import express from "express";
import * as cfg from "./cfg.json";

const db = new Db(cfg);

const app = express();
const port = cfg.webServerPort;

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.use(express.json());

function getDbNameFromSecret(secret): string {
  secret = secret.replace("/", "");

  if (secret in cfg.webUrls) {
    return cfg.webUrls[secret];
  }
  return "";
}

app.get("/:secret", (req, res) => {
  const dbname = getDbNameFromSecret(req.params.secret);
  if (dbname) {
    console.log(`Editing config for #${cfg.webUrls[req.params.secret]}`);

    let sampleDb = {
      channelName: req.params.secret,
      deletedMessages: {
        user1: 2,
        user2: 1,
        user3: 6
      },
      excludedUsers: ["excludeduser1", "excludeduse2"]
    };
    sampleDb = Object.assign(sampleDb, cfg.defaultValues);

    const dbSettings = db.getChannelDb(getDbNameFromSecret(req.params.secret));
    res.render("index", {
      db: JSON.stringify(dbSettings, null, 4),
      sampleDb: JSON.stringify(sampleDb, null, 4)
    });
  } else {
    console.error(
      `Tried to access config with secret ${req.params.secret} from ${req.ip}`
    );
    res.sendStatus(404);
  }
});

app.post("/:secret", (req, res) => {
  try {
    if (req.body) {
      const dbn = getDbNameFromSecret(req.params.secret);
      console.log(`Saving config for #${dbn}`);
      db.writeToDb(dbn, req.body);
      res.sendStatus(200);
    } else {
      console.error(
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
    return console.error("could not start server", err);
  }

  console.log(`Server is listening on ${port}`);
});
