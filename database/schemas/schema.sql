CREATE TABLE IF NOT EXISTS scores (
  discord_id VARCHAR(255) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  last_played DATETIME NOT NULL,
  times_played INT NOT NULL DEFAULT 1,
  PRIMARY KEY (discord_id)
);