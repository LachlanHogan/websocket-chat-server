-- migrate:up
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) NOT NULL,
    passcode CHAR(4) NOT NULL
);

CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL
);

CREATE TABLE channel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    contents TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMPTZ
);

INSERT INTO users ("id", "username", "passcode") VALUES (gen_random_uuid(), 'alice', '1234');
INSERT INTO users ("id", "username", "passcode") VALUES (gen_random_uuid(), 'bob', '4242');

-- migrate:down
DROP TABLE channel_messages;
DROP TABLE channels;
DROP TABLE users;