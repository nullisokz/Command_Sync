-- Skapa tabell för användare
CREATE TABLE users (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE categories (
	id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar NOT NULL,
	CONSTRAINT categories_pk PRIMARY KEY (id)
);

-- Skapa tabell för actions
CREATE TABLE actions (
    id    SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category INTEGER,
    FOREIGN KEY (category) REFERENCES categories(id)
);

-- Skapa tabell för commands
CREATE TABLE commands (
    id          SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    code        TEXT NOT NULL
);

-- Kopplingstabell mellan actions och commands (many-to-many)
CREATE TABLE actions_x_commands (
    command_id INTEGER NOT NULL,
    action_id  INTEGER NOT NULL,
    PRIMARY KEY (command_id, action_id),
    CONSTRAINT fk_actions_x_commands_command
      FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_actions_x_commands_action
      FOREIGN KEY (action_id)  REFERENCES actions(id)  ON DELETE CASCADE
);

-- (Valfritt) Lägg in lite testdata
INSERT INTO users (name) VALUES ('Viktor'), ('Oskar');

INSERT INTO categories (title)
VALUES
('git'),
('docker'),
('dotnet'),
('react');

INSERT INTO actions (title) VALUES
  ('add changes and push to git branch'),
  ('create new branch');

INSERT INTO commands (description, code) VALUES
  ('add files to git commit', 'git add'),
  ('commit changes for staging', 'git commit'),
  ('push changes to branch', 'git push');

-- Koppla första actionen till alla tre commands
INSERT INTO actions_x_commands (command_id, action_id) VALUES
  (1, 1),
  (2, 1),
  (3, 1);
