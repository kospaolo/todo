const express = require('express');
const bcrypt = require('bcrypt');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Todo = require('../models/Todo');

const router = express.Router();

router.post('/change-password', authMiddleware, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated' });
});

router.delete('/delete-account', authMiddleware, async (req, res) => {
    await User.findByIdAndDelete(req.user.userId);
    await Todo.deleteMany({ userId: req.user.userId });
    res.json({ message: 'Account deleted' });
});

router.put('/change-username', authMiddleware, async (req, res) => {
    const { newUsername, password } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Password is incorrect' });

    const existing = await User.findOne({ username: newUsername });
    if (existing) return res.status(400).json({ message: 'Username already taken' });

    user.username = newUsername;
    await user.save();

    res.json({ message: 'Username updated successfully' });
});

module.exports = router;