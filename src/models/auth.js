import mongoose, { Schema } from "mongoose";

// mongoose.connect(process.env.DATABASE_URL)
//     .then(() => console.log('mongo connected'))
//     .catch(err => console.error(err))

const UserSchema = new Schema({
    mail: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/
    },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "admin"] }
})

export const User = mongoose.model('User', UserSchema)