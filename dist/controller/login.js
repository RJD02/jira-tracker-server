"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.createUserTable = exports.Login = void 0;
const db_1 = __importDefault(require("../db/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
const Login = (req, res) => {
    const { password, username } = req.body;
    console.log('dir_name', __dirname);
    try {
        const query = `
                             select * from users  where username='${username}'
                             `;
        let user;
        db_1.default.get(query, [1], (err, rows) => {
            if (err) {
                return res.status(500).json({ err: err.message });
            }
            console.log(rows);
            user = rows;
            return res.status(200).json({ data: user });
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ err });
    }
};
exports.Login = Login;
const createUserTable = () => {
    db_1.default.exec(`
            create table users(
                id integer primary key autoincrement,
                username varchar(50) not null,
                password varchar(100) not null
            )
            `);
};
exports.createUserTable = createUserTable;
const createUser = async () => {
    try {
        const user = {
            username: process.env.USER || "whiteklay",
            password: process.env.PASSWORD || "hello"
        };
        const salt = await bcrypt_1.default.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt_1.default.hash(user.password, salt);
        user.password = hashedPassword;
        const query = `
                insert into users (username, password) values 
                ('${user.username}', '${user.password}')
                `;
        console.log(query);
        const data = db_1.default.run(query);
        console.log('Data = ', data);
        console.log('Added the user');
    }
    catch (e) {
        console.log(e);
        return;
    }
};
exports.createUser = createUser;
