import { User } from "../models/auth.js"
import bcrypt from "bcrypt";
import { logger } from "../winston.js";
import { HttpError } from "../httpError.js";
import { redisClient } from "../db/redis.js";
const saltRounds = 10;

const ELEMENTS_PER_PAGE = 10

const totalPages = async () => {
    let usersCount = await redisClient.get("usersCount")
    if (!usersCount) {
        usersCount = await User.estimatedDocumentCount()
        await redisClient.set("usersCount", usersCount, { EX: 5 * 60 })
    }
    return Math.ceil(usersCount / ELEMENTS_PER_PAGE)
}

export const listUsers = async (req, res) => {
    const { role, page } = req.query
    const roleFilter = ["admin", "user"].includes(role) ? { role: role } : {}
    const pages = await totalPages()
    User.find(roleFilter)
        .skip((page - 1) * 1)
        .limit(ELEMENTS_PER_PAGE)
        .then(response => {

            res.json({
                data: response,
                totalPages: pages,
                currentPage: Number(page) || 1
            })
        }).catch(err => res.status(500).json(err.message))
}

export const deleteUser = (req, res) => {
    const { id } = req.params
    User.deleteOne({ _id: id })
        .then(response => res.json(response))
        .catch(err => res.status(500).json(err.message))
}

export const findUser = (req, res) => {
    const { id } = req.params
    User.findById(id).then(response => {
        res.json(response)
    }).catch(err => res.status(500).json(err.message))
}

export const updatePassword = async (req, res, next) => {
    try {
        const { password, newPassword } = req.body
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) return next(new HttpError(404, 'no user found')) //res.status(404).json("no user found")

        const pass = await bcrypt.compare(password, user.password)
        if (!pass) return next(new HttpError(403, "password not match"))// return res.sendStatus(403)

        const newPass = await bcrypt.hash(newPassword, saltRounds)
        const u = await User.updateOne({ _id: id }, { password: newPass })
        // const n = await user.save({ isNew: false })
        res.json(u)
    } catch (err) {
        logger.error(err.message)
        res.status(500).json(err.message)
    }
}

export const UpdateUser = (req, res) => {

}
