const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Todo = require('../models/Todo');

const router = express.Router();
router.use(authMiddleware);

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

router.get('/', authMiddleware, async (req, res) => {
    const filter = req.query.filter;
    let result = await Todo.find({userId: req.user.userId}).sort({order: 1});
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'done') {
        result = result.filter(t => t.done);
    } else if (filter === 'active') {
        result = result.filter(t => !t.done);
    } else if (filter === 'today') {
        result = result.filter(t => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return isSameDay(due, today);
        });
    } else if (filter === 'week') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        result = result.filter(t => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return due >= today && due <= endOfWeek;
        });
    }

    result = result.slice().sort((a, b) => a.order - b.order);
    res.json(result);
});

router.post('/', authMiddleware, async (req, res) => {
    const {text, dueDate} = req.body;
    const userId = req.user.userId;

    if (!text) return res.status(400).json({error: 'Text is required'});

    const newTodo = await Todo.create({
        text,
        dueDate,
        userId: req.user.userId,
        order: await Todo.countDocuments({userId: req.user.userId})
    });

    res.status(201).json(newTodo);
});

router.put('/reorder', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const newOrder = req.body;

    try {
        const bulkOps = newOrder.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id, userId },
                update: { $set: { order } }
            }
        }));

        await Todo.bulkWrite(bulkOps);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reorder todos' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const todoId = req.params.id;
    const { done, text } = req.body;
    const userId = req.user.userId;

    try {
        const todo = await Todo.findOne({ _id: todoId, userId });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (done !== undefined) todo.done = done;
        if (text !== undefined) todo.text = text;

        await todo.save();

        res.json(todo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const todoId = req.params.id;
    const userId = req.user.userId;

    try {
        const result = await Todo.findOneAndDelete({ _id: todoId, userId });

        if (!result) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;