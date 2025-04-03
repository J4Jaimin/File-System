import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jaimin19beceg120:5jKBq4i8HXLyTS3v@cluster0.4m3groq.mongodb.net/filestorage?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

export const client = mongoose.connection.getClient();

process.on("SIGINT", async () => {
    await client.close();
    console.log("DB disconnected!!");
    process.exit(0);
});

