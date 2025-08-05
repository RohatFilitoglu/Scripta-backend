require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <== CORS modülünü ekliyoruz
app.use(cors({
  origin: function(origin, callback) {
    // CORS isteklerinde origin olmayabilir (örneğin curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const postRoutes = require('./routes/posts.js');
const commentRoutes = require('./routes/comments.js');
const favoritesRoutes = require('./routes/favorites.js');
const userRoutes = require("./routes/users.js");

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://scripta-frontend-sand.vercel.app'
];

app.options('*', cors());

app.use(express.json());

app.use("/favorites", favoritesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/profiles', userRoutes);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
});
