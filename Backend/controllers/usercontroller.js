import mongoose from 'mongoose';
import UserModel from '../models/usermodel.js';
import DirModel from '../models/dirmodel.js';
import OtpModel from '../models/otpmodel.js';
import { loginSchema, registerSchema } from '../validators/authvalidator.js';
import { createSession, getSession, deleteSession, getAllUserSessions, deleteAllUserSessions } from '../utils/sessionmanager.js';

export const getUserDetails = (req, res, next) => {
    res.status(200).json({
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
    });
}
export const registerUser = async (req, res, next) => {
    
    const session = await mongoose.startSession();
    
    try {
        const { name, email, password } = registerSchema.parse(req.body);
    
        const userExists = await UserModel.findOne({ email });
    
        if (userExists) {
            return res.status(400).json({
                error: "User with this email already exists."
            });
        }
    
        session.startTransaction();

        const otp = await OtpModel.findOne({ email });

        if(!otp || !otp.isVerified) {
            return res.status(400).json({
                error: "Email not verified, Please verify your email first."
            });
        }

        await OtpModel.deleteOne({ email });

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
            next();
        }
    } finally {
        session.endSession();
    }
}

export const loginUser = async (req, res, next) => {

    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        if(user.isDeleted) {
            return res.status(403).json({
                error: "Your account has been deleted. Please contact support admin."
            })
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        const sessionId = await createSession(user._id.toString());

        const sessions = await getAllUserSessions(user._id.toString());

        if (sessions.documents.length > 2) {
            const oldestSession = sessions.documents.reduce((oldest, current) => {
                return oldest.value.createdAt < current.value.createdAt ? oldest : current;
            });
            await deleteSession(oldestSession.id.split(':')[1]);
        }

        res.cookie("sid", sessionId, {
            httpOnly: true,
            signed: true,
            maxAge: 60 * 60 * 24 * 7 * 1000
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

    await deleteSession(sessionId);

    res.clearCookie('sid');
    res.status(200).json({
        message: "User logged out successfully"
    });
}

export const logoutAllUser = async (req, res, next) => {
    const sessionId = req.signedCookies.sid;
    const session = await getSession(sessionId);
    if (!session) {
        return res.status(400).json({
            error: "No session found"
        });
    }
    await deleteAllUserSessions(session.userId);
    res.clearCookie('sid');
    res.status(200).json({
        message: "User logged out from all devices successfully"
    });
}