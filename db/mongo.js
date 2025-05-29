import mongoose from "mongoose";
import { logger } from "../winston.js";

mongoose.connect(process.env.DATABASE_URL)
    .then(() => logger.info('mongo connected'))
    .catch(err => logger.error(err))
