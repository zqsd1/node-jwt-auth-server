import express from "express"
import 'dotenv/config'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

app.post('/auth/login', (req, res) => {
//find user in db
//jwt sign
//refresh token on cookie
//send jwt
})

app.post('/auth/logout', (req, res) => {
//add tokens to ban list
})

app.post('/auth/refresh', (req, res) => {
//get refresh token
//jwt sign
//send jwt
})

app.listen(process.env.EXPRESS_PORT || 3200, () => {
    console.log("server started on http://localhost:" + process.env.EXPRESS_PORT || 3200)
})