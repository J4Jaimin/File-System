import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

export const client = mongoose.connection.getClient();

process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("DB disconnected!!");
    process.exit(0);
});

