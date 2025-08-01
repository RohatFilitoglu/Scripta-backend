const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",   
    info: {
      title: "Görev Yönetimi API",
      version: "1.0.0",
      description: "Basit bir görev yönetimi API'si dokümantasyonu"
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Yerel Geliştirme Sunucusu"
      }
    ],
  },
  apis: ["./routes/*.js", "./index.js"]  
};

const specs = swaggerJsdoc(options);

module.exports = specs;
