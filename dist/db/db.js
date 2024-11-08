"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
sqlite3_1.default.verbose();
const dbFilePath = '../../login.db';
function createDbConnection() {
    console.log(__dirname);
    const dbFile = path_1.default.resolve(__dirname, '../../login.db');
    const db = new sqlite3_1.default.Database(dbFile, (error) => {
        if (error) {
            return console.error(error.message);
        }
    });
    console.log("Connection with SQLite has been established");
    return db;
}
const updateUser = (user) => {
    try {
        const query = `update users set token = '${user.token}', expiry = '${user.expiry}' where id = ${user.id}`;
        db.run(query);
    }
    catch (err) {
        console.log(err);
    }
};
exports.updateUser = updateUser;
const db = createDbConnection();
exports.default = db;
