import {z} from 'zod/v4';


export const loginSchema = z.object({
    email: z.string().email("Please enter valid email"),
    password: z.string().min(4).max(100)
});

export const registerSchema = z.object({
    name: z.string().min(2).max(45),
    email: z.string().email("Please enter valid email"),
    password: z.string().min(4).max(100)
});

export const verifyOtpSchema = z.number("Please enter 4 digit valid OTP.").min(1000).max(9999);

export const sendOtpSchema = z.string().email("Please enter valid email");

export const googleAuthSchema = z.object({
    email: z.string().email("Please enter valid email"),
    name: z.string().min(2).max(45),
    picture: z.string().url("Please enter valid picture url")
});