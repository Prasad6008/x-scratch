import express from "express";
import { getME, login, logout, signUp } from "../Controllers/authController.js";
import protectRoute from "../Middlewares/protectRoute.js";

const router = express.Router()

router
    .post('/signup',signUp)
    .post('/login',login)
    .post('/logout',logout)
    .get('/me',protectRoute,getME)


export default router