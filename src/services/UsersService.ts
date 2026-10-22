import type { Kysely } from "kysely";
import type { DB } from "../generated/db.js";
import { db } from "../repositories/db.ts";
import { err, ok, type ResultAsync } from "neverthrow";
import { UsersRepository, type User } from "../repositories/UsersRepository.ts";
import { DatabaseError, NotFoundError } from "../errors.ts";

export class UsersService {
  private db: Kysely<DB>;

  constructor() {
    this.db = db;
  }

  async getUserById(
    id: string,
  ): Promise<ResultAsync<User, DatabaseError | NotFoundError>> {
    return await UsersRepository.findById(this.db, id);
  }

  async authenticateUser(
    username: string,
    passcode: string,
  ): Promise<ResultAsync<User, DatabaseError | NotFoundError>> {
    const userResult = await UsersRepository.findByCredentials(
      this.db,
      username,
    );

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const user = userResult.value;
    if (user.passcode !== passcode) {
      return err(new NotFoundError("Matching credentials could not be found"));
    }

    return ok(user);
  }
}
