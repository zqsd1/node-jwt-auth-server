import 'dotenv/config'
import express from "express"
import cookieParser from "cookie-parser"
import { router as auth } from "./src/routes/auth.js"
import { router as account } from "./src/routes/users.js"
import "./src/db/mongo.js"
import cors from "cors"
import { logger } from './winston.js'

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))

app.use('/auth', auth)
app.use('/auth/accounts', account)

app.listen(process.env.EXPRESS_PORT || 3200, () => {

    logger.info("server started on http://localhost:" + (process.env.EXPRESS_PORT || 3200))
})