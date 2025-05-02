import mongoose, { Schema } from "mongoose";

mongoose.connect('mongodb://localhost/users')
    .then(() => console.log('connected'))
    .catch(err => console.error(err))

const UserSchema = new Schema({
    mail: { type: String },
    password: String,
    role: { type: String, default: "user" }
})

export const User = mongoose.model('User', UserSchema)