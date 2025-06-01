import express from "express"
import cookieParser from "cookie-parser"
import { router as auth } from "./src/routes/auth.js"
import { router as account } from "./src/routes/users.js"
import "./src/db/mongo.js"
import cors from "cors"
import { logger } from './src/winston.js'
import { errors } from './src/middlewares/errors.js'

if (process.env.NODE_ENV !== "production") import('dotenv/config')

const app = express()
if (process.env.NODE_ENV!== "production") {
    const morgan = await import('morgan')
    app.use(morgan('combined'))
}
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))

app.use('/auth', auth)
app.use('/auth/accounts', account)

app.use(errors)

app.listen(process.env.EXPRESS_PORT || 3200, () => {

    logger.info("server started on http://localhost:" + (process.env.EXPRESS_PORT || 3200))
})