import { hash } from "bcrypt";

const SALT_ROUNDS = 10;

// Un solo lugar para hashear — si en algún momento migran a Bun.password,
// solo se toca este archivo.
export async function hashPassword(plain: string) {
  return hash(plain, SALT_ROUNDS);
}