const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const AuthUser = require('../models/authUser');
const requireAuth = require('../middleware/requireAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'helscan-dev-secret-change-in-prod';
const JWT_EXPIRES = '30d';
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_LIMIT_MAX = 10;
const authAttempts = new Map();

function authRateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const current = authAttempts.get(key);

    if (!current || current.resetAt <= now) {
        authAttempts.set(key, { count: 1, resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS });
        return next();
    }

    if (current.count >= AUTH_RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    current.count += 1;
    return next();
}

// POST /auth/signup
router.post('/auth/signup', authRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const existing = await AuthUser.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await AuthUser.create({ email, passwordHash });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, riderId: user.riderId ?? null },
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// POST /auth/login
router.post('/auth/login', authRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await AuthUser.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.status(200).json({
            token,
            user: { id: user._id, email: user.email, riderId: user.riderId ?? null },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /auth/me
router.get('/auth/me', requireAuth, async (req, res) => {
    try {
        const user = await AuthUser.findById(req.user.userId).select('email riderId');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ id: user._id, email: user.email, riderId: user.riderId ?? null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;

