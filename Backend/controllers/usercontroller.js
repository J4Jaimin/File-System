import mongoose from 'mongoose';
import crypto, { pbkdf2 } from 'crypto';
import UserModel from '../models/usermodel.js';
import DirModel from '../models/dirmodel.js';
import Session from '../models/sessionmodel.js';
import nodemailer from 'nodemailer';
import OtpModel from '../models/otpmodel.js';

export const getUserDetails = (req, res, next) => {
    res.status(200).json({
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
    });
}
export const registerUser = async (req, res, next) => {

    const { name, email, password } = req.body;

    const session = await mongoose.startSession();

    try {
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
            password,
            rootdir: insertedDir[0]._id
        }

        const insertedUser = await UserModel.create([user], { session });

        await DirModel.updateOne(
            { _id: insertedDir[0]._id },
            { $set: { userId: insertedUser[0]._id } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        if (error.code === 121) {
            return res.status(400).json({
                error: "Invalid Field, Please enter valid input."
            });
        }
        else if (error.code === 11000) {
            if (error.keyValue.email) {
                return res.status(409).json({
                    error: "User already exists",
                    message: "A user with this email is already exist, please try different email.",
                });
            }
        }
        else {
            next(error);
        }
    } finally {
        session.endSession();
    }
}

export const loginUser = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        const isPasswordCorrect = user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

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

        res.status(200).json({
            message: "User logged in successfully"
        });

    } catch (error) {
        console.log(error);
        next();
    }
}

export const logoutUser = async (req, res, next) => {

    const sessionId = req.signedCookies.sid;

    if (!sessionId) {
        return res.status(400).json({
            error: "No session found"
        });
    }

    await Session.findByIdAndDelete({ _id: sessionId });

    res.clearCookie('sid');
    res.status(200).json({
        message: "User logged out successfully"
    });
}

export const logoutAllUser = async (req, res, next) => {
    const sessionId = req.signedCookies.sid;
    const session = await Session.findById(sessionId);
    if (!session) {
        return res.status(400).json({
            error: "No session found"
        });
    }
    await Session.deleteMany({ userId: session.userId });
    res.clearCookie('sid');
    res.status(200).json({
        message: "User logged out from all devices successfully"
    });
}