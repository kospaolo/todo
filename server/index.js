const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const todoRoutes = require('./routes/todos');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));