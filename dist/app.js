"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jira_client_1 = require("./controller/jira-client");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.get('/', (req, res) => { console.log('Hello'); res.json({ message: 'Working' }); });
app.get('/salam', jira_client_1.fetchJiraData);
app.get('/star', jira_client_1.fetchJiraData);
app.listen(port, () => {
    console.log(`Server is online at: http://localhost:${port}`);
});
exports.default = app;
