INSERT INTO secret_match.roles (name)
VALUES ('admin'), ('user') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO secret_match.events (name, description, event_date, location)
VALUES (
  'Lord of the Rings Fellowship Dating Night',
  'Join fellow LOTR enthusiasts for a magical evening at the Green Dragon Inn. Discover your perfect match as you embark on an epic journey through conversation, trivia, and themed activities.',
  '2025-08-15 18:30:00',
  'Green Dragon Inn, Hobbiton, New Zealand'
);

-- pw: admin
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'admin',
  'admin@gmail.com',
  '$2b$12$zQLvC2wkL6t7k0h2ZraT9Osc3puC2jxQwNPAk9tRZZCs5lkuAqvN6',
  1,
  'System administrator',
  '{"theme": "dark", "notifications": "True"}'
);

-- pw: theonering
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Frodo Baggins',
  'frodo@shire.me',
  '$2b$12$zO/XVSz6OJAk5LZVj2WZiOsWXi/rs65ZOXQY78XAvu7Sd2LF3ijvy',
  2,
  'I will take the Ring to Mordor!',
  '{"favorite_food": "Lembas", "fear": "Nazgûl"}'
);

-- pw: andurilflame
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Aragorn',
  'aragorn@numenor.gov',
  '$2b$12$Wh02SsaJeTFMeF/M/t9iDOpNxIG7khaZpkRpbN8lpTuQsiey44Emu',
  2,
  'For Frodo.',
  '{"sword": "Andúril", "race": "Dúnedain"}'
);

-- pw: lightoftheevenstar
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Arwen Undómiel',
  'arwen@rivendell.org',
  '$2b$12$XYCJqXM7QNbYU4okmXB7B.jQEikr2ZFBSM/KURxgEgy6.hS1RqAqm',
  2,
  'I choose a mortal life.',
  '{"affiliation": "Elves", "magic": "True"}'
);

-- pw: secondbreakfast
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Samwise Gamgee',
  'samwise@hobbiton.net',
  '$2b$12$3H7LIsNFN2GQRdEnO8aar.wrGk6ODTHIQkl8Z1m1Ns6ptjzNdK4YO',
  2,
  'There''s some good in this world, Mr. Frodo.',
  '{"garden": "True", "loyalty": "Frodo"}'
);

-- pw: mithrandir123
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Gandalf the Grey',
  'gandalf@istari.org',
  '$2b$12$p4QfW38P4k47sTvirP7KIu/2Mo0CBrGJbg9c06yJw2TGzH6guIbVq',
  2,
  'A wizard is never late.',
  '{"staff": "Glamdring", "role": "guide"}'
);

-- pw: speakfriend
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Legolas',
  'legolas@woodlandrealm.el',
  '$2b$12$cA580FX0fe2otkrxxl9lq.eyD9UJysScXX0vWSmf7w.GvUly2A02q',
  2,
  'They''re taking the Hobbits to Isengard!',
  '{"bow": "Galadhrim", "race": "Elf"}'
);

-- pw: myprecious
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Gollum',
  'gollum@mountdoom.dark',
  '$2b$12$oBH7KDoTOdUtFb4Ww6TGFe9ojhrRA/gY35PH0/i9XVmp0/XQh2WK.',
  2,
  'We wants it, we needs it!',
  '{"split_personality": "True", "obsession": "the One Ring"}'
);

-- pw: khazaddum!
INSERT INTO secret_match.users (name, email, password, role_id, message, preferences)
VALUES (
  'Gimli',
  'gimli@erebor.dwf',
  '$2b$12$7ke4Zp8WwseV3TVnBAO5zOLKGWxnVaJiAnF3vAgOt5zJ8h8GMF3m.',
  2,
  'Nobody tosses a Dwarf!',
  '{"axe_type": "battle", "rival": "Legolas"}'
);

INSERT INTO secret_match.users_events (event_id, user_id) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9);