import { User } from "../models/auth.js"

export const listUsers = (req, res) => {

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


export const UpdateUser = (req, res) => {

}
