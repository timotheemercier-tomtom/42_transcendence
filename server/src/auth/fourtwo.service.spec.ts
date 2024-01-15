/**
 * This file contains a unit test for the AuthService in a NestJS application.
 * It tests whether the AuthService is defined.
 *
 *? Test Module Setup:
 * Uses NestJS TestingModule to set up a testing environment.
 * Initializes the AuthService as a testing provider.
 *
 *? Test Case:
 * The test case checks if the AuthService is defined.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { FourTwoService } from './fourtwo.service';

describe('FourTwoService', () => {
  let service: FourTwoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FourTwoService],
    }).compile();

    service = module.get<FourTwoService>(FourTwoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
