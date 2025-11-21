import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseURL from "../../constant/url";
import toast from "react-hot-toast";

const CreatePost = () => {
	const [caption, setCaption] = useState("");
	const [postImg, setpostImg] = useState(null);

	const imgRef = useRef(null);

	const queryClient = useQueryClient()

	const authUser = queryClient.getQueryData(["authUser"])

	// const isPending = false;
	// const isError = false;

	const {mutate : createPost , isPending, isError ,error} = useMutation(
		{
			mutationFn : async({postImg,caption})=>
			{
				try {
                    const res = await fetch(`${baseURL}/api/post/create`,
                        {
                            method : "POST",
                            credentials : "include",
							headers : 
                            {
                                "Content-Type":"application/json"
                            },
							body : JSON.stringify({postImg,caption})
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
				toast.success("Post Created")
				setCaption("")
				setpostImg(null)
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

	

	const data = {
		profileImg: authUser?.profileImg,
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// alert("Post created successfully");
		createPost({postImg,caption})
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setpostImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={data.profileImg || "/avatar-placeholder.png"} alt=""/>
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
					placeholder='What is happening?!'
					value={caption}
					onChange={(e) => setCaption(e.target.value)}
				/>
				{postImg && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setpostImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={postImg} className='w-full mx-auto h-72 object-contain rounded'alt="" />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file' hidden ref={imgRef} onChange={handleImgChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;