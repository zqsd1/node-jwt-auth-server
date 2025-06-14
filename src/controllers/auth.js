import jwt from 'jsonwebtoken'
import { User } from '../models/auth.js'
import bcrypt from "bcrypt";
import { redisClient } from '../db/redis.js'
import { HttpError } from '../httpError.js';
import { logger } from '../winston.js';
const saltRounds = 10
const refreshTokenDuration = process.env.REFRESH_TOKEN_DURATION || '1d'
const authTokenDuration = process.env.AUTH_TOKEN_DURATION || "15m"


export const login = async (req, res, next) => {
    const { password, mail } = req.body
    if (!(password && mail)) next(new HttpError(401, '')) //return res.sendStatus(401) //missing something
    const user = await User.findOne({ mail })
    if (!user) next(new HttpError('404', "")) //return res.sendStatus(404) //user not found

    const result = await bcrypt.compare(password, user.password)
    if (!result) next(new HttpError(403, ''))//return res.sendStatus(403)//password not match
    const authToken = jwt.sign(
        { role: user.role, email: user.mail, sub: user._id },
        process.env.AUTH_TOKEN_KEY,
        { expiresIn: authTokenDuration }
    )
    const refreshToken = jwt.sign(
        { sub: user._id },
        process.env.REFRESH_TOKEN_KEY,
        { expiresIn: refreshTokenDuration }
    )

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 //1 day
    })

    logger.info(`${mail} success login`)

    return res.json(authToken)
}

export const refresh = async (req, res, next) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) next(new HttpError(401, ''))//return res.sendStatus(401) //no token given

    const isTokenBanned = await redisClient.get(refreshToken)

    if (isTokenBanned) throw (new HttpError(401, ''))//return res.sendStatus(401)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, decode) => {
        if (err) throw (new HttpError(401, '')) //return res.sendStatus(401)//token expired ?
        const { sub } = decode

        const user = await User.findById(sub)
        if (!user) next(new HttpError(404, 'user dont exist anymore'))// return res.status(404).json("user dont exist anymore")
        const authToken = jwt.sign(
            { role: user.role, sub: user._id, email: user.mail },
            process.env.AUTH_TOKEN_KEY,
            { expiresIn: authTokenDuration })

        logger.info(`${user.mail} refresh session`)
        return res.json(authToken)
    })
}

export const logout = (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) throw (new HttpError(401, ''))// return res.sendStatus(401)
    redisClient.set(refreshToken, 1, { EX: 60 * 60 * 24 })

    logger.info(`${req.userinfo.email} logout`)
    res.sendStatus(200)
}

export const register = async (req, res) => {
    if (!req.body) return res.sendStatus(500)// no body found
    const { mail, password, role } = req.body
    if (!mail || !password) throw (new HttpError(400, 'missing info'))//return res.sendStatus(400)//missing data
    // const user = await User.findOne({ mail }) //si unique est mis avant de creer la table y'a pas besoin
    // if (user) return res.status(400).json("user exist")
    const hash = await bcrypt.hash(password, saltRounds)
    const newUser = new User({ mail, password: hash, role })
    const result = await newUser.save()
    return res.json(result)

}

export const unregister = async (req, res) => {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.sendStatus(401)
    // jwt.verify(token, process.env.AUTH_TOKEN_KEY, (err, decoded) => {
    //     if (err) return res.status(400).json(err.message)
    //     const { id } = decoded

    const response = await User.deleteOne({ _id: req.userinfo.sub })
    if (response.deletedCount == 0) throw new Error('aucun user deleted')
    return logout(req, res)

}