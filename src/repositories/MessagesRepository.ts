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
import type { User } from "./UsersRepository.ts";

export type Message = Selectable<DB["channel_messages"]>;
export type CreateMessage = Insertable<DB["channel_messages"]>;
export type UpdateMessage = Updateable<DB["channel_messages"]>;

export class MessagesRepository {
  static async findById(
    db: Kysely<DB>,
    id: string,
  ): Promise<ResultAsync<Message, DatabaseError | NotFoundError>> {
    return takeFirst(
      db.selectFrom("channel_messages").selectAll().where("id", "=", id),
    );
  }

  static async findByChannelId(
    db: Kysely<DB>,
    channelId: string,
  ): Promise<
    ResultAsync<
      (Message & { username: string })[],
      DatabaseError | NotFoundError
    >
  > {
    return takeAll(
      db
        .selectFrom("channel_messages")
        .innerJoin("users", "users.id", "channel_messages.user_id")
        .orderBy("channel_messages.sent_at", "asc")
        .select([
          "channel_messages.id",
          "channel_messages.user_id",
          "channel_messages.channel_id",
          "channel_messages.contents",
          "channel_messages.sent_at",
          "channel_messages.edited_at",
          "users.username",
        ])
        .where("channel_id", "=", channelId),
    );
  }

  static async createChannelMessage(
    db: Kysely<DB>,
    channelId: string,
    userId: string,
    messageContents: string,
  ): Promise<ResultAsync<Message, DatabaseError | NotFoundError>> {
    return insertOne(
      db
        .insertInto("channel_messages")
        .values({
          channel_id: channelId,
          user_id: userId,
          contents: messageContents,
        })
        .returningAll(),
    );
  }
}
