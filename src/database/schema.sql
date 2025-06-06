CREATE SCHEMA IF NOT EXISTS secret_match;

CREATE TABLE IF NOT EXISTS secret_match.roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS secret_match.users (
  id       SERIAL        PRIMARY KEY,
  name     VARCHAR(100)  NOT NULL,
  email    VARCHAR(200)  NOT NULL UNIQUE,
  password VARCHAR(255)  NOT NULL,
  role_id  INTEGER       NOT NULL,
  message TEXT,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    REFERENCES secret_match.roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE secret_match.matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES secret_match.users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES secret_match.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate matches and self-matches
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id),
    CONSTRAINT no_self_match CHECK (user1_id != user2_id)
);


CREATE TABLE IF NOT EXISTS secret_match.events (
  id           SERIAL        PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  description  TEXT,
  event_date   TIMESTAMP     NOT NULL,
  location     VARCHAR(255),
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS secret_match.users_events (
  user_id      INTEGER       NOT NULL
                 REFERENCES secret_match.users(id)
                   ON UPDATE CASCADE
                   ON DELETE CASCADE,
  event_id     INTEGER       NOT NULL
                 REFERENCES secret_match.events(id)
                   ON UPDATE CASCADE
                   ON DELETE CASCADE,
  registered_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

CREATE TABLE secret_match.matches (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES secret_match.events(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL DEFAULT 1,
    user1_id INTEGER NOT NULL REFERENCES secret_match.users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES secret_match.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Normalize user IDs to avoid (A,B) vs (B,A) duplicates
    user_min_id INTEGER GENERATED ALWAYS AS (LEAST(user1_id, user2_id)) STORED,
    user_max_id INTEGER GENERATED ALWAYS AS (GREATEST(user1_id, user2_id)) STORED,

    -- Prevent self-matches
    CONSTRAINT no_self_match CHECK (user1_id != user2_id),

    -- Unique match per round
    CONSTRAINT unique_match_per_round UNIQUE (event_id, round_number, user_min_id, user_max_id)
);