/**
 * ? `main.ts`
 * The entry point of the NestJS application. It sets up and configures the NestJS app instance.
 *
 * - Initializes the NestJS application with the AppModule.
 * - Configures CORS (Cross-Origin Resource Sharing) settings for client-server communication.
 * - Uses cookie-parser middleware for handling cookies.
 * - Starts the application listening on a specified port.
 *
 * ? `bootstrap`
 * An asynchronous function that creates and configures the NestJS application.
 * - Sets CORS policy to allow requests from the specified client URL.
 * - Enables cookie parsing in the application.
 * - Listens on port 3000 for incoming connections.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Augmenter la limite de taille du payload
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

    app.enableCors({
      origin: ['http://localhost:5173'],

  //     origin: (origin, callback) => {
  //       // Autoriser les requêtes sans origine (comme les requêtes mobiles ou postman)
  //       if (!origin) return callback(null, true);

  //       // Vérifier si l'origine se termine par '.codam.nl' et utilise le port 5173
  //       if (origin.endsWith('.codam.nl:5173')) {
  //         callback(null, true);
  //       } else {
  //         callback(new Error('Not allowed by CORS'));
  //       }
  //     },
  //     credentials: true,
  //   });

//   app.enableCors({
//     origin: (origin, callback) => {
//       if (!origin || /.*\.codam\.nl(:5173)?$/.test(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
