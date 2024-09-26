"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
sqlite3_1.default.verbose();
const dbFilePath = '../../login.db';
function createDbConnection() {
    console.log(__dirname);
    const dbFile = path_1.default.resolve(__dirname, 'login.db');
    const db = new sqlite3_1.default.Database(dbFilePath, (error) => {
        if (error) {
            return console.error(error.message);
        }
    });
    console.log("Connection with SQLite has been established");
    return db;
}
const db = createDbConnection();
exports.default = db;
