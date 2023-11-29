/**
 * This file contains the tests for the AuthController in a NestJS application.
 *
 *? Testing Setup:
 * Utilizes NestJS's testing utilities to create a test environment.
 * The `Test.createTestingModule` method sets up the testing module with necessary controllers and services.
 *
 *? Test Cases:
 * Ensures that the AuthController is properly instantiated and defined.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
