import jwt from 'jsonwebtoken'
import { User } from '../models/auth.js'
import bcrypt from "bcrypt";
import { redisClient } from '../db/redis.js'

const saltRounds = 10;

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

    return redisClient.get(refreshToken)
        .then((isTokenBanned) => {
            if (isTokenBanned) return res.sendStatus(401)

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
        })
        .catch(err => console.log(err))
}

export const logout = (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.sendStatus(401)
    redisClient.set(refreshToken, 1, { EX: 60 * 60 * 24 })

    res.sendStatus(200)
}

export const register = async (req, res) => {
    if (!req.body) return res.sendStatus(500)// no body found
    const { mail, password, role } = req.body
    if (!mail || !password) return res.sendStatus(400)//missing data
    // const user = await User.findOne({ mail }) //si unique est mis avant de creer la table y'a pas besoin
    // if (user) return res.status(400).json("user exist")
    bcrypt.hash(password, saltRounds)
        .then(hash => {
            const newUser = new User({ mail, password: hash, role })
            return newUser.save()
        }).then(response => {
            return res.json(response)
        }).catch(err => {
            console.error(err.message)
            return res.status(500).json(err.message)//something fail
        })
}



export const unregister = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.AUTH_TOKEN_KEY, (err, decoded) => {
        if (err) return res.status(400).json(err.message)
        const { _id } = decoded
        User.deleteOne({ _id }).then(response => {
            ////////logout
            const { refreshToken } = req.cookies
            if (refreshToken) {
                redisClient.set(refreshToken, 1, { EX: 60 * 60 * 24 })
            }
            //////////
            return res.json(response)
        }).catch(err => {
            return res.status(500).json(err.message)//something fail
        })
    })
}