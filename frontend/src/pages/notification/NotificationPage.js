import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaComment, FaTrash, FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import baseURL from "../../constant/url";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { formatNotiDate} from "../../utils/date/dateformatter";

const NotificationPage = () => {

	const queryClient = useQueryClient()

	// const isLoading = false;
	// const notifications = [
	// 	{
	// 		_id: "1",
	// 		from: {
	// 			_id: "1",
	// 			username: "johndoe",
	// 			profileImg: "/avatars/boy2.png",
	// 		},
	// 		type: "follow",
	// 	},
	// 	{
	// 		_id: "2",
	// 		from: {
	// 			_id: "2",
	// 			username: "janedoe",
	// 			profileImg: "/avatars/girl1.png",
	// 		},
	// 		type: "like",
	// 	},
	// ];

	const {data : notifications , refetch , isRefetching} = useQuery(
		{
			queryKey : ["notifications"],
			queryFn : async() =>
			{
				try {
					const res = await fetch(`${baseURL}/api/notifications/mynotis`,
						{
							method : "GET",
							credentials : "include",
							headers : 
							{
								"Content-Type" : "application/json"
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
			}
		}
	)

	useEffect( ()=>
	{
		refetch()
	},[refetch])

	const {mutate : deleteAllNotifications , isLoading} = useMutation(
		{
			mutationFn : async()=>
			{
				try {
					const res = await fetch(`${baseURL}/api/notifications/deleteallnotis`,
						{
							method : "DELETE",
							credentials :"include",
							headers : 
							{
								"Content-Type" : "application/json"
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
			onSuccess : () =>
			{
				toast.success("Notifications Deleted")
				queryClient.invalidateQueries(
					{
						queryKey : ["notifications"]
					}
				)
			}
		}
	)

	const {mutate : deleteOneNotification , isLoading :  isDeletingOneNotification} = useMutation(
		{
			mutationFn : async({id})=>
			{
				try {
					const res = await fetch(`${baseURL}/api/notifications/deleteone/${id}`,
						{
							method : "DELETE",
							credentials :"include",
							headers : 
							{
								"Content-Type" : "application/json"
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
			onSuccess : () =>
			{
				toast.success("Notification Deleted")
				queryClient.invalidateQueries(
					{
						queryKey : ["notifications"]
					}
				)
			}
		}
	)



	const deleteNotifications = () => {
		// alert("All notifications deleted");
		deleteAllNotifications()
	};


	const handleDeleteOneNotification = (id)=>
	{
		deleteOneNotification({id})
	}

	
	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<button
                                    onClick={deleteNotifications}>
                                    Delete all notifications
                                </button>
							</li>
						</ul>
					</div>
				</div>
				{(isLoading || isRefetching) && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='sm' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => 
				{
					const notifiedAt = formatNotiDate(notification.createdAt);

					return(
					<div style={{borderBottom: "1px solid #364153"}} className='flex items-start justify-between p-4 gap-3 w-full'>

							{/* LEFT SIDE: icon + avatar + text */}
							<div className='flex gap-3 items-baseline'>

								{/* Action Icon */}
								{notification.action === "follow" && <FaUser className='w-7 h-7 text-primary' />}
								{notification.action === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
								{notification.action === "comment" && <FaComment className='w-7 h-7 text-white-500' />}

								{/* Avatar + text */}
								<Link to={`/profile/${notification.from.userName}`} className="flex gap-2 items-baseline">
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={notification.from.profileImg || "/avatar-placeholder.png"} alt=""/>
										</div>
									</div>

									<div className='flex gap-1 items-baseline'>
										<span className='font-bold'>@{notification.from.userName}</span>
										{notification.action === "follow"
											? "followed you"
											: notification.action === "comment"
											? "commented to your post"
											: "liked your post"}
									</div>
								</Link>

							</div>

							{/* RIGHT SIDE: time + delete button */}
							<div className="flex gap-2 items-center">

								<span className="text-gray-400 text-sm self-baseline">
									{notifiedAt}
								</span>

								{isDeletingOneNotification
									? <LoadingSpinner size="sm"/>
									: <FaTrash
										className="text-gray-400 cursor-pointer hover:text-red-500"
										onClick={() => handleDeleteOneNotification(notification._id)}
									/>}
							</div>
                     </div>
				)
				})}
			</div>
		</>
	);
};
export default NotificationPage;