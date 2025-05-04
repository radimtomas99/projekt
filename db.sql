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