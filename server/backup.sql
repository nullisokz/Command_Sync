-- I TERMINALEN:
-- psql -U postgres -d postgres -f backup.sql
-- createdb -U postgres mydb_from_backup
-- psql -U postgres -d mydb_from_backup -f backup.sql


--
-- PostgreSQL database dump
--

\restrict tRfqE7MF4Frce5TZaFqTlEArAfExZ5xkfpT3AGYBHddxH7uRfLpklddtj56TXA0

-- Dumped from database version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)
-- Dumped by pg_dump version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions (
    id integer NOT NULL,
    title character varying NOT NULL
);


ALTER TABLE public.actions OWNER TO postgres;

--
-- Name: actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.actions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: actions_x_commands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions_x_commands (
    action_id integer NOT NULL,
    command_id integer NOT NULL
);


ALTER TABLE public.actions_x_commands OWNER TO postgres;

--
-- Name: commands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commands (
    id integer NOT NULL,
    description character varying NOT NULL,
    code character varying NOT NULL
);


ALTER TABLE public.commands OWNER TO postgres;

--
-- Name: commands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.commands ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.commands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    fname character varying NOT NULL,
    lname character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actions (id, title) FROM stdin;
1	Add changes and push to git branch
2	Create dotnet minimal API
\.


--
-- Data for Name: actions_x_commands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actions_x_commands (action_id, command_id) FROM stdin;
1	1
1	2
1	3
2	5
2	6
2	7
2	8
2	9
2	10
2	11
\.


--
-- Data for Name: commands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commands (id, description, code) FROM stdin;
1	add files to git commit	git add
3	push changes to branch	git push origin your-branch
2	commit changes for staging	git commit -m"your message"
5	Create a folder for app	mkdir AppName
6	Step into App folder	cd AppName
7	Create web app from template	dotnet new web -n AppServer
8	Step into web app folder	cd AppServer
9	Restore dependecies	dotnet restore
10	Build Project	dotnet build
11	Run application	dotnet run
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, fname, lname) FROM stdin;
1	Oskar	Krantz
2	Daniel	Theoren
\.


--
-- Name: actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actions_id_seq', 2, true);


--
-- Name: commands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commands_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: actions actions_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_unique UNIQUE (id);


--
-- Name: commands commands_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_pk PRIMARY KEY (id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id);


--
-- Name: actions_x_commands actions_x_commands_actions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions_x_commands
    ADD CONSTRAINT actions_x_commands_actions_fk FOREIGN KEY (action_id) REFERENCES public.actions(id);


--
-- Name: actions_x_commands actions_x_commands_commands_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions_x_commands
    ADD CONSTRAINT actions_x_commands_commands_fk FOREIGN KEY (command_id) REFERENCES public.commands(id);


--
-- PostgreSQL database dump complete
--

\unrestrict tRfqE7MF4Frce5TZaFqTlEArAfExZ5xkfpT3AGYBHddxH7uRfLpklddtj56TXA0

