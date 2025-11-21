import mongoose from 'mongoose'

const connectDB = async(req,res)=>
{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB Connected")
    } catch (error) {
        console.log({Error_in_connect_DB:error.message})
        console.log({Error_in_connect_DB:"Error in connectDB.js"})
        process.exit(1)
    }
}

export default connectDB