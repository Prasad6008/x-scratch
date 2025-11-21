import express from 'express'
import { followUnFollow, getUserProfile, suggestions, updateProfile } from '../Controllers/userController.js'
import protectRoute from '../Middlewares/protectRoute.js'

const router = express.Router()

router
    .get('/profile/:userName',protectRoute,getUserProfile)
    .get('/suggestions',protectRoute,suggestions)
    .post('/followunfollow/:id',protectRoute,followUnFollow)
    .post('/updateprofile',protectRoute,updateProfile)

export default router