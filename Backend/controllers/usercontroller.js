import mongoose from 'mongoose';
import crypto, { pbkdf2, pbkdf2Sync } from 'crypto';
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

    const salt = crypto.randomBytes(16);

    const newHashedPassword = pbkdf2Sync(password, salt, 100000, 32, 'sha256');

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
            password: salt.toString('base64url') + "." + newHashedPassword.toString('base64url'),
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

        const [salt, savedPwdHash] = user.password.split('.');

        const enteredPwdHash = pbkdf2Sync(password, Buffer.from(salt, 'base64url'), 100000, 32, 'sha256').toString('base64url');

        if (savedPwdHash !== enteredPwdHash) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        const cookiePayload = JSON.stringify({
            uid: user._id.toString(),
            email: email,
            expiry: Math.round(Date.now() / 1000) + 3600,
        });

        res.cookie("token", cookiePayload, {
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

export const logoutUser = (req, res, next) => {
    res.clearCookie('token');
    res.status(200).json({
        message: "User logged out successfully"
    });
}