import express, { Express } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { fetchJiraData } from './controller/jira-client';
import cors from 'cors'


const app: Express = express()
const port = process.env.PORT || 5000;

app.use(cors())

app.get('/', (req, res) => { console.log('Hello'); res.json({ message: 'Working' }) })
app.get('/salam', fetchJiraData)
app.get('/star', fetchJiraData)

app.listen(port, () => {
    console.log(`Server is online at: http://localhost:${port}`)
})
