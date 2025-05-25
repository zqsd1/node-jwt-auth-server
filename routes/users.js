import express from "express"
import { deleteUser, findUser, listUsers, UpdateUser } from "../controllers/users.js"
import { authenticate, AdminCheck } from "../middlewares/auth.js"
import { unregister } from "../controllers/auth.js"
export const router = express.Router()

router.use(authenticate)

//show me => les info sont dans le token JWT ? donc pas besoin ?
router.get('/me', findUser)

//change password => need old password ?
router.put('/me', UpdateUser)

//suicide ?
router.delete('/me', unregister)

// ONLY FOR ADMIN
router.use(AdminCheck)

//list all users
router.get('/', listUsers)

//show user 
router.get('/:id', findUser)

//update user
router.put('/:id', UpdateUser)

router.delete('/:id',deleteUser)

//delete user == unregister

//add user == register