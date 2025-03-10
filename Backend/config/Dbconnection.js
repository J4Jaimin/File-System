import { MongoClient } from 'mongodb';

export const client = new MongoClient('mongodb://127.0.0.1:27017/filestorage');

export async function connectDB() {

    await client.connect();
    const db = client.db();

    console.log("DB connection successful!!");

    return db;
}

process.on("SIGINT", async () => {
    await client.close();
    console.log("DB disconnected!!");
    process.exit(0);
});

