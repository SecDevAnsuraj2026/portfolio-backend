const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'portfolioAdminSession';
const SESSION_DURATION_MS = 30 * 60 * 1000;
const JWT_ISSUER = 'portfolio-api';
const JWT_AUDIENCE = 'portfolio-admin';

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'dev-only-portfolio-secret-change-me';
}

function getTokenFromRequest(req) {
  const tokenFromCookie = req.cookies?.[TOKEN_COOKIE];
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

function requireAdmin(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Admin authorization required' });
    }

    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    console.error('Admin auth failure:', error.message);
    return res.status(401).json({ error: 'Admin authorization required' });
  }
}

function createAuthToken(admin) {
  const payload = {
    sub: admin.email,
    role: 'admin',
  };

  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    audience: JWT_AUDIENCE,
    expiresIn: Math.floor(SESSION_DURATION_MS / 1000),
    issuer: JWT_ISSUER,
  });
}

function getSessionExpiry(decoded) {
  return decoded?.exp ? decoded.exp * 1000 : Date.now() + SESSION_DURATION_MS;
}

function getCookieOptions() {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  };
}

function getCookieClearOptions() {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
  };
}

module.exports = {
  requireAdmin,
  createAuthToken,
  getCookieOptions,
  getCookieClearOptions,
  getSessionExpiry,
  SESSION_DURATION_MS,
  TOKEN_COOKIE,
};
