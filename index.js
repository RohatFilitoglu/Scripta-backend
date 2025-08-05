require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // ✅ önce app tanımlanmalı!

const allowedOrigins = [
  'http://localhost:3000',
  'https://scripta-frontend-sand.vercel.app'
];

// ✅ CORS middleware düzgün tanımlanmalı
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const postRoutes = require('./routes/posts.js');
const commentRoutes = require('./routes/comments.js');
const favoritesRoutes = require('./routes/favorites.js');
const userRoutes = require("./routes/users.js");

// routes
app.use("/favorites", favoritesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/profiles', userRoutes);

// server start
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
});

module.exports = app;
