import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseURL from "../constant/url";
import toast from "react-hot-toast";


const useFollow = ()=>
{
    const queryClient = useQueryClient()
    const {mutate : follow , isPending} = useMutation(
    {
        mutationFn : async({userID})=>
        {
            try {
                const res = await fetch(`${baseURL}/api/user/followunfollow/${userID}`,
                    {
                        method : "POST",
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
                console.log("UserFolloeID",userID)
                return data
            } catch (error) {
                throw error
            }
        },
        onSuccess : (data)=>
        {
            toast.success(data.message)
            Promise.all(
                [
                    queryClient.invalidateQueries(["authUser"]),
                    queryClient.invalidateQueries(["USERS_FOR_RIGHT_PANEL"])
                ]
            )
        },
        onError : (error)=>
        {
            toast.error(error)
        }
    }
)
return {follow , isPending}
}

export default useFollow