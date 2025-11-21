import express from 'express'
import { commentPost, createpost, deleteComment, deletePost, editPost, followingUsersPosts, getUsersPosts, likeUnlike, userLikedPosts, viewPosts } from '../Controllers/postController.js'
import protectRoute from '../Middlewares/protectRoute.js'

const router = express.Router()

router
    .post('/create',protectRoute,createpost)
    .get('/viewallposts',protectRoute,viewPosts)
    .put('/edit/:id',protectRoute,editPost)
    .delete('/:id',protectRoute,deletePost)
    .post('/likeunlike/:id',protectRoute,likeUnlike)
    .post('/comment/:id',protectRoute,commentPost)
    .delete('/delcomment/:postId/:commentId',protectRoute,deleteComment)
    .get('/followingusersposts',protectRoute,followingUsersPosts)
    .get('/usersposts/:userName',protectRoute,getUsersPosts)
    .get('/userlikedposts/:id',protectRoute,userLikedPosts)

export default router