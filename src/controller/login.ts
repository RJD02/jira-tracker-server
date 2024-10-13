import { Request, Response } from "express"
import db, { updateUser } from '../db/db'
import { LoginRequest, User } from "../models/login"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10;
const privateKey = 'WHITEKLAY'

export const LoginGraph = async (username: string, password: string) => {
    try {
        const query = 'select * from users where username=?'
        const userHandler = (err: Error, user: User) => {
            if (err) {
                return
            } if (!user) {
                return
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return
                }
                if (!result) {
                    return
                }
                return user
            })
        }
        db.get(query, [username], userHandler)
    } catch (err) {
        console.log(err)
    }

}

export const Login = (req: Request, res: Response) => {
    const { password, username }: LoginRequest = req.body
    try {
        const query = 'select * from users  where username=?'
        const userHandler = (err: Error, user: User) => {
            if (err) {
                return res.status(500).json({ err: err.message })
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ err: err.message })
                }
                if (!result) {
                    return res.status(401).json({ message: 'Invalid password' })
                }
                const token = jwt.sign({ username: user.username, id: user.id }, privateKey, { expiresIn: '30d' })
                user.expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                user.token = token
                updateUser(user)
                return res.status(200).json({ message: 'Login successfull', data: user })
            })
        }
        db.get(query, [username], userHandler)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ err })
    }
}

export const createUserTable = () => {
    db.exec(`
            create table if not exists users(
                id integer primary key autoincrement,
                username varchar(50) not null,
                password varchar(100) not null,
                token varchar(100),
                expiry datetime
            )
            `)

}

export const createUser = async () => {
    try {
        const user: LoginRequest = {
            username: process.env.USER || "whiteklay",
            password: process.env.PASSWORD || "hello"
        }
        const salt = await bcrypt.genSalt(SALT_ROUNDS)


        const hashedPassword = await bcrypt.hash(user.password, salt)

        user.password = hashedPassword
        const query = `
                insert into users (username, password) values 
                ('${user.username}', '${user.password}')
                `

        db.run(query)
        console.log('Whiteklay user created')
    } catch (e) {
        console.log(e)
        return
    }
}

export const showAllUsers = async () => {
    try {
        const query = 'select * from users'
        const usersHandler = (err: Error, users: User[]) => {
            if (err) {
                return
            }
            console.log(users)
        }
        db.all(query, usersHandler)
    } catch (err) {
        console.log(err)
    }
}
