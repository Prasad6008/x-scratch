import notificationModel from "../Models/notificationModel.js"

export const myNotificatons = async(req,res) =>
{
    try {

        const notifications = await notificationModel.find({to : req.user._id})

        // if(notifications.length === 0){
        //     return res.status(404).json("No notifications")
        // }

        await notificationModel.updateMany({to:req.user._id},{read : true})

        const updated_notifications = await notificationModel.find({to : req.user._id}).sort({createdAt: -1})
        .populate( 
            {
                path : "from",
                select :["-email","-password"]
            }
        )
        .populate(
            {
                path : "to",
                select :["-email","-password"]
            }
        )

        return res.status(200).json(updated_notifications)

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in myNotifications")
    }
}


export const deletenotification = async(req,res) =>
{
    try {
        const {id} = req.params

        const notification = await notificationModel.findById(id)

        if(!notification){
            return res.status(200).json({Error:"No such a notification found"})
        }

        if(notification.to.toString() !== req.user._id.toString()){
            return res.status(401).json({Error:"Unauthorized : You can't delete this notification"})
        }

        await notification.deleteOne({to : req.user._id})

        return res.status(200).json("Notification Deleted...✔")
    } catch (error) {
        console.log({Error_in_Delte_One_Notification:error.message})
        return res.status(500).json("Internal server error in deleteNotification")
    }
}

export const deleteAllNotifications = async(req,res) =>
{
    try {

        const notifications = await notificationModel.find({to : req.user._id})

        if(notifications.length === 0){
            return res.status(404).json("No notifications")
        }

        await notificationModel.deleteMany({to : req.user._id})

        return res.status(200).json("All notifications deleted")
        
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in deleteAllNotification")
    }
}