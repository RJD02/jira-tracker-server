import express, { Express } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import * as jiraController from './controller/jira-client';
import * as loginController from './controller/login'
import cors from 'cors'

const app: Express = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

// loginController.createUserTable()
// loginController.createUser()

app.get('/', (req, res) => { console.log('Hello'); res.json({ message: 'Working' }) })
app.get('/salam', jiraController.fetchJiraData)
app.get('/star', jiraController.fetchJiraData)
app.get('/customer_success', jiraController.fetchJiraData)
app.get('/microui', jiraController.fetchJiraData)
app.post('/auth', loginController.Login)

app.listen(port, () => {
    console.log(`Server is online at: http://localhost:${port}`)
})

export default app
