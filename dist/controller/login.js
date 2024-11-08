"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllUsers = exports.createUser = exports.createUserTable = exports.Login = exports.LoginGraph = void 0;
const db_1 = __importStar(require("../db/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SALT_ROUNDS = 10;
const privateKey = 'WHITEKLAY';
const LoginGraph = async (username, password) => {
    try {
        const query = 'select * from users where username=?';
        const userHandler = (err, user) => {
            if (err) {
                return;
            }
            if (!user) {
                return;
            }
            bcrypt_1.default.compare(password, user.password, (err, result) => {
                if (err) {
                    return;
                }
                if (!result) {
                    return;
                }
                return user;
            });
        };
        db_1.default.get(query, [username], userHandler);
    }
    catch (err) {
        console.log(err);
    }
};
exports.LoginGraph = LoginGraph;
const Login = (req, res) => {
    const { password, username } = req.body;
    try {
        const query = 'select * from users  where username=?';
        const userHandler = (err, user) => {
            if (err) {
                return res.status(500).json({ err: err.message });
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            bcrypt_1.default.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ err: err.message });
                }
                if (!result) {
                    return res.status(401).json({ message: 'Invalid password' });
                }
                const token = jsonwebtoken_1.default.sign({ username: user.username, id: user.id }, privateKey, { expiresIn: '30d' });
                user.expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                user.token = token;
                (0, db_1.updateUser)(user);
                return res.status(200).json({ message: 'Login successfull', data: user });
            });
        };
        db_1.default.get(query, [username], userHandler);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ err });
    }
};
exports.Login = Login;
const createUserTable = () => {
    db_1.default.exec(`
            create table if not exists users(
                id integer primary key autoincrement,
                username varchar(50) not null,
                password varchar(100) not null,
                token varchar(100),
                expiry datetime
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
        db_1.default.run(query);
        console.log('Whiteklay user created');
    }
    catch (e) {
        console.log(e);
        return;
    }
};
exports.createUser = createUser;
const showAllUsers = async () => {
    try {
        const query = 'select * from users';
        const usersHandler = (err, users) => {
            if (err) {
                return;
            }
            console.log(users);
        };
        db_1.default.all(query, usersHandler);
    }
    catch (err) {
        console.log(err);
    }
};
exports.showAllUsers = showAllUsers;
