import type { Kysely } from "kysely";
import type { DB } from "../generated/db.js";
import { db } from "../repositories/db.ts";
import { err, ResultAsync } from "neverthrow";
import {
  MessagesRepository,
  type Message,
} from "../repositories/MessagesRepository.ts";
import { NotFoundError, type DatabaseError } from "../errors.ts";
import type { MessageView } from "../messages.ts";
import { UsersRepository } from "../repositories/UsersRepository.ts";

export class MessagesService {
  private db: Kysely<DB>;

  constructor() {
    this.db = db;
  }

  async getChannelMessages(
    channelId: string,
  ): Promise<ResultAsync<MessageView[], DatabaseError | NotFoundError>> {
    const channelMessages = await MessagesRepository.findByChannelId(
      this.db,
      channelId,
    );

    return channelMessages.map((allMessages) => {
      return allMessages.map((m) => ({
        id: m.id,
        userId: m.user_id,
        channelId: m.channel_id,
        username: m.username,
        messageContents: m.contents,
        sentAt: m.sent_at.toISOString(),
      }));
    });
  }

  async sendMessage(
    channelId: string,
    userId: string,
    messageContents: string,
  ): Promise<ResultAsync<MessageView, DatabaseError | NotFoundError>> {
    const newMessage = await MessagesRepository.createChannelMessage(
      this.db,
      channelId,
      userId,
      messageContents,
    );

    const user = await UsersRepository.findById(this.db, userId);
    if (user.isErr()) {
      console.error("[Server] User could not be found from ID");
      return err(new NotFoundError(user.error));
    }

    return newMessage.map((m) => ({
      id: m.id,
      userId: m.user_id,
      channelId: m.channel_id,
      username: user.value.username,
      messageContents: m.contents,
      sentAt: m.sent_at.toISOString(),
    }));
  }
}
