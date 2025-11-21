import express from 'express'
import dotenv from 'dotenv'
import authRoute from './Routes/authRoute.js'
import connectDB from './DbConnectors/connectDB.js'
import cookieParser from 'cookie-parser'
import userRoute from './Routes/userRoute.js'
import postRoute from './Routes/postRoute.js'
import notificationRoute from './Routes/notificationRoute.js'
import cors from 'cors'
import {v2 as cloudinary} from 'cloudinary'

//During Deploymnt
import path from "path"

dotenv.config()
cloudinary.config(
    {
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_SECRET_KEY,
        cloud_name : process.env.CLOUDINARY_STORAGE_NAME
    }
)

const app = express()
const PORT = process.env.PORT
const __dirname = path.resolve()

app.use(express.json(
    {
        limit : "5mb"
    }
))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors(
    {
        origin : "http://localhost:3000",
        credentials : true
    }
))

app.use('/api/auth',authRoute)
app.use('/api/user',userRoute)
app.use('/api/post',postRoute)
app.use('/api/notifications',notificationRoute)

if(process.env.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname,'/frontend/build')))
}

app.listen( PORT , ()=>
{
    console.log(`Server is running on ${PORT}`)
    connectDB()
})
