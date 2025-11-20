-- Skapa tabell för användare
CREATE TABLE users (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
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
    steporder  INTEGER NOT NULL, -- <<-- NY KOLUMN FÖR ORDNINGEN
    PRIMARY KEY (command_id, action_id),
    CONSTRAINT fk_actions_x_commands_command
      FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_actions_x_commands_action
      FOREIGN KEY (action_id)  REFERENCES actions(id)  ON DELETE CASCADE
);

CREATE TABLE public.users_x_actions (
	user_id int NOT NULL,
	actions_id int NOT NULL,
	CONSTRAINT users_x_actions_users_fk FOREIGN KEY (user_id) REFERENCES public.users(id),
	CONSTRAINT users_x_actions_actions_fk FOREIGN KEY (actions_id) REFERENCES public.actions(id)
);

-- (Valfritt) Lägg in lite testdata
INSERT INTO users (name, password) VALUES ('Viktor', 'DT123'), ('Oskar', 'EJ123');

INSERT INTO categories (title)
VALUES
('git'),
('docker'),
('dotnet'),
('react');

INSERT INTO actions (title, category) VALUES
  ('add changes and push to git branch', 1),
  ('create new branch', 1);

INSERT INTO commands (description, code) VALUES
  ('add files to git commit', 'git add'),
  ('commit changes for staging', 'git commit'),
  ('push changes to branch', 'git push');

INSERT INTO actions_x_commands (command_id, action_id, steporder) VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 1, 3);
