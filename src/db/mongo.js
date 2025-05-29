import mongoose from "mongoose";
import { logger } from "../winston.js";

mongoose.connect(process.env.DATABASE_URL)
    .then(() => logger.info('mongo connected'))
    .catch(err => logger.error(err))

    mongoose.connection.on('error',(err)=>{
        logger.error("Mongo connection error:",err)
    })

    mongoose.connection.on("disconnected",()=>{
        logger.warn("mongo disconnected")
    })