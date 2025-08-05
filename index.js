require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const serverless = require('serverless-http'); 
const postRoutes = require('./routes/posts.js');
const commentRoutes = require('./routes/comments.js');
const favoritesRoutes = require('./routes/favorites.js')
const userRoutes = require("./routes/users.js")

const app = express();
app.use(cors());
app.use(express.json());

app.use("/favorites", favoritesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/profiles', userRoutes);

module.exports = app; // 👈 Export et
module.exports.handler = serverless(app); 