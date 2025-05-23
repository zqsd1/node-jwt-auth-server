import express from "express"
import { deleteUser, findUser, listUsers, UpdateUser } from "../controllers/users.js"
import { authenticate, roleCheck } from "../middlewares/auth.js"
import { unregister } from "../controllers/auth.js"
export const router = express.Router()

router.use(authenticate)

//show me
router.get('/me', findUser)

//change password
router.put('/me', UpdateUser)

//suicide ?
router.delete('/me', unregister)

// ONLY FOR ADMIN
router.use(roleCheck)

//list all users
router.get('/', listUsers)

//show user 
router.get('/:id', findUser)

//update user
router.put('/:id', UpdateUser)

router.delete('/:id',deleteUSer)

//delete user == unregister

//add user == register