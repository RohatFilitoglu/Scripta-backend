require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const serverless = require('serverless-http');

const swaggerSpec = require('./swagger');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const favoritesRoutes = require('./routes/favorites');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.json());

app.use('/favorites', favoritesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/profiles', userRoutes);

if (process.env.VITE_LOCAL === 'true') {
  // 🌐 LOCAL çalıştırmak için: .env dosyana LOCAL=true ekle
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  // 🚀 Vercel için export
  module.exports = app;
  module.exports.handler = serverless(app);
}
