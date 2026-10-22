import type { Kysely } from "kysely";
import type { DB } from "../generated/db.js";
import { db } from "../repositories/db.ts";
import {
  ChannelsRepository,
  type Channel,
} from "../repositories/ChannelsRepository.ts";
import type { ResultAsync } from "neverthrow";
import type { DatabaseError, NotFoundError } from "../errors.ts";

export class ChannelsService {
  private db: Kysely<DB>;

  constructor() {
    this.db = db;
  }

  async getAllChannels(): Promise<
    ResultAsync<Channel[], DatabaseError | NotFoundError>
  > {
    return await ChannelsRepository.findAll(this.db);
  }

  async createChannel(
    channelName: string,
  ): Promise<ResultAsync<Channel, DatabaseError | NotFoundError>> {
    return await ChannelsRepository.createChannel(this.db, channelName);
  }
}
