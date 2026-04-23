const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// user routes
app.use('/api/users', userRoutes);

//user error handling middleware
app.use(notFound);
app.use(errorHandler);

                                                                            

app.listen(PORT, () => {
  console.log(`Server is running on port:http://localhost:${PORT}`);
});