import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
    picture: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    rootdir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'directories',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user'
    }
});

userModel.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userModel.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

export default mongoose.model('users', userModel);