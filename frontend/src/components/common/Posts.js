import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import baseURL from "../../constant/url";
import { useEffect } from "react";
// import { useEffect } from "react";

const Posts = ({feedType,userName,userID}) => {
	// const isLoading = false;

	const getEndPoint = ()=>
	{
		switch(feedType){
			case "forYou":
				return `${baseURL}/api/post/viewallposts`
			case "following":
				return `${baseURL}/api/post/followingusersposts`
			case "userposts":
				return `${baseURL}/api/post/usersposts/${userName}`
			case "userlikedposts":
				return `${baseURL}/api/post/userlikedposts/${userID}`
			default:
				return `${baseURL}/api/post/viewallposts`
		}
	}

	const finalEndPoint = getEndPoint()
	console.log(finalEndPoint)

	const {data:posts , isLoading , refetch,isRefetching}  = useQuery({
		queryKey : ["posts"],
		queryFn  : async()=>
		{
			try {
				const res = await fetch(finalEndPoint,
					{
						method : "GET",
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
		retry  : false
	})

	useEffect( () =>
	{
		refetch()
	},[feedType,refetch,userName,userID])

	return (
		<>
			{ (isLoading || isRefetching)  && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts to show</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;