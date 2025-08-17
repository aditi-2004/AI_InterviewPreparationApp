const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();


connectDB();


app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

