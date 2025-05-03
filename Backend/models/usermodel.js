import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rootdir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'directories',
        required: true
    }
});

export default mongoose.model('users', userModel);