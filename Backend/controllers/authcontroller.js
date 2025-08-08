import mongoose from 'mongoose';
import { ZodError } from 'zod';
import crypto from 'crypto';
import UserModel from '../models/usermodel.js';
import DirModel from '../models/dirmodel.js';
import { createSession, deleteSession, getAllUserSessions } from '../utils/sessionmanager.js';
import nodemailer from 'nodemailer';
import OtpModel from '../models/otpmodel.js';
import { googleAuthSchema, emailValidator, verifyOtpSchema, resetPasswordSchema } from '../validators/authvalidator.js';

export const sendOtpToEmail = async (req, res, next) => {

    try {
        const user = await UserModel.findOne({ email: emailValidator.parse(req.body.email) });    

        if(user) {
            return res.status(400).json({
                error: "User with this email already exists. Please login."
            });
        }

        const email = emailValidator.parse(req.body.email);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const OTP = crypto.randomInt(1000, 9999).toString();

        await OtpModel.create({
            email: email,
            otp: OTP,
        });

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
        if (error instanceof ZodError) {
            return res.status(400).json({
              error: "Please enter a valid email address."
            });
        }
        else {
            console.log(error);
            next();
        }
    }
}

export const verifyOtp = async (req, res, next) => {

    const otp = verifyOtpSchema.parse(Number(req.body.otp));

    try {
        const otpData = await OtpModel.findOne({ otp });
        if (!otpData) {
            return res.status(400).json({
                error: "OTP Expired or Invalid"
            });
        }
        else {
            await OtpModel.updateOne({ otp }, { $set: { isVerified: true } });
            res.status(200).json({
                message: "OTP verified successfully",
                verified: true
            });
        }
    } catch (error) {
        console.log(error);
        next();
    }
}

export const googleAuth = async (req, res, next) => {
    
    const { email, name, picture } = googleAuthSchema.parse(req.body);

    const session = await mongoose.startSession();
    
    try {
        let user = await UserModel.findOne({ email });

        if (user) {

            if(user.isDeleted) {
                return res.status(403).json({
                    error: "Your account has been deleted. Please contact support admin."
                });
            }
            
            const s_id = await createSession(user._id);

            const sessions = await getAllUserSessions(user._id);

            if (sessions.total > 2) {
                const oldestSession = sessions.documents.reduce((oldest, current) => {
                    return oldest.value.createdAt < current.value.createdAt ? oldest : current;
                });

                await deleteSession(oldestSession.id.split(':')[1]);
            }

            res.cookie("sid", s_id, {
                httpOnly: true,
                signed: true,
                maxAge: 60 * 60 * 24 * 7 * 1000
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

            
            const s_id = await createSession(insertedUser[0]._id);
            
            res.cookie("sid", s_id, {
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

export const resetPassword = async (req, res, next) => {
    
    try {
        const email = emailValidator.parse(req.body.email);
        const user = await UserModel.findOne({email: email});
    
        if(!user) {
            return res.status(403).json({
                message: "user does not exist, please register first."
            });
        }
    
        const rawToken = crypto.randomBytes(32).toString("hex");
        
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    
        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();
    
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    
        const info = await transporter.sendMail({
            from: '"Own Cloud" <owncloud@support.com>',
            to: `${email}`,
            subject: "Reset Your Password",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Hey ${user.name},</p>
                <p>We received a request to reset your password.</p>
                <p>
                  Click the button below to set a new one (valid for <strong>15 minutes</strong>):
                </p>
                <p>
                  <a 
                    href="http://localhost:5173/forgot-password/${hashedToken}" 
                    style="
                      display: inline-block;
                      padding: 10px 20px;
                      background-color: #007bff;
                      color: #fff;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                    "
                  >
                    👉 Reset Password
                  </a>
                </p>
                <p>If you didn’t request this, you can safely ignore this email.</p>
                <br />
                <p>– The Own Cloud Team</p>
              </div>
            `
          });
          
        console.log("Message sent: %s", info.messageId);
    
        return res.status(200).json({
            message: "Link to reset password sent successfully to your mail id."
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
              message: "Please enter a valid email address."
            });
        }
        else {
            console.log(error);
            next();
        }
    }
}

export const forgotPassword = async(req, res, next) => {

    try {
        const user = await UserModel.findOne({resetToken: req.body.token});
    
        if(!user) {
            return res.status(400).json({
                message: "Invalid Token"
            });
        }
    
        if(user.resetTokenExpiry > Date.now()) {
            return res.status(403).json({
                message: "Token expired, please try again."
            });
        }
    
        user.password = resetPasswordSchema.parse(req.body.newPassword);
        await user.save();
    
        return res.status(200).json({
            message: "Password reset successfully"
        });
        
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
              message: "Please enter a valid email password."
            });
        }
        else {
            console.log(error);
            next();
        }
    }
}

