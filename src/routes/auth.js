import express from "express"
import { login, logout, refresh, register, unregister } from "../controllers/auth.js"
import { authenticate } from "../middlewares/auth.js"

export const router = express.Router()

router.post('/login', login)

router.post('/register', register)

router.post('/refresh', refresh)

router.use(authenticate)

router.post('/logout', logout)

router.delete('/unregister', unregister)