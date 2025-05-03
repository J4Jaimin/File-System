import mongoose from "mongoose";
import { connectDB } from "./Dbconnection.js";

await connectDB();

const client = mongoose.connection.getClient();

const status = "create";

try {
    const db = mongoose.connection.db;
    // schema validation users
    await db.command({
        [status]: "users",
        validator: {
            $jsonSchema: {
                required: [
                    '_id',
                    'name',
                    'email',
                    'password',
                    'rootdir'
                ],
                properties: {
                    _id: {
                        bsonType: 'objectId'
                    },
                    name: {
                        bsonType: 'string',
                        maxLength: 45
                    },
                    email: {
                        bsonType: 'string',
                        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
                    },
                    password: {
                        bsonType: 'string',
                        minLength: 4,
                        maxLength: 8
                    },
                    rootdir: {
                        bsonType: 'objectId'
                    }
                },
                additionalProperties: false
            }
        },
        validationLevel: 'strict',
        validationAction: "error"
    });

    // schema validation directories
    await db.command({
        [status]: "directories",
        validator: {
            $jsonSchema: {
                required: [
                    '_id',
                    'name',
                    'parent',
                    'files',
                    'directories',
                    'userId'
                ],
                properties: {
                    _id: {
                        bsonType: 'objectId'
                    },
                    name: {
                        bsonType: 'string'
                    },
                    parent: {
                        bsonType: [
                            'objectId',
                            'null'
                        ]
                    },
                    files: {
                        bsonType: 'array'
                    },
                    directories: {
                        bsonType: 'array'
                    },
                    userId: {
                        bsonType: 'objectId'
                    }
                },
                additionalProperties: false
            }
        },
        validationLevel: 'strict',
        validationAction: "error"
    });

    // schema validation files
    await db.command({
        [status]: "files",
        validator: {
            $jsonSchema: {
                required: [
                    '_id',
                    'ext',
                    'name',
                    'dirId'
                ],
                properties: {
                    _id: {
                        bsonType: 'objectId'
                    },
                    ext: {
                        bsonType: 'string'
                    },
                    name: {
                        bsonType: 'string'
                    },
                    dirId: {
                        bsonType: 'objectId'
                    }
                },
                additionalProperties: false
            }
        },
        validationLevel: 'strict',
        validationAction: "error"
    });

} catch (error) {
    console.log("Error while setting up database!", error);
} finally {
    await client.close();
    process.exit(0);
}
