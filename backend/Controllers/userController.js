import notificationModel from "../Models/notificationModel.js"
import userModel from "../Models/userModel.js"
import {v2 as cloudinary} from 'cloudinary'
import bcrypt, { genSalt } from 'bcryptjs'

export const getUserProfile = async(req,res) =>
{
    try {
        const {userName} = req.params

        const currentUser = await userModel.findById(req.user._id)

        const searchedUser = await userModel.findOne({userName})
        // .populate(
        // [
        //     {
        //         path : "following",
        //         select : ["-email"]
        //     },
        //     {
        //         path : "followers",
        //         select : "userName"
        //     }
        // ])
        // .select("-password")

        if(!searchedUser){
            return res.status(404).json({Error:"User doesn't exixts"})
        }

        // if(searchedUser.userName === currentUser.userName){
        //     return res.status(404).json("No user found")
        // }

        return res.status(200).json(searchedUser)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in getProfile")
    }
}

export const suggestions = async(req,res) =>
{
    try {
        const currentUser = await userModel.findById(req.user._id)
        const users = await userModel.aggregate(
            [
                {
                    $match :
                    {
                        _id : {$ne :currentUser._id}
                    }
                },
                {
                    $sample :
                    {
                        size : 10
                    }
                }
            ]
        )


        const notFollowing = users.filter( u => !currentUser.following.includes(u._id))

        const suggestedUsers = notFollowing.slice(0,3)

        suggestedUsers.forEach( u => u.password = null)

        return res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in suggestion")
    }
}


export const followUnFollow = async(req,res) =>
{
    try {
        const currentUser = await userModel.findById(req.user._id)

        const {id} = req.params

        const user = await userModel.findById(id)

        if(!user){
            return res.status(404).json({error:"User not found"})
        }

        const isFollowing = user.followers.includes(currentUser._id)

        if(isFollowing){
            //Unfollow panna vekkanum
            await userModel.findByIdAndUpdate({_id : user._id} , {$pull :{followers : currentUser._id}})
            await userModel.findByIdAndUpdate({_id : currentUser._id} , {$pull : {following : user._id}})
            return res.status(200).json({ message: `You are UnFollowed ${user.userName}` })
        }else{
            //Follow panna vekkanum
            await userModel.findByIdAndUpdate({_id : user._id},{$push : {followers : currentUser._id}})
            await userModel.findByIdAndUpdate({_id : currentUser._id} , {$push : {following : user._id}})

            const newFollowerNotificatoin = new notificationModel(
                {
                    from : req.user._id,
                    to   : id,
                    action : "follow"
                }
            )

            await newFollowerNotificatoin.save()

            return res.status(200).json({ message: `You are following ${user.userName}` })
        }

    } catch (error) {
        console.log({Error_followUnFollow:error.message})
        return res.status(500).json("Internal server error in followUnFollow")
    }
}

export const updateProfile = async(req,res) =>
{
    try {
        const currentUserId = req.user._id 

        let currentUser = await userModel.findById(currentUserId)

        let {userName,fullName,currentPassword,newPassword,bio,links} = req.body 

        let {profileImg,coverImg} = req.body

        if(!currentUser){
            return res.status(400).json({error:"User not found"})
        }

        if(!currentPassword && newPassword || currentPassword && !newPassword){
            return res.status(400).json({error:"Please provide both of the fields"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword,currentUser.password)
            if(!isMatch){
                return res.status(400).json({error:"Current Password is incorrect"})
            }

            if(newPassword.length < 6){
                return res.status(400).json({error:"Password must be 6"})
            }

            const salt = await bcrypt.genSalt(10)
            currentUser.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
                if(userModel.profileImg){
                    await cloudinary.uploader.destroy(userModel.profileImg.split('/').pop().split('.')[0])
                }
                const uploadedResponse = await cloudinary.uploader.upload(profileImg)
                profileImg = uploadedResponse.secure_url 
            }
            
            if(coverImg){

                if(userModel.coverImg){
                    await cloudinary.uploader.destroy(userModel.coverImg.split('/').pop().split('.')[0])
                }
                const uploadedResponse = await cloudinary.uploader.upload(coverImg)
                coverImg = uploadedResponse.secure_url 
            }

        currentUser.userName = userName || currentUser.userName
        currentUser.fullName = fullName || currentUser.fullName
        currentUser.bio      = bio      || currentUser.bio 
        currentUser.links    = links     || currentUser.links

        currentUser.profileImg = profileImg || currentUser.profileImg
        currentUser.coverImg   = coverImg   || currentUser.coverImg

        await currentUser.save()

        return res.status(200).json(currentUser)

    } catch (error) {
        console.log({"Error_in_UpdateProfile":error.message})
        res.status(500).json({Error:"Internal sever error from updateProfile"})
    }
}