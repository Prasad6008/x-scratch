import e from "express";
import protectRoute from "../Middlewares/protectRoute.js";
import { deleteAllNotifications, deletenotification, myNotificatons } from "../Controllers/notificationController.js";

const router = e.Router()


router
    .get("/mynotis",protectRoute,myNotificatons)
    .delete("/deleteone/:id",protectRoute,deletenotification)
    .delete("/deleteallnotis",protectRoute,deleteAllNotifications)

export  default router