import { Injectable } from '@nestjs/common';
// import { speakeasy } from 'speakeasy';


// @Injectable()
// export class TwoFAService {
//   generate2FAsecret(login: any) {
//     const secret = speakeasy.generateSecret({
//       name: `ByteScrum Custom App:${login}`,
//     });
//     return secret.base32;
//   }

//   generate2FAToken(secret: string) {
//     return speakeasy.totp({
//       secret,
//       encoding: 'base32',
//     });
//   }

//   validate2FaToken(token: string, secret: string) {
//     return speakeasy.totp.verify({
//       secret,
//       encoding: 'base32',
//       token,
//       window: 1,
//     });
//   }
// }
