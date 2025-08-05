import mongoose from 'mongoose';

const fileModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ext: {
        type: String,
        required: true
    },
    dirId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'directories',
        required: true
    }, 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
});

export default mongoose.model('files', fileModel);