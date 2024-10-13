
import path from 'path';
import sqlite from 'sqlite3'
import { User } from '../models/login'

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



export const updateUser = (user: User) => {
    try {
        const query = `update users set token = '${user.token}', expiry = '${user.expiry}' where id = ${user.id}`
        db.run(query)
    } catch (err) {
        console.log(err)
    }
}

const db = createDbConnection()
export default db
