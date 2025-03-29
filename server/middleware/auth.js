const jwt = require('jsonwebtoken');
const SECRET = 'supersecret';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
}

module.exports = { authMiddleware, SECRET };