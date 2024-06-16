import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload size limit
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  app.use(cookieParser());

  app.enableCors({
    // origin: 'http://localhost:5173',
    origin: function (origin, callback) {
      callback(null, origin);
    },
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Augmenter la limite de taille du payload
//   app.use(bodyParser.json({ limit: '5mb' }));
//   app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
//   app.use(cookieParser());

//   app.enableCors({
//     origin: function (origin, callback) {
//       callback(null, origin);
//     },
//     credentials: true,
//   });

//   await app.listen(3000);
// }
// bootstrap();
