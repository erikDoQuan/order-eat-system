import * as jwt from 'jsonwebtoken';

export function createToken(payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret, options?: jwt.SignOptions) {
  return jwt.sign(payload, secretOrPrivateKey, { algorithm: 'HS256', ...options });
}
