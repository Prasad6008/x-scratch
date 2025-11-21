import userModel from "../Models/userModel.js"
import bcrypt, { genSalt } from 'bcryptjs'
import generateToken from "../Utils/generateToken.js"

export const signUp = async(req,res)=>
{
    try {
        const {userName,fullName,email,password} = req.body

        //Email validation
        const validEmailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(!validEmailRegx.test(email)){
            return res.status(404).json({error:"Provide valid email"})
        }

        if(password.length < 6){
            return res.status(404).json({error:"Password must be length of atleast of 6"})
        }

        const existing_user_name = await userModel.findOne({userName})
        const existing_user_mail = await userModel.findOne({email})

        if(existing_user_mail || existing_user_name){
            return res.status(404).json({error:"Account already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel(
            {
                userName,
                fullName,
                email,
                password : hashedPassword
            }
        )
        
        if(newUser)
        {
            generateToken(newUser._id , res)
            await newUser.save()

            return res.status(200).json("SignUp Completed...✅")
        }

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({error:"Internal server error in signUp"})
    }
}

export const login = async(req,res) =>
{
    try {
        const {userName} = req.body 

        const user = await userModel.findOne({userName})

        if(!user){
            return res.status(404).json({error:"User not found"})
        }

        const {password} = req.body 

        const isVerifiedPassword = await bcrypt.compare(password,user.password)

        if(!isVerifiedPassword){
            return res.status(404).json({error:"Incorrct password"})
        }

        if(user && isVerifiedPassword){
            generateToken(user._id , res)
            return res.status(200).json("Logined successfully")
        }

    
    } catch (error) {
        console.log({Error_inLogin:error.message})
        return res.status(500).json({error:"Internal server error in login"})
    }
}

export const logout = async(req,res) =>
{
    try {
        res.cookie("jwt" , "" , {maxAge : 0})
        return res.status(200).json("Logged Out !")
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Error in logout")
    }
}

export const getME = async(req,res) =>
{
    try {
        const currentUser = await userModel.findById(req.user._id)
        // .populate(
        // [
        //     {
        //         path : "following",
        //         select : "userName"
        //     },
        //     {
        //         path : "followers",
        //         select : "userName"
        //     },
        // ])
        .select("-password")

        return res.status(200).json(currentUser)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Error in getME")
    }
}