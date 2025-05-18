import express from "express"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import { router as auth } from "./routes/auth.js"
import cors from "cors"

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    credentials:true
}))

app.use('/auth',auth)

app.listen(process.env.EXPRESS_PORT || 3200, () => {
    console.log("server started on http://localhost:" + process.env.EXPRESS_PORT || 3200)
})