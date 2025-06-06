

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

-- Plaintext: admin - this can be used to assign roles
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('admin', 'admin@gmail.com', '$2b$12$WZRbdTfCjYp2Mz9jJtgssOPWm/6Jps5ZK/yWML/1TrhO2PITMZfhK', 1);

-- pw: theonering
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Frodo Baggins', 'frodo@shire.me', '$2b$12$nQxPbFXqBvZWWSD5xbFc/ePUTnwBp1eW29LAYiJ6CdN2xeJPQCCym', 2);

-- pw: andurilflame
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Aragorn', 'aragorn@numenor.gov', '$2b$12$BkczJ8mBkBjtb7.IrVhACe4uzETYCI6vyefEN5sCEcbigjN99ABDu', 2);

-- pw: lightoftheevenstar
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Arwen Undómiel', 'arwen@rivendell.org', '$2b$12$MCxJ2/cu8nA0B99EoACKnOlmCckt0YXz/L0fH6RDVi3XPYnB3GGKi', 2);

-- pw: secondbreakfast
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Samwise Gamgee', 'samwise@hobbiton.net', '$2b$12$wVNQ2voymo0cj0ObZsp2luYuJsAf/5gn46xpZ/xrDLsUJs2jofuCu', 2);

-- pw: mithrandir123
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Gandalf the Grey', 'gandalf@istari.org', '$2b$12$rcmP/Fiowt.pZxAvx1s4SujyDK8ZclfgfaZtM6Asr1DqaLShzCjFm', 2);

-- pw: speakfriend
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Legolas', 'legolas@woodlandrealm.el', '$2b$12$3HV3E0X9oJ9aQ2lwXQDBZOJMR.UNGh/lbc69QR/4U2S.hQrrmRAe6', 2);

-- pw: myprecious
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Gollum', 'gollum@mountdoom.dark', '$2b$12$C.SxWWRugUzP8rviabGQBuY0XzCieRfelGu6AHKl4n68mutjZ6r6i', 2);

-- pw: khazaddum!
INSERT INTO secret_match.users (name, email, password, role_id)
VALUES ('Gimli', 'gimli@erebor.dwf', '$2b$12$Snc3GO/fsRadSKewux9kWuQH4UsomHO1zdU3KU3o0VVhvSmVz56Fe', 2);


INSERT INTO secret_match.users_events (event_id, user_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8);