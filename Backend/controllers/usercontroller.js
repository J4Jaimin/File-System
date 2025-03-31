import mongoose from 'mongoose';
import UserModel from '../models/usermodel.js';
import DirModel from '../models/dirmodel.js';

export const getUserDetails = (req, res, next) => {
    res.status(200).json({
        name: req.user.name,
        email: req.user.email
    });
}
export const registerUser = async (req, res, next) => {

    const { name, email, password } = req.body;

    const session = await mongoose.startSession();

    try {

        const foundUser = await UserModel.findOne({ email });

        if (foundUser) {
            return res.status(409).json({
                error: "User already exists",
                message: "A user with this email is already exist, please try different email.",
            });
        }

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
        const user = await UserModel.findOne({ email, password });

        if (!user) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        const cookies = {
            uid: user._id.toString(),
            email: user.email,
        }

        Object.entries(cookies).forEach(([key, value]) => {
            res.cookie(key, value, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 * 1000,
                sameSite: "none",
                secure: true
            });
        });

        res.status(200).json({
            message: "User logged in successfully"
        });

    } catch (error) {
        console.log(error);
        next();
    }
}

export const logoutUser = (req, res, next) => {
    res.clearCookie('uid');
    res.clearCookie('email');
    res.status(200).json({
        message: "User logged out successfully"
    });
}