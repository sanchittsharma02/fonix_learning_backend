const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: { title: 'My API', description: 'Auto-generated Swagger docs' },
  host: 'localhost:1001',
  schemes: ['http'],
};

swaggerAutogen('./swagger-output.json', ['./index.js'], doc);
