const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const todoRoutes = require('./routes/todos');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/todos', todoRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));