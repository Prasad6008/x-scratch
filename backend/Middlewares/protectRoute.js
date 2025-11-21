import jwt from 'jsonwebtoken'
import userModel from '../Models/userModel.js'

const protectRoute = async(req,res,next) =>
{
    try {
        const token = req.cookies.jwt

        if(!token){
            return res.status(404).json({Error:"Unauthorized : No token provided"})
        }

        const decoded = jwt.verify(token , process.env.JSON_WTK_SECRET_KEY)

        if(!decoded){
            return res.status(404).json({Error:"User not found"})
        }

        const currentUSer = await userModel.findById(decoded.userId).select("-password")

        req.user = currentUSer
        next()

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json("Error in protectRoute.js")
    }
}

export default protectRoute