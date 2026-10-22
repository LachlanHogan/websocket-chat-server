import { err, ok, type Result } from "neverthrow";

export type WebSocketMessage = {
  method: string;
  params: string[];
};

export type MessageView = {
  id: string;
  userId: string;
  channelId: string;
  username: string;
  messageContents: string;
  sentAt: string;
};

export function parseMessage(json: string): Result<WebSocketMessage, Error> {
  try {
    return ok(JSON.parse(json));
  } catch (error: unknown) {
    if (error instanceof Error) {
      return err(error);
    } else {
      console.error("Unexpected parsing error:", error);
      return err(new Error("Unexpected parsing error"));
    }
  }
}
