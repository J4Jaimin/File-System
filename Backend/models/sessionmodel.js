import mongoose, { mongo } from "mongoose";

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 360
    }
},
    {
        strict: "throw"
    });


const Session = mongoose.model("Session", SessionSchema);



export default Session;