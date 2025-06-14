import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import { User } from './src/models/auth.js';
import "dotenv/config"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error("no path for database")
    process.exit()
}

if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_EMAIL) {
    console.error("no admin info provided")
    process.exit()
}
async function createAdmin() {
    await mongoose.connect(DATABASE_URL);
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log('Admin already exists');
        process.exit();
    }
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new User(
        {
            // name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
            // isActive: true,
        });
    await admin.save();
    console.log('✅ Admin created');
    process.exit();
}
createAdmin().catch(err => { console.error(err); process.exit(1); });