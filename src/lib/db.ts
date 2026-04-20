import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose | null> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGODB_URI) {
        console.warn("MONGODB_URI not defined. Database operations will be disabled.");
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000"), // Server selection timeout
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || "45000"), // Socket timeout
            maxPoolSize: parseInt(process.env.DB_POOL_SIZE || "10"), // Connection pool size
        };

        console.log("Attempting to connect to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log("🟢 Successfully connected to MongoDB");
            return mongoose;
        }).catch(err => {
            console.error("🔴 MongoDB Connection Error:", err.message);
            cached.promise = null; // Reset promise so we can retry later
            return null;
        });
    }

    try {
        const conn = await cached.promise.catch((e) => {
            console.error("Critical: Failed to await DB connection promise.", e.message);
            return null;
        });
        cached.conn = conn;
    } catch (e: any) {
        console.error("Critical: Failed to await DB connection promise.", e.message);
        cached.promise = null;
        return null;
    }

    return cached.conn;
}

export default connectToDatabase;
