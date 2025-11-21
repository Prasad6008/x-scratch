import notificationModel from "../Models/notificationModel.js"
import postModel from "../Models/postModel.js"
import userModel from "../Models/userModel.js"
import {v2 as cloudinary} from 'cloudinary'


export const createpost = async(req,res) =>
{
    try {

        let {postImg,caption} = req.body

        if(caption.length === 0){
            return res.status(404).json({Error:"Caption cannot be empty"})
        }

        if(postImg){
            let uploadedResponse = await cloudinary.uploader.upload(postImg)
            postImg = uploadedResponse.secure_url
        }

        console.log("Uploaded Image:",postImg)

        const newPost = new postModel({
            postOwner : req.user._id,
            postImg,
            caption,
        })

        if(newPost){
            await newPost.save()
            return res.status(200).json("Post Uploaded ✅")
        }

    } catch (error) {
        console.log({Error_in_Create_Post:error.message})
        return res.status(500).json("Internal server error in createpost")
    }
}

export const viewPosts = async(req,res) =>
{
    try {
        const posts = await postModel.find().sort({createdAt : -1})
        .populate(
        [
            {
                path : "postOwner",
                select : ["-email","-password"]
            },
            {
                path : "comments.commentedUser",
                select :[ "-email","-password"]
            }
        ])

        if(posts.length === 0){
            return res.status(404).json("No posts available")
        }

        return res.status(200).json(posts)

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in viewPosts")
    }
}

export const editPost = async(req,res) =>
{
    try {

        const {caption} = req.body

        const post = await postModel.findById(req.params.id)

        if(!post){
            return res.status(404).json({Error:"No such a post is found !"})
        }

        const currentUser = await userModel.findById(req.user._id)

        if(post.postOwner.toString() !== currentUser._id.toString()){
            return res.status(401).json("Unauthorized : You can't edit this post")
        }
                                                                                                                    ///Return updated doc 
        await postModel.findByIdAndUpdate( {_id : req.params.id} , {$set : {caption : caption}, },{new : true})

        return res.status(200).json("Post Updated 📝")

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in editPost")
    }
}


export const deletePost = async(req,res) =>
{
    try {
        const post = await postModel.findById(req.params.id)

        if(post.postOwner.toString() !== req.user._id.toString()){
            return res.status(401).json({Error:"Unauthorized : You can't delete this post"})
        }else
        {
            await postModel.deleteOne({_id : req.params.id})
        }

        return res.status(200.).json("Post Deleted successfully...✔")

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in deletePost")
    }
}

export const likeUnlike = async(req,res) =>
{
    try {
        const post = await postModel.findById(req.params.id)

        if(!post){
            return res.status(404).json({Error:"No such a post is found !"})
        }

        const isLiked = post.likes.includes(req.user._id)

        if(!isLiked){
            //Like panna vekkanum
            // await postModel.findByIdAndUpdate({_id : req.params.id},{$push : {likes : req.user._id}})
            post.likes.push(req.user._id)
            post.save()

            const likeNotification = new notificationModel(
                {
                    from : req.user._id,
                    to   : post.postOwner,
                    action : "like"
                }
            )

            await likeNotification.save()

            const updatedLikes = post.likes
            return res.status(200).json(updatedLikes)
        }else 
        {
            //Unlike panna vekkanum
            post.likes.pull(req.user._id)
            post.save()
            //await postModel.findByIdAndUpdate({_id : req.params.id},{$pull : {likes : req.user._id}})

            const updatedLikes = post.likes.filter( id => id.toString() !== req.user._id.toString())
            return res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log({Error_in_likeUnLike:error.message})
        return res.status(500).json("Internal server error in likeUnLike")
    }
}

export const commentPost = async(req,res) =>
{
    try {

        const post = await postModel.findById(req.params.id)

        if(!post){
            return res.status(404).json({Error:"No such a post is found !"})
        }

        const {comment} = req.body

        if(comment.length === 0){
            return res.status(404).json({Error:"Comment should not be empty"})
        }else{

            const newComment = 
            {
                commentedUser : req.user._id,
                comment
            }

            post.comments.push(newComment)

            await post.save()

            const newCommentNotification = new notificationModel(
                {
                    from : req.user._id,
                    to   : post.postOwner,
                    action : "comment"
                }
            )

            await newCommentNotification.save()

            return res.status(200).json("Commented Successfully..✔")
        }

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in commentPost")
    }
}


export const deleteComment = async(req,res) =>
{
    try {
        const {postId,commentId} = req.params

        const post = await postModel.findById(req.params.postId)

        if(!post){
            return res.status(404).json({Error:"No Post found"})
        }

        const comment = post.comments.find( c => c._id.toString() === req.params.commentId.toString())

        if(!comment){
            return res.status(404).json({Error:"No comment found"})
        }

        await postModel.findByIdAndUpdate(
            {_id : postId},
            {$pull : {comments : {_id : commentId}}}
        )

        return res.status(200).json("Comment deleted successfully...✔")
    } catch (error) { 
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in deleteComment")
    }
}

export const followingUsersPosts = async(req,res) =>
{
    try {
        const currentUser = await userModel.findById(req.user._id)

        const posts = await postModel.find({postOwner : {$in : currentUser.following}}).sort({createdAt : -1})
        .populate(
        [
            {
                path : "postOwner",
                select : ["-email","-password"]
            },
            {
                path : "likes",
                select : [ "-email","-password"]
            },
            {
                path : "comments.commentedUser",
                select :[ "-email","-password"]
            }
        ])

        // if(posts.length === 0){
        //     return res.status(404).json("Please follow someone to view following posts")
        // }

        return res.status(200).json(posts)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in followingUsersPosts")
    }
}

export const getUsersPosts = async(req,res)=>
{
    try {
        const {userName} = req.params

        const user = await userModel.findOne({userName})

        if(!user){
            return res.status(404).json({Error:"No such a user is found"})
        }

        const posts = await postModel.find({postOwner : user._id}).sort({createdAt:-1})
        .populate(
        [    {
                path : "postOwner",
                select : ["-email","-password"]
            },
            {
                path : "likes",
                select :["-email","-password"]
            },
            {
                path : "comments.commentedUser",
                select :["-email","-password"]
            }
        ])

        // if(posts.length === 0){
        //     return res.status(404).json("The user is not posted anything")
        // }

        return res.status(200).json(posts)

        // return res.json(posts)

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in getUsersPosts")
    }
}


export const userLikedPosts = async(req,res) =>
{
    try {
        const currentUser = await userModel.findById(req.user._id)

        if(!currentUser){
            return res.status(404).json({Error:"Login First"})
        }

        const {id} = req.params

        const userLikedPosts = await postModel.find({likes : {$in : id}})
        .populate(
            [
                {
                    path : "postOwner",
                    select : ["-email","-password"]
                }
            ]
        )

        // if(meLikedPosts.length === 0){
        //     return res.status(404).json("You don't liked any post")
        // }

        return res.status(200).json(userLikedPosts)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Internal server error in meLikedPosts")
    }
}