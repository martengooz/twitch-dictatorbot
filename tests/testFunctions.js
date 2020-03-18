import path from "path";
import * as cfg from "./cfg.json";

const cfgPath = path.resolve("./cfg.json");
const dbPath = path.resolve(cfg.dbPath);
cfg.dbPath = dbPath;
export { cfg, dbPath, cfgPath };
