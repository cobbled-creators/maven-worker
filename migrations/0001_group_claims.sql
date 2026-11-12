-- Migration number: 0000 	 2026-07-03T16:00:00.000Z
CREATE TABLE IF NOT EXISTS groups (
    name TEXT PRIMARY KEY,
	discord_id TEXT
);
