import { Router } from 'express'
import { passport } from './passport.js'
import { signToken, setAuthCookie, clearAuthCookie } from './jwt.service.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { env } from '../config/env.js'
import type { User } from '../db/schema.js'

const router = Router()

router.get('/google', passport.authenticate('google', {
  session: false,
  scope: ['profile', 'email'],
}))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: env.clientUrl }),
  (req, res) => {
    const user = req.user as User
    const token = signToken(user.id)
    setAuthCookie(res, token)
    res.redirect(env.clientUrl)
  }
)

router.get('/github', passport.authenticate('github', {
  session: false,
  scope: ['user:email'],
}))

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: env.clientUrl }),
  (req, res) => {
    const user = req.user as User
    const token = signToken(user.id)
    setAuthCookie(res, token)
    res.redirect(env.clientUrl)
  }
)

router.get('/me', requireAuth, (req, res) => {
  const { password, ...safeUser } = req.user as User
  res.json({ user: safeUser })
})

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ message: 'Logged out successfully' })
})

export { router as authRoutes }