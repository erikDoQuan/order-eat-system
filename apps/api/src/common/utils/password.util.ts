import * as argon2 from 'argon2';

export async function hashPassword(plainTextPassword: string) {
  const result = await argon2.hash(plainTextPassword);
  return result;
}

export async function comparePassword(hash: string, plainTextPassword: string) {
  const isMatch = await argon2.verify(hash, plainTextPassword);
  return isMatch;
}

export async function checkValidPassword(hash: string, plainTextPassword: string) {
  const isValid = await comparePassword(hash, plainTextPassword);
  return isValid;
}
