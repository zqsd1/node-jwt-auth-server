import jwt from "jsonwebtoken"

export const AdminCheck = (req, res, next) => {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.sendStatus(401)
    // jwt.verify(token, process.env.AUTH_TOKEN_KEY, (err, decoded) => {
    //     if (err) return res.status(400).json(err.message)
    //     if (decoded.role !== "admin") return res.status(403)
    //     req.userinfo = decoded
    //     next()
    // })

    const { role } = req.userinfo
    if (role !== "admin") return res.status(403)
    //compare user id to req.params.id
    //diff=> role admin = ok, user= no => change id ? bad request ?
    next()
}


export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.AUTH_TOKEN_KEY, (err, decoded) => {
        if (err) return res.status(400).json(err.message)
        req.userinfo = decoded
        next()
    })

}