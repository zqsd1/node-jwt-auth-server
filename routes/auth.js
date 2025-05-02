import express from "express"
import { login, logout, refresh, register } from "../controllers/auth.js"
export const router = express.Router()

router.post('/login', login)

router.post('/logout', logout)

router.post('/refresh', refresh)

router.post('/register', register)