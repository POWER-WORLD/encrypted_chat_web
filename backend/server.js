const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});

// --- SOCKET.IO IMPLEMENTATION ---
const io = require('socket.io')(server, {
  pingTimeout: 60000, 
  cors: {
    origin: "*", // In production, replace with your frontend URL
  },
});

io.on('connection', (socket) => {
  console.log('CONNECTED_TO_SOCKET_SERVICE');

  // 1. Setup: User joins their own private room based on their ID
  socket.on('setup', (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    console.log(`USER_NODE_LINKED: ${userData._id}`);
    socket.emit('connected');
  });

  // 2. Join Chat: User joins a specific chat room
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log(`UPLINK_ESTABLISHED_WITH_ROOM: ${room}`);
  });

  // 3. Typing Indicators (Optional but cool for your theme)
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  // 4. New Message Handling
  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("ERROR: CHAT_USERS_NOT_DEFINED");

    chat.users.forEach((user) => {
      // Don't send the message back to the sender
      if (user._id === newMessageReceived.sender._id) return;

      // Emit to the specific user's private ID room
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  // 5. Cleanup
  socket.off('setup', () => {
    console.log('USER_DISCONNECTED');
    socket.leave(userData._id);
  });
});
