import { ResultAsync } from "neverthrow";
import { insertOne, takeAll, takeFirst } from "./db.ts";
import type { DB } from "../generated/db.js";
import {
  Kysely,
  type Insertable,
  type Selectable,
  type Updateable,
} from "kysely";
import type { DatabaseError, NotFoundError } from "../errors.ts";

export type Channel = Selectable<DB["channels"]>;
export type CreateChannel = Insertable<DB["channels"]>;
export type UpdateChannel = Updateable<DB["channels"]>;

export class ChannelsRepository {
  static async findById(
    db: Kysely<DB>,
    id: string,
  ): Promise<ResultAsync<Channel, DatabaseError | NotFoundError>> {
    return takeFirst(
      db.selectFrom("channels").selectAll().where("id", "=", id),
    );
  }

  static async findAll(
    db: Kysely<DB>,
  ): Promise<ResultAsync<Channel[], DatabaseError | NotFoundError>> {
    return takeAll(db.selectFrom("channels").selectAll());
  }

  static async createChannel(
    db: Kysely<DB>,
    channelName: string,
  ): Promise<ResultAsync<Channel, DatabaseError | NotFoundError>> {
    return insertOne(
      db.insertInto("channels").values({ name: channelName }).returningAll(),
    );
  }
}
