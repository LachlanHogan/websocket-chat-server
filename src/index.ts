import { WebSocketServer, WebSocket } from "ws";
import { parseMessage, type WebSocketMessage } from "./messages.ts";
import type { User } from "./repositories/UsersRepository.ts";
import { UsersService } from "./services/UsersService.ts";
import { ChannelsService } from "./services/ChannelsService.ts";
import { MessagesService } from "./services/MessagesService.ts";

class UserAuthenticatedWebSocket extends WebSocket {
  user?: User;
}

const usersService = new UsersService();
const channelsService = new ChannelsService();
const messagesService = new MessagesService();

const openConnections = new Map<string, UserAuthenticatedWebSocket>();

const server = new WebSocketServer({ port: 8080 });

server.on("connection", (ws: UserAuthenticatedWebSocket, request) => {
  console.log("[Server] Client connected");

  ws.addEventListener("message", async (event) => {
    const messageData = event.data;

    if (typeof messageData !== "string") {
      console.error(
        "[Server] WebSocket message uses unsupported format. String expected",
      );
      return;
    }

    const messageResult = parseMessage(messageData);
    if (messageResult.isErr()) {
      console.error(
        "[Server] WebSocket message was not parsed successfully",
        messageResult.error,
      );
      return;
    }

    const message = messageResult.value;
    switch (message.method) {
      case "authenticate": {
        const [username, passcode] = message.params;
        if (
          typeof username === "undefined" ||
          typeof passcode === "undefined"
        ) {
          console.error(
            "[Server] Expected parameters were not provided",
            message.params,
          );
          return;
        }

        const authResult = await usersService.authenticateUser(
          username,
          passcode,
        );
        if (authResult.isErr()) {
          const authFailed: WebSocketMessage = {
            method: "authentication_failed",
            params: [],
          };
          ws.send(JSON.stringify(authFailed));
          return;
        }

        const user = authResult.value;
        ws.user = user;
        openConnections.set(user.id, ws);

        const authenticated: WebSocketMessage = {
          method: "authentication_successful",
          params: [],
        };
        ws.send(JSON.stringify(authenticated));

        break;
      }
      case "get_all_channels": {
        if (typeof ws.user === "undefined") {
          return;
        }

        const channelsResult = await channelsService.getAllChannels();
        if (channelsResult.isErr()) {
          console.error(
            "[Server] Get all channels failed",
            channelsResult.error,
          );

          return;
        }

        const allChannelsMessage: WebSocketMessage = {
          method: "channels_list",
          params: channelsResult.value.map((channel) =>
            JSON.stringify(channel),
          ),
        };
        ws.send(JSON.stringify(allChannelsMessage));

        break;
      }
      case "get_channel_messages": {
        if (typeof ws.user === "undefined") {
          return;
        }

        const [channelId] = message.params;
        if (typeof channelId === "undefined") {
          console.error(
            "[Server] Expected parameters were not provided for message 'get_channel_messages'",
            message.params,
          );
          return;
        }

        const messagesResult =
          await messagesService.getChannelMessages(channelId);
        if (messagesResult.isErr()) {
          console.error(
            "[Server] Get channel messages failed",
            messagesResult.error,
          );

          return;
        }

        const channelMessages: WebSocketMessage = {
          method: "channel_messages",
          params: messagesResult.value.map((message) =>
            JSON.stringify(message),
          ),
        };
        ws.send(JSON.stringify(channelMessages));

        break;
      }
      case "send_message": {
        if (typeof ws.user === "undefined") {
          return;
        }

        const [channelId, messageContents] = message.params;
        if (
          typeof channelId === "undefined" ||
          typeof messageContents === "undefined"
        ) {
          console.error(
            "[Server] Expected parameters were not provided for message 'send_message'",
            message.params,
          );
          return;
        }

        const sentMessageResult = await messagesService.sendMessage(
          channelId,
          ws.user.id,
          messageContents,
        );
        if (sentMessageResult.isErr()) {
          console.error(
            "[Server] Send message to channel failed",
            sentMessageResult.error,
          );
          return;
        }

        const newMessage: WebSocketMessage = {
          method: "new_message",
          params: [JSON.stringify(sentMessageResult.value)],
        };

        for (const websocket of openConnections.values()) {
          websocket.send(JSON.stringify(newMessage));
        }

        break;
      }
      case "create_channel": {
        if (typeof ws.user === "undefined") {
          return;
        }

        const [channelName] = message.params;
        if (typeof channelName === "undefined") {
          console.error(
            "[Server] Expected parameters were not provided for message 'create_channel'",
            message.params,
          );
          return;
        }

        const createChannelResult =
          await channelsService.createChannel(channelName);
        if (createChannelResult.isErr()) {
          console.error(
            "[Server] Create channel failed",
            createChannelResult.error,
          );
          return;
        }

        const newChannel: WebSocketMessage = {
          method: "new_channel",
          params: [JSON.stringify(createChannelResult.value)],
        };

        for (const websocket of openConnections.values()) {
          websocket.send(JSON.stringify(newChannel));
        }

        break;
      }
      default: {
        console.error("[Server] Unhandled message received", message);
      }
    }
  });

  ws.addEventListener("error", (e) => {
    console.error("[Server] WebSocket error:", e);
  });

  ws.addEventListener("close", (e) => {
    console.log("[Server] Connection closed:", e.code, e.reason);

    if (typeof ws.user !== "undefined") {
      openConnections.delete(ws.user.id);
    }
  });
});
