import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        from : 
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "User"
        },
        to : 
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "User"
        },
        action : 
        {
            type : String,
            default  : ["follow","like","comment"]
        },
        read :
        {
            type : Boolean,
            default : false
        }
    },
    {timestamps : true}
)

const notificationModel = mongoose.model("Notification",notificationSchema)

export default notificationModel