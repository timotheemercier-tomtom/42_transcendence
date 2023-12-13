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
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, 
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
