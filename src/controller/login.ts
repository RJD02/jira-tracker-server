import { Request, Response } from "express"
import db from '../db/db'
import { LoginRequest, User } from "../models/login"
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;


export const Login = (req: Request, res: Response) => {
    const { password, username }: LoginRequest = req.body
    try {
        const query = 'select * from users  where username=?'
        console.log('query=', query)
        const userHandler = (err: Error, user: User) => {
            if (err) {
                return res.status(500).json({ err: err.message })
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            console.log(user)
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ err: err.message })
                }
                if (!result) {
                    return res.status(401).json({ message: 'Invalid password' })
                }
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
            create table users(
                id integer primary key autoincrement,
                username varchar(50) not null,
                password varchar(100) not null
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
        console.log(query)

        const data = db.run(query)
        console.log('Data = ', data)
        console.log('Added the user')
    } catch (e) {
        console.log(e)
        return
    }
}
