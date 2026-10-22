# WebSocket Chat Server

This is a Node.js service that opens a WebSocket server at http://localhost:8080 allowing real-time messaging between clients.

## About
This server uses the repository pattern to seperate business logic and database queries into services and repositories respectively.   
Kysely is used for database connection pooling and query execution.  
Neverthrow is used to safely wrap throws and replace them with `Result<T, E>` to prevent runtime exceptions from uncaught throws.

The majority of the logic around WebSockets is contained within `src/index.ts`.

The WebSocket server uses a message format similar to JSON RPC
```
{
    "method": string,
    "params": string[]
}
```

The `method` field is used to describe the message action, and params can be used to pass arguments and results.

The WebSocket server accepts messages with the following methods:
 - `authenticate` - Authenticate a client based on the username and passcode provided
 - `get_all_channels` - Gets all channels for an authenticated user
 - `get_channel_messages` - Gets all messages in a specified channel for an authenticated user
 - `send_message` - Allows an authenticated user to send a message to a channel
 - `create_channel` - Allows an authenticated user to create a channel

The WebSocket server responds with messages containing the following methods:
 - `authentication_failed` - Authentication failed
 - `authentication_successful` - Authentication successful
 - `channels_list` - Returns all channels
 - `channel_messages` - Returns all messages in a channel
 - `new_message` - Sends the new message details to all connected clients
 - `new_channel` - Sends the new channel details to all connected clients

### Example communications
1. Client connects to WebSocket server.

2. Client sends `authenticate` message with username and passcode

3. Server checks credentials against the database  
3.1 Authentication successful, move to step 4  
3.2 Authentication failed, return to step 2

4. Client sends `get_all_channels` message
5. Server responds with `channels_list` message, providing all channels created

6. Client selects a channel, sending `get_channel_messages` message
7. Server responds with `channel_messages` message, providing all messages that have been sent to the selected channel

8. Client sends a message to the channel, sending `send_message` message to the server
9. Server inserts the new message into the database, and sends `new_message` message to all connected clients


## Setup

### Prerequisites

The following environment variables are expected in a `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/db?sslmode=disable
```

The server utilises Postgres, which can be initialised and run with after the `.env` file has been created
```
docker compose up
```

The database migrations need to be run once Postgres is running
```
npx dbmate up
```

This will seed two users into the database to allow usage from a client:

```
Username: alice  
Passcode: 1234

Username: bob  
Passcode: 4242
```

Install the required dependencies
```
npm install
```

### Running
Build the service
```
npm run build
```

Run the service
```
npm run start
```