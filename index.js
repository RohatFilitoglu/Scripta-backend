require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const serverless = require('serverless-http');

const swaggerSpec = require('../swagger'); // <- dikkat: ../ kullandık çünkü api/ altındayız
const postRoutes = require('../routes/posts');
const commentRoutes = require('../routes/comments');
const favoritesRoutes = require('../routes/favorites');
const userRoutes = require('../routes/users');

const app = express();

app.use(cors({
  origin: ['https://scripta-frontend-sand.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// API route'larına `/api` prefix'i ekle (vercel öyle çalışıyor)
app.use('/api/favorites', favoritesRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/profiles', userRoutes);
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// export et
module.exports.handler = serverless(app);
