import type { Request, Response, NextFunction } from "express"
import { eq } from "drizzle-orm"
import { verifyToken } from "../auth/jwt.service.js"
import { db } from "../db/index.js"
import { users, User } from "../db/schema.js"

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export async function requireAuth(req:Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    const payload = verifyToken(token)
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1)
    
    if (!user) {
        return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
}