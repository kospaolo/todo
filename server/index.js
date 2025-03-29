const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let todos = [];
let id = 1;

app.get("/api/todos", (req, res) => {
    const filter = req.query.filter;
    let result = todos;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (filter === "done") {
        result = todos.filter(t => t.done);
    } else if (filter === "active") {
        result = todos.filter(t => !t.done);
    } else if (filter === "today") {
        result = todos.filter(t => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return isSameDay(due, today);
        });
    } else if (filter === "week") {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);

        result = todos.filter(t => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return due >= today && due <= endOfWeek;
        });
    }

    result = result.slice().sort((a, b) => a.order - b.order);
    res.json(result);
});

app.post("/api/todos", (req, res) => {
    const { text, dueDate } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const newTodo = {
        id: id++,
        text,
        done: false,
        order: todos.length,
        dueDate
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
})

app.delete("/api/todos/:id", (req, res) => {
    const todoId = parseInt(req.params.id);
    todos = todos.filter((t) => t.id !== todoId);
    res.status(204).send();
});

app.put("/api/todos/reorder", (req, res) => {
    const newOrder = req.body;

    newOrder.forEach(({ id, order }) => {
        const todo = todos.find(t => t.id === Number(id));
        if (todo) {
            todo.order = order;
        } else {
            console.warn(`⚠️ Todo with id ${id} not found`);
        }
    });

    res.json({ success: true });
});

app.put("/api/todos/:id", (req, res) => {
    const toDoId = parseInt(req.params.id);
    const { done, text } = req.body;

    const todo = todos.find(t => t.id === toDoId);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    if (done !== undefined) todo.done = done;
    if (text !== undefined) todo.text = text

    res.json(todo);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));