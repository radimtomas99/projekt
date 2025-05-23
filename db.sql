CREATE ROLE tvuj_username WITH
    LOGIN
    PASSWORD 'tvuj_password';

DROP DATABASE IF EXISTS swi125_db;

CREATE DATABASE swi125_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'cs-CZ'
    LC_CTYPE = 'cs-CZ'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

GRANT TEMPORARY, CONNECT ON DATABASE swi125_db TO PUBLIC;

GRANT ALL ON DATABASE swi125_db TO postgres;

GRANT ALL ON DATABASE swi125_db TO tvuj_username;

DROP TABLE IF EXISTS app_user;

CREATE TABLE app_user (
    user_id SERIAL       PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

ALTER TABLE app_user
    ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

ALTER TABLE public.app_user
    OWNER TO tvuj_username;

-- (run as postgres superuser)
CREATE SCHEMA app AUTHORIZATION tvuj_username;
GRANT USAGE, CREATE ON SCHEMA app TO tvuj_username;

-- ==============================
-- Schedule Event Table
-- ==============================

DROP TABLE IF EXISTS schedule_event CASCADE;

CREATE TABLE schedule_event (
    event_id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_color VARCHAR(50) NOT NULL, -- e.g., 'red', 'blue', 'green', 'yellow' or hex codes
    user_id INTEGER NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES app_user(user_id)
        ON DELETE CASCADE
);

ALTER TABLE public.schedule_event
    OWNER TO tvuj_username;

-- ==============================
-- File System Tables
-- ==============================

-- Folders Table
DROP TABLE IF EXISTS folders CASCADE;
CREATE TABLE folders (
    folder_id SERIAL PRIMARY KEY,
    folder_name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    CONSTRAINT fk_folder_user
        FOREIGN KEY(user_id) 
        REFERENCES app_user(user_id)
        ON DELETE CASCADE
);
ALTER TABLE public.folders OWNER TO tvuj_username;

-- Files Table
DROP TABLE IF EXISTS files CASCADE;
CREATE TABLE files (
    file_id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL, -- Original filename
    file_type VARCHAR(100) NOT NULL, -- Mime type (e.g., application/pdf, text/plain)
    user_id INTEGER NOT NULL,
    folder_id INTEGER NOT NULL,
    CONSTRAINT fk_file_user
        FOREIGN KEY(user_id) 
        REFERENCES app_user(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_file_folder
        FOREIGN KEY(folder_id) 
        REFERENCES folders(folder_id)
        ON DELETE CASCADE
);
ALTER TABLE public.files OWNER TO tvuj_username;
