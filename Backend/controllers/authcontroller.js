import mongoose from 'mongoose';
import crypto, { pbkdf2 } from 'crypto';
import UserModel from '../models/usermodel.js';
import DirModel from '../models/dirmodel.js';
import Session from '../models/sessionmodel.js';
import nodemailer from 'nodemailer';
import OtpModel from '../models/otpmodel.js';

export const sendOtpToEmail = async (req, res, next) => {

    const email = req.body.email;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: "jaiminrana1102@gmail.com",
                pass: "quci lsws dmpb pbwp",
            },
        });

        const OTP = crypto.randomInt(1000, 9999).toString();

        await OtpModel.create({ otp: OTP });

        const info = await transporter.sendMail({
            from: '"Own Cloud" <owncloud@support.com>',
            to: `${email}`,
            subject: "Email Verificaion OTP",
            html: "<h2>Your OTP for email verification: " + OTP + "</h2>"
        })

        console.log("Message sent: %s", info.messageId);

        res.status(200).json({
            message: "OTP sent successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        next();
    }
}

export const verifyOtp = async (req, res, next) => {

    const { otp } = req.body;

    try {
        const otpData = await OtpModel.findOne({ otp });
        if (!otpData) {
            return res.status(400).json({
                error: "OTP Expired or Invalid"
            });
        }
        else {
            res.status(200).json({
                message: "OTP verified successfully",
                verified: true
            });
            await OtpModel.deleteOne({ otp });
        }
    } catch (error) {
        console.log(error);
        next();
    }
}

export const googleAuth = async (req, res, next) => {
    
    const { email, name, picture } = req.body;

    if(!email || !name || !picture) {
        return res.status(400).json({
            message: "Email, Name and Picture are required"
        });
    }
    
    const session = await mongoose.startSession();
    
    try {
        let user = await UserModel.findOne({ email });

        if (user) {
            const session = await Session.create({ userId: user._id });

            const sessions = await Session.find({ userId: user._id });

            if (sessions.length > 2) {
                const oldestSession = sessions.reduce((oldest, current) => {
                    return oldest.createdAt < current.createdAt ? oldest : current;
                });

                await Session.deleteOne({ _id: oldestSession._id });
            }

            res.cookie("sid", session.id, {
                httpOnly: true,
                signed: true,
                maxAge: 60 * 60 * 1000
            });

            return res.status(200).json({
                message: "User logged in successfully"
            });
        } else {

            session.startTransaction();

            const dir = {
                name: `root-${email}`,
                parent: null,
                files: [],
                directories: [],
            }

            const insertedDir = await DirModel.create([dir], { session });

            const user = {
                name,
                email,
                picture,
                password: crypto.randomBytes(16).toString('hex'),
                rootdir: insertedDir[0]._id
            }

            const insertedUser = await UserModel.create([user], { session });

            await DirModel.updateOne(
                { _id: insertedDir[0]._id },
                { $set: { userId: insertedUser[0]._id } },
                { session }
            );

            
            const s = await Session.create({ userId: insertedUser[0]._id });
            
            res.cookie("sid", s.id, {
                httpOnly: true,
                signed: true,
                maxAge: 60 * 60 * 1000
            });
            
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "User logged in successfully",
                user
            });

            }
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        console.log(error);
        next();
    }
}

