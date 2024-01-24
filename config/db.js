import mongoose from "mongoose";

const conectarDB = async () =>{
    try {
        const connection = await mongoose.connect(process.env.DB_URL)

        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(`MongoDB en ${url}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default conectarDB