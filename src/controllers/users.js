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

export const listUsers = async (req, res, next) => {
    const { role, page } = req.query
    const currentPage = page > 0 ? page - 1 : 0
    const roleFilter = ["admin", "user"].includes(role) ? { role: role } : {}
    const pages = await totalPages()
    User.find(roleFilter)
        .skip(currentPage * ELEMENTS_PER_PAGE)
        .limit(ELEMENTS_PER_PAGE)
        .then(response => {

            logger.info(`${req.userinfo.email} get list users page:${currentPage} roles:${JSON.stringify(roleFilter)}`)
            res.json({
                success: true,
                message: "list users",
                data: response,
                totalPages: pages,
                currentPage: currentPage + 1
            })
        }).catch(err => next(err))
}

export const deleteUser = (req, res, next) => {
    const { id } = req.params
    User.deleteOne({ _id: id })
        .then(data => res.json({ success: true, message: `user ${id} deleted`, data }))
        .catch(err => next(err))
}

export const findUser = (req, res, next) => {
    const { id } = req.params
    User.findById(id).then(data => {
        res.json({ success: true, message: `user ${id}`, data })
    }).catch(err => next(err))
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
        const data = await User.updateOne({ _id: id }, { password: newPass })
        // const n = await user.save({ isNew: false })
        res.json({ success: true, message: `user ${id} password updated`, data })
    } catch (err) {
        next(err)
    }
}

export const UpdateUser = (req, res) => {

}
