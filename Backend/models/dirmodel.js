import mongoose from 'mongoose';

const dirModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'directories',
        default: null
    },
    files: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'files',
        default: []
    },
    directories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'directories',
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {
    versionKey: false,
});

export default mongoose.model('directories', dirModel);