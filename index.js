import 'dotenv/config'
import express from "express"
import cookieParser from "cookie-parser"
import { router as auth } from "./src/routes/auth.js"
import { router as account } from "./src/routes/users.js"
import "./src/db/mongo.js"
import cors from "cors"
import { logger } from './src/winston.js'
import { errors } from './src/middlewares/errors.js'

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))

app.use('/auth', auth)
app.use('/auth/accounts', account)

app.use(errors)

const port = process.env.EXPRESS_PORT || 3200
const server = app.listen(port, () => {
    logger.info(`server started on http://0.0.0.0:${port}`)
})

const gracefullShutdown = () => {
    logger.info('closing server')
    server.close(() => {
        logger.info('Server closed.');
    });
}

process.on('SIGTERM', gracefullShutdown)
process.on("SIGINT", gracefullShutdown)