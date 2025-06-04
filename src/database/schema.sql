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
  role_id  INTEGER       NOT NULL
    REFERENCES secret_match.roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);


// insertion of lookup table ( avoid duplicates when inserting)
INSERT INTO secret_match.roles (name)
VALUES ('admin'), ('user') 
ON CONFLICT (name) DO NOTHING;