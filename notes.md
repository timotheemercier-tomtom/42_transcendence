### USER

```typescript
class User {
  id: number;
  username: string;
  login: string;
  picture: string;
}
```

* PROPERTIES 
`userRepository: Repository<User>`

* FIND USER BY USER NAME
`async findUser(username: string): Promise<User | null> `

* CREATE USER
`async createUser(userData: Partial<User>): Promise<User>`

* UPDATE USER 
`async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User>`


const { Injectable, UnauthorizedException } = require('@nestjs/common');
const { PassportStrategy } = require('@nestjs/passport');
const { Strategy } = require('passport-custom');
const speakeasy = require('speakeasy');

@Injectable()
class GoogleAuthenticatorStrategy extends PassportStrategy(Strategy, 'google-authenticator') {
  constructor() {
    super();
  }

  async validate(req) {

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }


    if (!user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException('2FA not enabled');
    }


    const token = req.body.token; 


    const isValidToken = this.validateTwoFactorToken(token, user.twoFactorAuthenticationSecret);

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    return user;
  }

  validateTwoFactorToken(token, secret) {

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, 
    });
  }
}

module.exports = GoogleAuthenticatorStrategy;
