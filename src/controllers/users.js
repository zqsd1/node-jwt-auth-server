import { User } from "../models/auth.js"
import bcrypt from "bcrypt";
import { logger } from "../winston.js";
const saltRounds = 10;

export const listUsers = (req, res) => {
    console.log("list")
    User.find()
        .then(response => {
            res.json(response)
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

export const updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) return res.status(404).json("no user found")
        const pass = await bcrypt.compare(password, user.password)
        logger.log('info', pass)
        if (!pass) return res.sendStatus(403)
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
