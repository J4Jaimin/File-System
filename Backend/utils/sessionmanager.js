import redisClient from '../config/redisConnection.js';
import crypto from 'crypto';

const SESSION_EXPIRY = 3600;

export const createSession = async (userId) => {
    const sessionId = crypto.randomBytes(32).toString('hex');
    await redisClient.json.set(`session:${sessionId}`, "$", {
        userId: userId,
        createdAt: new Date()
    });
    await redisClient.expire(`session:${sessionId}`, SESSION_EXPIRY);
    return sessionId;
}

export const getSession = async (sessionId) => {
    const session = await redisClient.json.get(`session:${sessionId}`);
    return session;
}

export const getAllUserSessions = async (userId) => {
    const userSessions = await redisClient.ft.search('idx:sessions', `@userId:{${userId}}`);
    return userSessions;
}

export const deleteSession = async (sessionId) => {
    await redisClient.json.del(`session:${sessionId}`);
}

export const deleteAllUserSessions = async (userId) => {
    const result = await redisClient.ft.search('idx:sessions', `@userId:{${userId}}`);
    const sessions = result.documents;

    for (const session of sessions) {
        await deleteSession(session.id.split(':')[1]);
    }
}
