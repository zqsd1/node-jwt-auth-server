import jwt from 'jsonwebtoken'
import { User } from '../models/auth.js'
import bcrypt from "bcrypt";
const saltRounds = 10;

const disabledAuth = []
export const login = async (req, res) => {
    const { username, password, mail } = req.body
    if (!(username && password && mail)) return res.sendStatus(401)


    User.findOne({ mail })
        .then(response => {
            if (!response) return res.sendStatus(404)
            bcrypt.compare(password, response.password).then(result => {
                if (!result) return res.sendStatus(403)
                const authToken = jwt.sign(
                    { role: response.role, mail: response.mail, id: response._id },
                    process.env.AUTH_TOKEN_KEY,
                    { expiresIn: '15m' }
                )
                const refreshToken = jwt.sign(
                    { role: response.role, mail: response.mail, id: response._id },
                    process.env.REFRESH_TOKEN_KEY,
                    { expiresIn: '1d' }
                )

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 //1day
                })

                return res.json(authToken)

            }).catch(err => {
                return res.sendStatus(500)
            })
        })
        .catch(err => console.error(err))

}

export const refresh = (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401)
    if (disabledAuth.includes(refreshToken)) return res.sendStatus(401)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decode) => {
        if (err) return res.sendStatus(401)
        const { role, id, mail } = decode
        // TODO check user ?

        const authToken = jwt.sign(
            { role, id, mail },
            process.env.AUTH_TOKEN_KEY,
            {
                expiresIn: '15m'
            }
        )
        return res.json(authToken)
    })
}

export const logout = (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401)
    disabledAuth.push(refreshToken)

    res.sendStatus(200)
}

export const register = async (req, res) => {
    if (!req.body) return res.sendStatus(500)
    const { mail, password } = req.body
    if (!mail || !password) return res.sendStatus(400)
    const user = await User.findOne({ mail })
    if (user) return res.status(400).json("user exist")
    bcrypt.hash(password, saltRounds)
        .then(hash => {
            const newUser = new User({ mail, password: hash })
            return newUser.save()
        }).then(response => {
            res.status(200)
            res.json(response)
        }).catch(err => {
            console.error(err.message)
            res.status(500)
            return res.json(err.message)
        })

}