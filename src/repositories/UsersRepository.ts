import { ResultAsync } from "neverthrow";
import { takeFirst } from "./db.ts";
import type { DB } from "../generated/db.js";
import {
  Kysely,
  type Insertable,
  type Selectable,
  type Updateable,
} from "kysely";
import type { DatabaseError, NotFoundError } from "../errors.ts";

export type User = Selectable<DB["users"]>;
export type CreateUser = Insertable<DB["users"]>;
export type UpdateUser = Updateable<DB["users"]>;

export class UsersRepository {
  static async findById(
    db: Kysely<DB>,
    id: string,
  ): Promise<ResultAsync<User, DatabaseError | NotFoundError>> {
    return takeFirst(db.selectFrom("users").selectAll().where("id", "=", id));
  }

  static async findByCredentials(
    db: Kysely<DB>,
    username: string,
  ): Promise<ResultAsync<User, DatabaseError | NotFoundError>> {
    return takeFirst(
      db.selectFrom("users").selectAll().where("username", "=", username),
    );
  }
}
