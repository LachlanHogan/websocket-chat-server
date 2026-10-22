import type { DB } from "./../generated/db.d.ts";
import {
  type InsertQueryBuilder,
  Kysely,
  NoResultError,
  PostgresDialect,
  type SelectQueryBuilder,
} from "kysely";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { ResultAsync } from "neverthrow";
import { DatabaseError, NotFoundError } from "../errors.ts";

dotenv.config();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});

export async function takeFirst<T, TB extends keyof DB>(
  query: SelectQueryBuilder<DB, TB, T>,
): Promise<ResultAsync<T, DatabaseError | NotFoundError>> {
  return ResultAsync.fromPromise(
    query.executeTakeFirstOrThrow(),
    (err: unknown) => {
      if (err instanceof NoResultError) {
        return new NotFoundError(err.name);
      }

      return new DatabaseError(err);
    },
  );
}

export async function takeAll<T, TB extends keyof DB>(
  query: SelectQueryBuilder<DB, TB, T>,
): Promise<ResultAsync<T[], DatabaseError | NotFoundError>> {
  return ResultAsync.fromPromise(query.execute(), (err: unknown) => {
    if (err instanceof NoResultError) {
      return new NotFoundError(err.name);
    }

    return new DatabaseError(err);
  });
}

export async function insertOne<T, TB extends keyof DB>(
  query: InsertQueryBuilder<DB, TB, T>,
): Promise<ResultAsync<T, DatabaseError | NotFoundError>> {
  return ResultAsync.fromPromise(
    query.executeTakeFirstOrThrow(),
    (err: unknown) => {
      if (err instanceof NoResultError) {
        return new NotFoundError(err.name);
      }

      return new DatabaseError(err);
    },
  );
}
