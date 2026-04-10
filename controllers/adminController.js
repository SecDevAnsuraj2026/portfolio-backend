const Admin = require('../models/Admin');
const db = require('../config/db');
const {
  createAuthToken,
  getCookieOptions,
  getSessionExpiry,
  SESSION_DURATION_MS,
  TOKEN_COOKIE,
} = require('../middleware/authMiddleware');

const INVALID_LOGIN_MESSAGE = 'Invalid admin credentials';
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const loginAttempts = new Map();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getLoginKey(req, email) {
  return `${req.ip || req.socket?.remoteAddress || 'unknown'}:${normalizeEmail(email)}`;
}

function getAttemptRecord(key) {
  const record = loginAttempts.get(key);
  if (!record) {
    return { count: 0, firstAttemptAt: Date.now(), lockedUntil: 0 };
  }

  if (Date.now() - record.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return { count: 0, firstAttemptAt: Date.now(), lockedUntil: 0 };
  }

  return record;
}

function isLoginLocked(key) {
  const record = getAttemptRecord(key);
  return record.lockedUntil && Date.now() < record.lockedUntil;
}

function recordLoginFailure(key) {
  const record = getAttemptRecord(key);
  const nextRecord = {
    count: record.count + 1,
    firstAttemptAt: record.firstAttemptAt || Date.now(),
    lockedUntil: record.lockedUntil || 0,
  };

  if (nextRecord.count >= MAX_LOGIN_FAILURES) {
    nextRecord.lockedUntil = Date.now() + LOGIN_WINDOW_MS;
  }

  loginAttempts.set(key, nextRecord);
}

function clearLoginFailures(key) {
  loginAttempts.delete(key);
}

function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function setSessionCookie(res, admin) {
  const token = createAuthToken(admin);
  res.cookie(TOKEN_COOKIE, token, getCookieOptions());
  return Date.now() + SESSION_DURATION_MS;
}

function invalidLogin(res, key) {
  recordLoginFailure(key);
  return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
}

const adminController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = normalizeEmail(email);
      const loginKey = getLoginKey(req, normalizedEmail);

      if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (isLoginLocked(loginKey)) {
        return res.status(429).json({ error: 'Too many failed login attempts. Try again in 15 minutes.' });
      }

      if (db.useFallback) {
        const fallbackEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'ansuraj1998rks@gmail.com');
        const fallbackPassword = process.env.ADMIN_PASSWORD || 'Ansu.raj@2003';
        if (normalizedEmail !== fallbackEmail || password !== fallbackPassword) {
          return invalidLogin(res, loginKey);
        }

        clearLoginFailures(loginKey);
        const expiresAt = setSessionCookie(res, { email: fallbackEmail });
        return res.json({ authenticated: true, expiresAt });
      }

      const existingAdmin = await Admin.getByEmail(normalizedEmail);
      if (!existingAdmin) {
        return invalidLogin(res, loginKey);
      }

      const passwordMatches = await Admin.verifyPassword(password, existingAdmin.password);
      if (!passwordMatches) {
        return invalidLogin(res, loginKey);
      }

      if (Admin.needsPasswordRehash(existingAdmin.password)) {
        await Admin.updatePassword(existingAdmin.email, password);
      }

      clearLoginFailures(loginKey);
      const expiresAt = setSessionCookie(res, existingAdmin);
      return res.json({ authenticated: true, expiresAt });
    } catch (error) {
      console.error('Admin login failed:', error);
      res.status(500).json({ error: 'Unable to authenticate admin' });
    }
  },

  logout: (req, res) => {
    res.clearCookie(TOKEN_COOKIE, getCookieOptions());
    res.json({ success: true });
  },

  session: (req, res) => {
    if (!req.admin) {
      return res.status(401).json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      admin: { email: req.admin.sub },
      expiresAt: getSessionExpiry(req.admin),
    });
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
      }
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
          error: 'New password must be at least 12 characters and include uppercase, lowercase, number, and symbol.',
        });
      }
      if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'New password must be different from the current password' });
      }

      if (db.useFallback) {
        const fallbackPassword = process.env.ADMIN_PASSWORD || 'Ansu.raj@2003';
        if (currentPassword !== fallbackPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        process.env.ADMIN_PASSWORD = newPassword;
        const expiresAt = setSessionCookie(res, { email: req.admin.sub });
        return res.json({ success: true, expiresAt });
      }

      const admin = await Admin.getByEmail(req.admin.sub);
      if (!admin) {
        return res.status(401).json({ error: 'Admin account not found' });
      }

      const passwordMatches = await Admin.verifyPassword(currentPassword, admin.password);
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      await Admin.updatePassword(admin.email, newPassword);
      const expiresAt = setSessionCookie(res, admin);
      return res.json({ success: true, expiresAt });
    } catch (error) {
      console.error('Change password failed:', error);
      res.status(500).json({ error: 'Unable to change password' });
    }
  },
};

module.exports = adminController;
