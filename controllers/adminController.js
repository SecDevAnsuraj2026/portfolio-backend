const {
  createAuthToken,
  getCookieClearOptions,
  getCookieOptions,
  SESSION_DURATION_MS,
  TOKEN_COOKIE,
} = require('../middleware/authMiddleware');

const INVALID_LOGIN_MESSAGE = 'Invalid admin credentials';
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const loginAttempts = new Map();

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD).trim();

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

function setSessionCookie(res, email) {
  const token = createAuthToken({ email });
  res.cookie(TOKEN_COOKIE, token, getCookieOptions());
  return {
    token,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
}

function invalidLogin(res, key) {
  recordLoginFailure(key);
  return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
}

function setNoStoreHeaders(res) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    Pragma: 'no-cache',
    Expires: '0',
  });
}

const adminController = {
  login: (req, res) => {
    try {
      setNoStoreHeaders(res);
      const { email, password } = req.body;
      const normalizedEmail = normalizeEmail(email);
      const loginKey = getLoginKey(req, normalizedEmail);

      if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (isLoginLocked(loginKey)) {
        return res.status(429).json({ error: 'Too many failed login attempts. Try again in 15 minutes.' });
      }

      if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return invalidLogin(res, loginKey);
      }

      clearLoginFailures(loginKey);
      const session = setSessionCookie(res, ADMIN_EMAIL);
      console.log('[ADMIN LOGIN] Successful login for:', ADMIN_EMAIL);
      return res.json({ authenticated: true, expiresAt: session.expiresAt, token: session.token });
    } catch (error) {
      console.error('[ADMIN LOGIN ERROR]', error.message);
      res.status(500).json({ error: 'Unable to authenticate admin' });
    }
  },

  logout: (req, res) => {
    setNoStoreHeaders(res);
    res.clearCookie(TOKEN_COOKIE, getCookieClearOptions());
    console.log('[ADMIN LOGOUT] User logged out');
    res.json({ success: true });
  },

  session: (req, res) => {
    setNoStoreHeaders(res);
    if (!req.admin) {
      return res.status(401).json({ authenticated: false });
    }

    const session = setSessionCookie(res, req.admin.sub);
    return res.json({
      authenticated: true,
      admin: { email: req.admin.sub },
      expiresAt: session.expiresAt,
      token: session.token,
    });
  },
};

module.exports = adminController;
