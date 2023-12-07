import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

require('dotenv').config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173', // Spécifiez l'URL de votre client
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true, // Important si vous utilisez des cookies/session
  });
  
  await app.listen(3000);
}
bootstrap();


// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors({
//     origin: 'http://localhost:3000',
//     credentials: true,
//   });;
//   app.use(cookieParser());
//   await app.listen(3000);
// }
// bootstrap();


