import jwt from 'jsonwebtoken'
import { User } from '../models/auth.js'
import bcrypt from "bcrypt";
import { redisClient } from '../db/redis.js'
import { HttpError } from '../httpError.js';
import { logger } from '../winston.js';

const saltRounds = process.env.SALT_ROUNDS || 10
const refreshTokenDuration = process.env.REFRESH_TOKEN_DURATION || '1d'
const authTokenDuration = process.env.AUTH_TOKEN_DURATION || "15m"


export const login = async (req, res, next) => {
    try {
        const { password, mail } = req.body
        if (!(password && mail)) throw new HttpError(400, 'Email and password are required')

        const user = await User.findOne({ mail }).select("+password")
        if (!user) throw new HttpError(404, "user not found")

        const result = await bcrypt.compare(password, user.password)
        if (!result) throw new HttpError(403, "invalid credentials")

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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24,//1 day
        })

        logger.info(`${mail} success login`)
        return res.json({ success: true, message: "login successful", data: authToken })
    } catch (err) {
        next(err)
    }

}

export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies
        if (!refreshToken) throw new HttpError(401, 'no refresh token')

        const isTokenBanned = await redisClient.get(refreshToken)
        if (isTokenBanned) throw new HttpError(401, 'refresh token banned')

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, decode) => {
            if (err) throw new HttpError(401, 'refresh token invalid')
            const { sub } = decode

            const user = await User.findById(sub)
            if (!user) throw new HttpError(404, 'user not found')
            const authToken = jwt.sign(
                { role: user.role, sub: user._id, email: user.mail },
                process.env.AUTH_TOKEN_KEY,
                { expiresIn: authTokenDuration })

            logger.info(`${user.mail} refresh session`)
            return res.json({ success: true, message: "refresh successful", data: authToken })
        })
    } catch (error) {
        next(error)
    }

}

export const logout = (req, res, next) => {
    try {
        const { refreshToken } = req.cookies
        if (!refreshToken) throw new HttpError(401, '')

        redisClient.set(refreshToken, 1, { EX: 60 * 60 * 24 })

        logger.info(`${req.userinfo.email} logout`)
        res.sendStatus(200)

    } catch (error) {
        next(error)
    }

}

export const register = async (req, res, next) => {
    try {
        const { mail, password, role } = req.body
        if (!mail || !password) throw new HttpError(400, 'missing info')
        // const user = await User.findOne({ mail }) //si unique est mis avant de creer la table y'a pas besoin
        // if (user) return res.status(400).json("user exist")
        const hash = await bcrypt.hash(password, saltRounds)

        //TODO handle mongoose error E11000 duplicate key error collection: users.users
        const newUser = new User({ mail, password: hash, role })
        const data = await newUser.save()
        //remove password before send
        const { password: pass, ...user } = data._doc
        logger.info("new user created", { user })
        return res.json({
            success: true,
            message: "new user created",
            data: user
        })
    } catch (error) {
        next(error)
    }

}

export const unregister = async (req, res, next) => {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.sendStatus(401)
    // jwt.verify(token, process.env.AUTH_TOKEN_KEY, (err, decoded) => {
    //     if (err) return res.status(400).json(err.message)
    //     const { id } = decoded
    try {
        const response = await User.deleteOne({ _id: req.userinfo.sub })
        if (response.deletedCount == 0) throw new HttpError(404, 'user not found')
        logger.info(`user deleted`, { userId: req.userinfo?.sub })
        return logout(req, res)

    } catch (error) {
        next(error)
    }

}