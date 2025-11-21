import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        postOwner:
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "User"
        },
        postImg :
        {
            type : String,
            default  : ""
        },
        caption : 
        {
            type : String,
            default : ""
        },
        comments : 
        [
            {
                commentedUser:
                {
                    type : mongoose.Schema.Types.ObjectId,  //existing
                    ref  : "User",
                },
                comment :
                {
                    type : String,   //new id
                    default : ""
                }
                
            },
            {timestamps:true}
        ],
        likes :
        [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "User",
            }
        ]
    },
    {timestamps:true}
)

const postModel = mongoose.model("Post",postSchema)

export default postModel