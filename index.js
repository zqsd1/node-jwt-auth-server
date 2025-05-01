import express from "express"
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"

//TEST
// #FIXME do real db
const users = [
    {
        username: "a",
        password: "a",
        mail: "a@example.com",
    },
    {
        username: "b",
        password: "b",
        mail: "b@example.com",
    },
    {
        username: "c",
        password: "c",
        mail: "c@example.com",
    }
]

const disabledAuth = [

]
const app = express()
app.use(cookieParser())
app.use(express.json())

app.post('/auth/login', (req, res) => {
    const { username, password, mail } = req.body
    if (!(username && password && mail)) return res.sendStatus(401)

    const user = users.filter((u) =>
        u.username === username &&
        u.password === password &&
        u.mail === mail)[0]
    if (!user) return res.sendStatus(401)

    const authToken = jwt.sign(
        { username, mail },
        process.env.AUTH_TOKEN_KEY,
        {
            expiresIn: '15m'
        }
    )
    const refreshToken = jwt.sign(
        { username, mail },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: '1d'
        }
    )

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 //1day
    })

    res.json(authToken)

})

app.post('/auth/logout', (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401)
    disabledAuth.push(refreshToken)

    res.sendStatus(200)
})

app.post('/auth/refresh', (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401)
    if (disabledAuth.includes(refreshToken)) return res.sendStatus(401)
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decode) => {
        if (err) return res.sendStatus(401)
        const { username, mail } = decode
        const user = users.filter((u) =>
            u.mail === mail &&
            u.username == username)[0]
        if (!user) return res.statusCode(401)
        const authToken = jwt.sign(
            { username, mail },
            process.env.AUTH_TOKEN_KEY,
            {
                expiresIn: '15m'
            }
        )
        return res.json(authToken)

    })

    console.log(decoded)
})

app.listen(process.env.EXPRESS_PORT || 3200, () => {
    console.log("server started on http://localhost:" + process.env.EXPRESS_PORT || 3200)
})