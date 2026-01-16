import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env.js";

export interface TokenPayload {
    userId: number
}

const TOKEN_EXPIRY = '7d'
const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

export function signToken(userId: number): string {
    return jwt.sign({ userId }, env.jwtSecret, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, env.jwtSecret) as TokenPayload
    } catch {
        return null
    }
}

export function setAuthCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    })
}

export function clearAuthCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: '/' })
}