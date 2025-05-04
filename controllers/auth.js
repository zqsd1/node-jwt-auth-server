import jwt from 'jsonwebtoken'
import { User } from '../models/auth.js'
import bcrypt from "bcrypt";
const saltRounds = 10;

const disabledAuth = []

export const login = async (req, res) => {
    const { password, mail } = req.body
    if (!(password && mail)) return res.sendStatus(401) //missing something
    User.findOne({ mail })
        .then(response => {
            if (!response) return res.sendStatus(404) //user not found
            bcrypt.compare(password, response.password).then(result => {
                if (!result) return res.sendStatus(403)//password not match
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
                    maxAge: 1000 * 60 * 60 * 24 //1 day
                })

                return res.json(authToken)

            }).catch(err => {
                return res.status(500).json(err.message)
            })
        })
        .catch(err => console.error(err))

}

export const refresh = (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401) //no token given
    if (disabledAuth.includes(refreshToken)) return res.sendStatus(401) //token banned

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decode) => {
        if (err) return res.sendStatus(401)//token expired ?
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
    if (!req.body) return res.sendStatus(500)// no body found
    const { mail, password } = req.body
    if (!mail || !password) return res.sendStatus(400)//missing data
    // const user = await User.findOne({ mail }) //si unique est mis avant de creer la table y'a pas besoin
    // if (user) return res.status(400).json("user exist")
    bcrypt.hash(password, saltRounds)
        .then(hash => {
            const newUser = new User({ mail, password: hash })
            return newUser.save()
        }).then(response => {

            return res.json(response)
        }).catch(err => {
            console.error(err.message)
            return res.status(500).json(err.message)//something fail
        })
}