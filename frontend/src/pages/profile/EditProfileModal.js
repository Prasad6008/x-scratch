import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import baseURL from "../../constant/url";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EditProfileModal = () => {

	const [formErrors, setFormErrors] = useState({
    currentPassword: "",
    });

	const queryClient = useQueryClient()
	const authUser = queryClient.getQueryData(["authUser"])
	const [isUpdated,setIsUpdated] = useState(false)

	const [formData, setFormData] = useState({
		fullName:  authUser? authUser.fullName :"",
		userName: authUser? authUser.userName : "",
		email:authUser? authUser.email : "",
		bio:authUser? authUser.bio : "",
		links:authUser? authUser.links : "",
		newPassword:"",
		currentPassword:"",
	});

	const {mutate : updateProfile , isPending : isProfileUpdating } = useMutation({
		mutationFn : async({fullName,currentPassword,newPassword,bio,links}) =>
            {
                try {
                    const res = await fetch(`${baseURL}/api/user/updateprofile`,
                        {
                            method : "POST",
                            credentials : "include",
                            headers : 
                            {
                                "Content-Type":"application/json"
                            },
                            body : JSON.stringify({fullName,currentPassword,newPassword,bio,links})
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
                toast.success("Profile Updated")
				setIsUpdated(true)
				setFormErrors({ currentPassword: "" })
				Promise.all(
					[
						queryClient.invalidateQueries(["authUser"]),
						queryClient.invalidateQueries(["userProfile"])
					]
				)
            },
			onError : (error)=>
			{
				if (error.message === "Current Password is incorrect") {
						setFormErrors(prev => ({
							...prev,
							currentPassword: error.message
						}));
					}
			}
	})

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};



	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile(formData)
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={authUser.userName}
								disabled
								name='username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={authUser.email}
								disabled
								name='email'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className={`flex-1 input border rounded p-2 input-md 
                                ${formErrors.currentPassword ? "border-red-500" : "border-gray-700"}`}
								value={formData.currentPassword}
								name='currentPassword'
								onChange={(e) => {
									handleInputChange(e);
									setFormErrors({ ...formErrors, currentPassword: "" }); // clear error when typing
								}}
							/>
							
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						{formErrors.currentPassword && (
								<p className="text-red-500 text-sm mt-1">{formErrors.currentPassword}</p>
							)}
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.links}
							name='links'
							onChange={handleInputChange}
						/>
						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{isProfileUpdating &&  <LoadingSpinner size="em"/>}
							{!isProfileUpdating && !isUpdated && "Update"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;