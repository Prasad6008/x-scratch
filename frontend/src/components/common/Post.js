import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseURL from "../../constant/url";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date/dateformatter";

const Post = ({ post }) => {
	const queryClient = useQueryClient()
	const authUser = queryClient.getQueryData(["authUser"])
	const [comment, setComment] = useState("");
	const postOwner = post.postOwner;

	const isLiked = post.likes.includes(authUser._id)
	
	const isMyPost = post?.postOwner?._id === authUser._id

	// console.log("Comments of post",post?.comments.includes(authUser?._id))

	// const isMyComment = post?.comments.some((c) => c?.commentedUser?._id?.toString() === authUser?._id?.toString() )

	// const isMyComment = post?.comments

	// console.log(isMyComment)

	const {mutate : like_the_post , isPending : isLiking} = useMutation(
		{
			mutationFn : async()=>
			{
				try {
                    const res = await fetch(`${baseURL}/api/post/likeunlike/${post._id}`,
                        {
                            method : "POST",
                            credentials : "include",
							headers : 
                            {
                                "Content-Type":"application/json"
                            }
                        }
                    )
                    const data = await res.json()
                    if(!res.ok){
                        throw new Error(data.error || "Something went wrong")
                    }
                    return data
                } catch (error) {
                    throw error
                }
			},
			onSuccess : (updatedLikes)=>
			{
				// if(isLiked){
				// 	toast.success("Post Liked")
				// }else{
				// 	toast.success("Post Lik")
				// }
				queryClient.setQueryData( ["posts"],(oldData) =>
				{
					return oldData.map( (p) =>
					{
						if( p._id === post._id) {
							return {...p , likes : updatedLikes}
						}
						return p
					}
					)
				})
			},
			onError : (error)=>
			{
				toast.error(error)
			}
		}
	)

	const {mutate : deletePost, isPending : isDeletingPost} = useMutation(
		{
			mutationFn : async()=>
			{
				try {
                    const res = await fetch(`${baseURL}/api/post/${post._id}`,
                        {
                            method : "DELETE",
                            credentials : "include",
							headers : 
                            {
                                "Content-Type":"application/json"
                            }
                        }
                    )
                    const data = await res.json()
                    if(!res.ok){
                        throw new Error(data.error || "Something went wrong")
                    }
                    return data
                } catch (error) {
                    throw error
                }
			},
			onSuccess : ()=>
			{
				toast.success("Post Deleted")
				queryClient.invalidateQueries(
					{
						queryKey : ['posts']
					}
				)
			},
			onError : (error)=>
			{
				toast.error(error)
			}
		}
	)


	const formattedDate = formatPostDate(post?.createdAt)

	const formattedCommentedData = formatPostDate(post?.comments?.createdAt)

	// const isCommenting = false;

	const {mutate : commentPost , isPending : isCommenting} = useMutation(
		{
			mutationFn : async()=>
			{
				try {
                    const res = await fetch(`${baseURL}/api/post/comment/${post._id}`,
                        {
                            method : "POST",
                            credentials : "include",
							headers : 
                            {
                                "Content-Type":"application/json"
                            },
							body : JSON.stringify({comment :comment})
                        }
                    )
                    const data = await res.json()
                    if(!res.ok){
                        throw new Error(data.error || "Something went wrong")
                    }
                    return data
                } catch (error) {
                    throw error
                }
			},
			onSuccess : ()=>
			{
				toast.success("Comented Successfully")
				setComment("")
				queryClient.invalidateQueries(
					{
						queryKey : ['posts']
					}
				)
			}
		}
	)

	const {mutate : deleteMyComment , isPending : isCommentDeleting} = useMutation(
		{
			mutationFn : async({postId,commentId})=>
			{
				try {
                    const res = await fetch(`${baseURL}/api/post/delcomment/${postId}/${commentId}`,
                        {
                            method : "DELETE",
                            credentials : "include",
							headers : 
                            {
                                "Content-Type":"application/json"
                            },
                        }
                    )
                    const data = await res.json()
                    if(!res.ok){
                        throw new Error(data.error || "Something went wrong")
                    }
                    return data
                } catch (error) {
                    throw error
                }
			},
			onSuccess : ()=>
			{
				toast.success("Comented Deleted")
				setComment("")
				queryClient.invalidateQueries(
					{
						queryKey : ['posts']
					}
				)
			}
		}
	)






	const handleDeletePost = () => {
		deletePost()
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if(isCommenting) return;
		commentPost()
	};

	const handleDeleteComment = ({postId,commentId}) =>
	{
		deleteMyComment( {postId,commentId})
	}


	const handleLikePost = () => {
		like_the_post()
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.userName}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"}  alt=""/>
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.userName}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.userName}`}>@{postOwner?.userName}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeletingPost && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
								{isDeletingPost && <LoadingSpinner/>}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.caption}</span>
						{post.postImg && (
							<img
								src={post.postImg}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => {
												const isCommentOwner =
													comment?.commentedUser?._id?.toString() === authUser?._id?.toString();

												return (
													<div key={comment._id} className='flex gap-2 items-start'>
														<div className='avatar'>
															<div className='w-8 rounded-full'>
																<img
																	src={comment.commentedUser.profileImg || "/avatar-placeholder.png"}
																	alt=""
																/>
															</div>
														</div>

														<div className='flex flex-col'>
															<div className='flex items-center gap-1'>
																<span className='font-bold'>
																	{isCommentOwner ? "You" : comment.commentedUser.fullName}
																</span>

																<span className='text-gray-700 text-sm'>
																	@{comment.commentedUser.userName}
																</span>

																<span>{formattedCommentedData}</span>
															</div>

															<div className='text-sm'>{comment.comment}</div>
														</div>

														<div className="ml-auto text-gray-400 ">
															    {isCommentDeleting && isCommentOwner && <LoadingSpinner />}
  
																{!isCommentDeleting && isCommentOwner && (
																	<FaTrash
																		className=" cursor-pointer"
																		onClick={() => handleDeleteComment({
																			postId : post._id, 
																			commentId :comment._id
																		})}
																	/>
																)}
														</div>
													</div>
												);
											})}

									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							{/* <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
					  			{isLiking && (
									<LoadingSpinner size="sm"/>
								)}

								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}

								{isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm  group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
									}`}
								>
									{post.likes.length}
								</span>
							</div> */}
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size="sm"/>}
								{!isLiked && !isLiking &&(
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked &&  !isLiking &&(
									<FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
								)}

								<span
									className={`text-sm group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
									}`}
								>
									{post?.likes.length}
								</span>
							</div>
						</div>

						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;