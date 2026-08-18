import type { CreateUserDTO } from "shared";
import type { UserRepository } from "./users.repository";
import { hash } from "bcrypt";

export function createUserService(repo: UserRepository) {
  return {
    async registerUser(input: CreateUserDTO) {
      const existing = await repo.findByEmail(input.email);
      if (existing) throw new ConflictError("Email ya está en uso");

      const hashed = await hash(input.password, 10);
      return repo.create({ ...input, password: hashed });
    },
  };
}
