const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { todos } = require('../data/store');

let id = 1;

const router = express.Router();

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

router.get('/', authMiddleware, (req, res) => {
    const filter = req.query.filter;
    const userId = req.user.userId;

    const userTodos = todos.filter(t => t.userId === userId);

    let result = userTodos;
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

router.post('/', authMiddleware, (req, res) => {
    const { text, dueDate } = req.body;
    const userId = req.user.userId;

    if (!text) return res.status(400).json({ error: 'Text is required' });

    const newTodo = {
        id: id++,
        text,
        done: false,
        order: todos.length,
        dueDate,
        userId
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

router.put('/:id', authMiddleware, (req, res) => {
    const toDoId = parseInt(req.params.id);
    const { done, text } = req.body;
    const userId = req.user.userId;

    const todo = todos.find(t => t.id === toDoId && t.userId === userId);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    if (done !== undefined) todo.done = done;
    if (text !== undefined) todo.text = text;

    res.json(todo);
});

router.delete('/:id', authMiddleware, (req, res) => {
    const toDoId = parseInt(req.params.id);
    const userId = req.user.userId;

    const index = todos.findIndex(t => t.id === toDoId && t.userId === userId);
    if (index === -1) return res.status(404).json({ error: 'Todo not found' });

    todos.splice(index, 1);
    res.status(204).send();
});

router.put('/reorder', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const newOrder = req.body;

    newOrder.forEach(({ id, order }) => {
        const todo = todos.find(t => t.id === Number(id) && t.userId === userId);
        if (todo) {
            todo.order = order;
        } else {
            console.warn(`⚠️ Todo with id ${id} not found or unauthorized`);
        }
    });

    res.json({ success: true });
});

module.exports = router;