/*
// JWT-AUTH GUARD -> Verifies user identity 
*/
// First login: through 42 OAuth. After that, it checks JWT in each request to
// keep the user logged in. It links our 42 OAuth with JWT, ensuring safe access
// to our app.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
