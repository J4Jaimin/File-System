import redisClient from '../config/redisConnection.js';
import crypto from 'crypto';

export const createSession = async (userId) => {
    const sessionId = crypto.randomBytes(32).toString('hex');
    await redisClient.json.set(`session:${sessionId}`, "$", {
        userId: userId,
        createdAt: new Date()
    });
    await redisClient.sAdd(`userSessions:${userId}`, sessionId);
    await redisClient.expire(`session:${sessionId}`, 60 * 60 * 24 * 7);
    await redisClient.expire(`userSessions:${userId}`, 60 * 60 * 24 * 7);
    return sessionId;
}

export const getSession = async (sessionId) => {
    const session = await redisClient.json.get(`session:${sessionId}`);
    return session;
}

export const getAllUserSessions = async (userId) => {
    const userSessions = await redisClient.sMembers(`userSessions:${userId}`);
    return userSessions;
}

export const deleteSession = async (sessionId) => {
    const session = await redisClient.json.get(`session:${sessionId}`);

    if(session?.userId) {
        await redisClient.sRem(`userSessions:${session.userId}`, sessionId);
        await redisClient.expire(`userSessions:${session.userId}`, 60 * 60 * 24 * 7);
    }
    await redisClient.json.del(`session:${sessionId}`);
}

export const deleteAllUserSessions = async (userId) => {
    const sessions = await redisClient.sMembers(`userSessions:${userId}`);
    for (const sessionId of sessions) {
        await deleteSession(sessionId);
    }
}
