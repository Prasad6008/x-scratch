import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        userName : {type:String,required:true,unique:true},
        fullName : {type:String,required:true},
        email    : {type:String,required:true,unique:true},
        password : {type:String,required:true,minLength : 6},
        followers:
        [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "User",
                default : []
            }
        ],
        following:
        [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "User",
                default : []
            }
        ],
        profileImg :
        {
            type : String ,
            default : ""
        },
        coverImg :
        {
            type : String ,
            default : ""
        },
        bio :
        {
            type : String ,
            default : ""
        },
        links :
        {
            type : String ,
            default : ""
        }
    },
    {timestamps : true}
)

const userModel = mongoose.model("User",userSchema)

export default userModel