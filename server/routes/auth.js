const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('../data/store');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, username, password: hashed };
    users.push(user);

    res.status(201).json({ message: 'User registered' });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
    res.json({ token });
});

module.exports = router;