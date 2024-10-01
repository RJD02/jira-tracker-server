
import path from 'path';
import sqlite from 'sqlite3'

sqlite.verbose()

const dbFilePath = '../../login.db'

function createDbConnection() {
    console.log(__dirname)
    const dbFile = path.resolve(__dirname, '../../login.db')
    const db = new sqlite.Database(dbFile, (error) => {
        if (error) {
            return console.error(error.message);
        }
    });
    console.log("Connection with SQLite has been established");
    return db;
}

const db = createDbConnection()
export default db
