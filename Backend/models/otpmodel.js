import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    }
});

const OtpModel = mongoose.model('Otp', otpSchema);


export default OtpModel;